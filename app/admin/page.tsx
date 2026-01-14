"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BotonVolver from "@/components/common/BotonesFlotantes/BotonVolver";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";

interface Acreditacion {
  id: number;
  responsable_nombre: string;
  responsable_apellido: string;
  responsable_email: string;
  responsable_telefono: string;
  responsable_rut: string;
  medio_id: number;
  medio?: { nombre: string };
  estado: "pendiente" | "aprobada" | "rechazada";
  created_at: string;
  acreditados_count?: number;
}

interface Acreditado {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface AcreditadoData {
  acreditacion_id: number;
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  aprobada: "bg-green-100 text-green-800 border-green-300",
  rechazada: "bg-red-100 text-red-800 border-red-300",
};

interface User {
  id: string;
  email?: string;
  role?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [acreditaciones, setAcreditaciones] = useState<Acreditacion[]>([]);
  const [filteredAcreditaciones, setFilteredAcreditaciones] = useState<Acreditacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [selectedAcreditacion, setSelectedAcreditacion] = useState<Acreditacion | null>(null);
  const [acreditados, setAcreditados] = useState<Acreditado[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }
      setUser(data.session.user);
      fetchAcreditaciones();
    };
    checkAuth();
  }, [router]);

  // Fetch acreditaciones
  const fetchAcreditaciones = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("acreditaciones_prensa")
        .select(`
          id,
          responsable_nombre,
          responsable_apellido,
          responsable_email,
          responsable_telefono,
          responsable_rut,
          medio_id,
          estado,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch medios
      const { data: medios } = await supabase.from("medios").select("id, nombre");
      const mediosMap = Object.fromEntries(medios?.map(m => [m.id, m.nombre]) || []);

      // Fetch acreditados count
      const { data: acreditadosData } = await supabase
        .from("acreditados_prensa")
        .select("acreditacion_id");

      const acreditadosMap: Record<number, number> = {};
      acreditadosData?.forEach((a: AcreditadoData) => {
        acreditadosMap[a.acreditacion_id] = (acreditadosMap[a.acreditacion_id] || 0) + 1;
      });

      const enrichedData = data?.map(a => ({
        ...a,
        medio: { nombre: mediosMap[a.medio_id] || "Desconocido" },
        acreditados_count: acreditadosMap[a.id] || 0,
      })) || [];

      setAcreditaciones(enrichedData);
      setFilteredAcreditaciones(enrichedData);
    } catch (err) {
      console.error("Error fetching:", err);
      setMessage({ type: "error", text: "Error al cargar acreditaciones" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter acreditaciones
  useEffect(() => {
    let filtered = acreditaciones;

    if (searchTerm) {
      filtered = filtered.filter(
        a =>
          a.responsable_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.responsable_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.responsable_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.responsable_rut.includes(searchTerm)
      );
    }

    if (estadoFilter) {
      filtered = filtered.filter(a => a.estado === estadoFilter);
    }

    setFilteredAcreditaciones(filtered);
  }, [searchTerm, estadoFilter, acreditaciones]);

  // Open detail modal
  const openDetail = async (acreditacion: Acreditacion) => {
    setSelectedAcreditacion(acreditacion);
    const { data } = await supabase
      .from("acreditados_prensa")
      .select("*")
      .eq("acreditacion_id", acreditacion.id);
    setAcreditados(data || []);
    setIsModalOpen(true);
  };

  // Update estado
  const updateEstado = async (newEstado: "aprobada" | "rechazada") => {
    if (!selectedAcreditacion) return;

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from("acreditaciones_prensa")
        .update({ estado: newEstado })
        .eq("id", selectedAcreditacion.id);

      if (updateError) throw updateError;

      // Send email
      const subject =
        newEstado === "aprobada"
          ? "Acreditación Aprobada - Católica Hockey"
          : "Acreditación Rechazada - Católica Hockey";

      const messageText =
        newEstado === "aprobada"
          ? `Tu acreditación ha sido aprobada. Se enviarán más detalles a los acreditados.`
          : `Lamentablemente, tu acreditación ha sido rechazada. Contáctanos para más información.`;

      await fetch("/api/admin/prensa/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedAcreditacion.responsable_email,
          subject,
          message: messageText,
          acreditacion_id: selectedAcreditacion.id,
          estado: newEstado,
        }),
      });

      setMessage({
        type: "success",
        text: `Acreditación ${newEstado === "aprobada" ? "aprobada" : "rechazada"} exitosamente`,
      });

      await fetchAcreditaciones();
      setIsModalOpen(false);
    } catch {
      setMessage({ type: "error", text: "Error al actualizar estado" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete acreditacion
  const deleteAcreditacion = async () => {
    if (!selectedAcreditacion || !confirm("¿Eliminar esta acreditación permanentemente?")) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("acreditaciones_prensa")
        .delete()
        .eq("id", selectedAcreditacion.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Acreditación eliminada" });
      await fetchAcreditaciones();
      setIsModalOpen(false);
    } catch {
      setMessage({ type: "error", text: "Error al eliminar" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isLoading) return <LoadingSpinner message="Cargando dashboard..." />;

  return (
    <div className="bg-gradient-to-br from-[#1e5799] to-[#7db9e8] min-h-screen py-8 px-4">
      <BotonFlotante />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/UCimg/LogoUC.png"
              alt="Logo UC"
              width={60}
              height={40}
              className="h-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
              <p className="text-white/80 text-sm">Acreditaciones Prensa - Católica Hockey</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nombre, email, RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAcreditaciones}
                className="w-full px-4 py-2 bg-[#1e5799] text-white rounded-lg hover:bg-[#2989d8] transition-all font-medium"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Responsable</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Medio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Acreditados</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcreditaciones.map((acred, idx) => (
                  <tr
                    key={acred.id}
                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50 transition-all`}
                  >
                    <td className="px-6 py-4 text-sm">
                      {acred.responsable_nombre} {acred.responsable_apellido}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">{acred.responsable_email}</td>
                    <td className="px-6 py-4 text-sm">{acred.medio?.nombre}</td>
                    <td className="px-6 py-4 text-sm font-medium">{acred.acreditados_count}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          ESTADO_COLORS[acred.estado]
                        }`}
                      >
                        {acred.estado.charAt(0).toUpperCase() + acred.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(acred.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetail(acred)}
                        className="px-3 py-1 bg-[#1e5799] text-white text-xs rounded hover:bg-[#2989d8] transition-all font-medium"
                      >
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAcreditaciones.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay acreditaciones que coincidan con los filtros
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedAcreditacion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white px-6 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detalles de Acreditación</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Responsable Info */}
              <div>
                <h3 className="text-lg font-bold text-[#1e5799] mb-3">Responsable</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.responsable_nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Apellido</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.responsable_apellido}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.responsable_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.responsable_telefono}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">RUT</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.responsable_rut}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Medio</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.medio?.nombre}</p>
                  </div>
                </div>
              </div>

              {/* Acreditados */}
              <div>
                <h3 className="text-lg font-bold text-[#1e5799] mb-3">
                  Acreditados ({acreditados.length})
                </h3>
                <div className="space-y-3">
                  {acreditados.map((acred) => (
                    <div key={acred.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <label className="font-medium text-gray-600">Nombre</label>
                          <p>{acred.nombre}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Apellido</label>
                          <p>{acred.apellido}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">RUT</label>
                          <p>{acred.rut}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Email</label>
                          <p>{acred.email}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Cargo</label>
                          <p>{acred.cargo}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Tipo Credencial</label>
                          <p>{acred.tipo_credencial}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-600">Número Credencial</label>
                          <p>{acred.numero_credencial}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Estado actual: <span className="font-bold capitalize">{selectedAcreditacion.estado}</span></p>
                <div className="flex flex-wrap gap-3">
                  {selectedAcreditacion.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => updateEstado("aprobada")}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => updateEstado("rechazada")}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                      >
                        ✕ Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={deleteAcreditacion}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}