"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BotonVolver from "@/components/common/BotonesFlotantes/BotonVolver";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Modal from "@/components/common/Modal";

interface Acreditacion {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
  area: string;
  empresa: string;
  zona_id?: number;
  status: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  responsable_telefono?: string;
  created_at: string;
}

interface Acreditado {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface SupabaseAcreditacion {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
  area: string;
  empresa: string;
  zona_id?: number;
  status: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo?: string;
  responsable_nombre?: string;
  responsable_email?: string;
  responsable_telefono?: string;
  created_at: string;
}

// Mapeo de códigos de área a nombres
const AREA_NAMES: Record<string, string> = {
  "A": "Radiales con caseta",
  "B": "Radiales sin caseta",
  "C": "TV Nacionales",
  "D": "Sitios Web",
  "E": "Medios Escritos",
  "F": "Agencias",
  "G": "Reportero gráfico cancha",
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  aprobado: "bg-green-100 text-green-800 border-green-300",
  rechazado: "bg-red-100 text-red-800 border-red-300",
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
  const [zonas, setZonas] = useState<Array<{ id: number; nombre: string }>>([]);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [confirmApproveModal, setConfirmApproveModal] = useState(false);
  const [confirmRejectModal, setConfirmRejectModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
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
      fetchZonas();
    };
    checkAuth();
  }, [router]);

  // Fetch zonas
  const fetchZonas = async () => {
    try {
      const { data, error } = await supabase
        .from("zonas_acreditacion")
        .select("id, nombre")
        .eq("evento_id", 1)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setZonas(data || []);
    } catch (error) {
      console.error("Error cargando zonas:", error);
    }
  };

  // Fetch acreditaciones
  const fetchAcreditaciones = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("acreditados")
        .select(`
          id,
          nombre,
          primer_apellido,
          segundo_apellido,
          rut,
          email,
          cargo,
          tipo_credencial,
          numero_credencial,
          area,
          empresa,
          zona_id,
          status,
          motivo_rechazo,
          responsable_nombre,
          responsable_email,
          responsable_telefono,
          created_at
        `)
        .eq("evento_id", 1)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((a: SupabaseAcreditacion) => ({
        id: a.id,
        nombre: a.nombre,
        primer_apellido: a.primer_apellido,
        segundo_apellido: a.segundo_apellido,
        rut: a.rut,
        email: a.email,
        cargo: a.cargo,
        tipo_credencial: a.tipo_credencial,
        numero_credencial: a.numero_credencial,
        area: a.area,
        empresa: a.empresa,
        zona_id: a.zona_id,
        status: a.status,
        motivo_rechazo: a.motivo_rechazo,
        responsable_nombre: a.responsable_nombre,
        responsable_email: a.responsable_email,
        responsable_telefono: a.responsable_telefono,
        created_at: a.created_at,
      })) || [];

      setAcreditaciones(transformedData);
      setFilteredAcreditaciones(transformedData);
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
          a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (a.segundo_apellido && a.segundo_apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
          a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.rut.includes(searchTerm) ||
          a.empresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (estadoFilter) {
      filtered = filtered.filter(a => a.status === estadoFilter);
    }

    setFilteredAcreditaciones(filtered);
  }, [searchTerm, estadoFilter, acreditaciones]);

  // Open detail modal
  const openDetail = async (acreditacion: Acreditacion) => {
    setSelectedAcreditacion(acreditacion);
    // Ya tenemos todos los datos en acreditacion, así que no es necesario
    // hacer otra query. Mostramos los datos del acreditado seleccionado
    setIsModalOpen(true);
  };

  // Update estado
  const updateEstado = async (newEstado: "aprobado" | "rechazado") => {
    if (!selectedAcreditacion) return;
    
    // Cerrar modales de confirmación
    setConfirmApproveModal(false);
    setConfirmRejectModal(false);

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from("acreditados")
        .update({ status: newEstado })
        .eq("id", selectedAcreditacion.id);

      if (updateError) throw updateError;

      // Send email
      const subject =
        newEstado === "aprobado"
          ? "Acreditación Aprobada - Católica Hockey"
          : "Acreditación Rechazada - Católica Hockey";

      const messageText =
        newEstado === "aprobado"
          ? `Tu acreditación ha sido aprobada. Se enviarán más detalles a los acreditados.`
          : `Lamentablemente, tu acreditación ha sido rechazada. Contáctanos para más información.`;

      await fetch("/api/admin/prensa/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedAcreditacion.email,
          subject,
          message: messageText,
          acreditado_id: selectedAcreditacion.id,
          status: newEstado,
        }),
      });

      const successMessage = `Acreditación ${newEstado === "aprobado" ? "aprobada" : "rechazada"} exitosamente`;
      setMessage({
        type: "success",
        text: successMessage,
      });
      setSuccessModal({ isOpen: true, message: successMessage });

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
    if (!selectedAcreditacion) return;
    
    // Cerrar modal de confirmación
    setConfirmDeleteModal(false);
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("acreditados")
        .delete()
        .eq("id", selectedAcreditacion.id);

      if (error) throw error;

      const successMessage = "Acreditación eliminada exitosamente";
      setMessage({ type: "success", text: successMessage });
      setSuccessModal({ isOpen: true, message: successMessage });
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

  const handleAsignZona = async (zonaId: number) => {
    if (!selectedAcreditacion) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("acreditados")
        .update({ zona_id: zonaId, updated_at: new Date().toISOString() })
        .eq("id", selectedAcreditacion.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Zona asignada correctamente" });
      setSelectedAcreditacion({ ...selectedAcreditacion, zona_id: zonaId });
      fetchAcreditaciones();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al asignar zona",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Cargando dashboard..." />;

  return (
    <div className="bg-gradient-to-br from-[#1e5799] via-[#2989d8] to-[#7db9e8] min-h-screen">
      <BotonFlotante />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-6">
              <Image
                src="/UCimg/LogoUC.png"
                alt="Logo UC"
                width={80}
                height={80}
                className="h-auto"
              
            />
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Panel de Administración</h1>
              <p className="text-white/90 text-sm mt-1 font-medium">Sistema de Acreditaciones prensa UC</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/70 text-xs">Administrador</p>
              <p className="text-white font-medium text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Acreditaciones</p>
                <p className="text-4xl font-bold text-[#1e5799] mt-2">{acreditaciones.length}</p>
              </div>
              <div className="text-5xl">
                📋
              </div>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pendientes</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {acreditaciones.filter(a => a.status === 'pendiente').length}
                </p>
              </div>
              <div className="text-5xl">
                ⏳
              </div>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Aprobadas</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {acreditaciones.filter(a => a.status === 'aprobado').length}
                </p>
              </div>
              <div className="text-5xl ">
                ✅
              </div>
            </div>
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

        {/* Panel de Filtros y Acciones */}
        <div className="mb-6">
          {/* Encabezado del Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl px-6 py-4 shadow-lg">
            <h2 className="text-lg font-bold text-[#1e5799]">
              Filtros y Búsqueda
            </h2>
          </div>
          
          {/* Contenido del Panel */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-2xl shadow-lg">
            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nombre, email, RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition-all shadow-sm"
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
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Actualizar
                </button>
              </div>
            </div>

          {/* Botones de Exportación */}
          <div className="border-t-2 border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              Exportar Datos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `/api/admin/export-excel?format=completo&status=${estadoFilter || "all"}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative">Excel Completo</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/export-excel?format=puntoticket&status=aprobada`);
                    if (!response.ok) {
                      const error = await response.json();
                      setMessage({ 
                        type: "error", 
                        text: error.error || "No hay acreditaciones aprobadas para exportar" 
                      });
                      return;
                    }
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `acreditados_puntoticket_${new Date().toISOString().split("T")[0]}.xlsx`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    setMessage({ type: "error", text: "Error al descargar Excel" });
                  }
                }}
                className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative">Punto Ticket (Aprobados)</span>
              </button>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `/api/admin/export-excel?format=puntoticket&status=${estadoFilter || "all"}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative">Punto Ticket (Filtrado)</span>
              </button>
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-[#1e5799] p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> &quot;Punto Ticket (Aprobados)&quot; solo exporta acreditaciones aprobadas. Usa &quot;Punto Ticket (Filtrado)&quot; para exportar según el filtro de estado actual.
              </p>
            </div>
          </div>
        </div>

        {/* Tabla Elegante - Separada */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mt-16">
          {/* Header de la Tabla */}
          <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center justify-between">
              <span>Lista de Acreditaciones</span>
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
                {filteredAcreditaciones.length} resultado{filteredAcreditaciones.length !== 1 ? 's' : ''}
              </span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Área</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credencial</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Zona</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAcreditaciones.map((acred, idx) => (
                  <tr
                    key={acred.id}
                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50 transition-all`}
                  >
                    <td className="px-6 py-4 text-sm">
                      {acred.nombre} {acred.primer_apellido} {acred.segundo_apellido || ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">{acred.email}</td>
                    <td className="px-6 py-4 text-sm">{acred.empresa}</td>
                    <td className="px-6 py-4 text-sm font-medium">{AREA_NAMES[acred.area] || acred.area}</td>
                    <td className="px-6 py-4 text-sm">{acred.cargo}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{acred.tipo_credencial}</p>
                        {acred.numero_credencial && (
                          <p className="text-gray-600 text-xs">#{acred.numero_credencial}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openDetail(acred)}
                        className={`px-3 py-1 text-xs rounded transition-all font-medium ${
                          acred.zona_id 
                            ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" 
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
                        }`}
                      >
                        {acred.zona_id ? `Asignada` : "Asignar Zona"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          ESTADO_COLORS[acred.status]
                        }`}
                      >
                        {acred.status.charAt(0).toUpperCase() + acred.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(acred.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetail(acred)}
                        className="px-4 py-2 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white text-sm rounded-lg hover:shadow-lg transition-all font-semibold hover:scale-105"
                      >
                        Ver Detalles
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
              {/* Acreditado Info */}
              <div>
                <h3 className="text-lg font-bold text-[#1e5799] mb-3">Datos del Acreditado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Primer Apellido</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.primer_apellido}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Segundo Apellido</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.segundo_apellido || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">RUT</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.rut}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cargo</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.cargo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Credencial</label>
                    <p className="text-base font-semibold">
                      {selectedAcreditacion.tipo_credencial}
                      {selectedAcreditacion.numero_credencial && ` · ${selectedAcreditacion.numero_credencial}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Institucional */}
              <div>
                <h3 className="text-lg font-bold text-[#1e5799] mb-3">Información Institucional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Área</label>
                    <p className="text-base font-semibold">{AREA_NAMES[selectedAcreditacion.area] || selectedAcreditacion.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Empresa</label>
                    <p className="text-base font-semibold">{selectedAcreditacion.empresa}</p>
                  </div>
                </div>
              </div>

              {/* Responsable Info */}
              {selectedAcreditacion.responsable_nombre && (
                <div>
                  <h3 className="text-lg font-bold text-[#1e5799] mb-3">Contacto Responsable</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_nombre}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_telefono || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div>
                <h3 className="text-lg font-bold text-[#1e5799] mb-3">Información Adicional</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Fecha Solicitud:</strong> {new Date(selectedAcreditacion.created_at).toLocaleDateString("es-CL")}</p>
                  <p><strong>Estado:</strong> <span className="capitalize font-bold">{selectedAcreditacion.status}</span></p>
                  {selectedAcreditacion.motivo_rechazo && (
                    <p><strong>Motivo Rechazo:</strong> {selectedAcreditacion.motivo_rechazo}</p>
                  )}
                </div>
              </div>

              {/* Asignación de Zona */}
              <div className="border-2 border-blue-300 rounded-lg">
                <h3 className="text-lg font-bold text-white bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-4 py-3 rounded-t-lg">
                  Asignación de Zona
                </h3>
                <div className="bg-blue-50 p-4">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Zona Actual:
                    </label>
                    <p className="text-base font-bold text-[#1e5799]">
                      {selectedAcreditacion.zona_id 
                        ? zonas.find(z => z.id === selectedAcreditacion.zona_id)?.nombre || "Desconocida" 
                        : "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Cambiar Zona:
                    </label>
                    <select
                      value={selectedAcreditacion.zona_id || ""}
                      onChange={(e) => handleAsignZona(Number(e.target.value))}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-[#1e5799] focus:outline-none disabled:opacity-50 bg-white font-medium text-base"
                    >
                      <option value="">Seleccionar zona...</option>
                      {zonas.map((zona) => (
                        <option key={zona.id} value={zona.id}>
                          {zona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Estado actual: <span className="font-bold capitalize">{selectedAcreditacion.status}</span></p>
                <div className="flex flex-wrap gap-3">
                  {selectedAcreditacion.status === "pendiente" && (
                    <>
                      <button
                        onClick={() => setConfirmApproveModal(true)}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => setConfirmRejectModal(true)}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setConfirmDeleteModal(true)}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para aprobar */}
      <ConfirmationModal
        isOpen={confirmApproveModal}
        title="Aprobar Acreditación"
        message="¿Estás seguro de que deseas aprobar esta acreditación?"
        details={selectedAcreditacion ? [
          {
            "Nombre": `${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido}`,
            "Email": selectedAcreditacion.email,
            "Empresa": selectedAcreditacion.empresa,
          }
        ] : []}
        confirmText="Sí, aprobar"
        cancelText="Cancelar"
        onConfirm={() => updateEstado("aprobado")}
        onCancel={() => setConfirmApproveModal(false)}
        isLoading={isProcessing}
      />

      {/* Modal de confirmación para rechazar */}
      <ConfirmationModal
        isOpen={confirmRejectModal}
        title="Rechazar Acreditación"
        message="¿Estás seguro de que deseas rechazar esta acreditación?"
        details={selectedAcreditacion ? [
          {
            "Nombre": `${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido}`,
            "Email": selectedAcreditacion.email,
            "Empresa": selectedAcreditacion.empresa,
          }
        ] : []}
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        onConfirm={() => updateEstado("rechazado")}
        onCancel={() => setConfirmRejectModal(false)}
        isLoading={isProcessing}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={confirmDeleteModal}
        title="Eliminar Acreditación"
        message="¿Estás seguro de que deseas eliminar esta acreditación permanentemente? Esta acción no se puede deshacer."
        details={selectedAcreditacion ? [
          {
            "Nombre": `${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido}`,
            "Email": selectedAcreditacion.email,
            "RUT": selectedAcreditacion.rut,
          }
        ] : []}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={deleteAcreditacion}
        onCancel={() => setConfirmDeleteModal(false)}
        isLoading={isProcessing}
      />

      {/* Modal de éxito */}
      <Modal
        isOpen={successModal.isOpen}
        type="success"
        title="¡Éxito!"
        message={successModal.message}
        buttons={[
          {
            label: "Aceptar",
            onClick: () => setSuccessModal({ isOpen: false, message: "" }),
            variant: "primary",
          },
        ]}
        onClose={() => setSuccessModal({ isOpen: false, message: "" })}
        autoClose={3000}
      />
      </div>
    </div>
  );
}