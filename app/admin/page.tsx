"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Modal from "@/components/common/Modal";
import { AdminProvider, AdminStats, AdminFilters, AdminExportActions, AdminTable, Acreditacion, User, AREA_NAMES, ESTADO_COLORS } from "@/components/admin-dashboard";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [acreditaciones, setAcreditaciones] = useState<Acreditacion[]>([]);
  const [filteredAcreditaciones, setFilteredAcreditaciones] = useState<Acreditacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [selectedAcreditacion, setSelectedAcreditacion] = useState<Acreditacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [zonas, setZonas] = useState<Array<{ id: number; nombre: string }>>([]);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: "", onConfirm: null });
  const [confirmActionModal, setConfirmActionModal] = useState<{ isOpen: boolean; type: "aprobado" | "rechazado" | null; message: string }>({ isOpen: false, type: null, message: "" });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [confirmEmailModal, setConfirmEmailModal] = useState<{ isOpen: boolean; acreditacion: Acreditacion | null; onConfirm: (() => void) | null }>({ isOpen: false, acreditacion: null, onConfirm: null });
  const [emailErrorModal, setEmailErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
          responsable_primer_apellido,
          responsable_segundo_apellido,
          responsable_rut,
          responsable_email,
          responsable_telefono,
          created_at
        `)
        .eq("evento_id", 1)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((a: Acreditacion) => ({
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
        responsable_primer_apellido: a.responsable_primer_apellido,
        responsable_segundo_apellido: a.responsable_segundo_apellido,
        responsable_rut: a.responsable_rut,
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

  // Función para normalizar texto (quitar tildes)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filter acreditaciones
  useEffect(() => {
    let filtered = acreditaciones;

    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      
      filtered = filtered.filter(
        a => {
          const fullName = normalizeText(`${a.nombre} ${a.primer_apellido} ${a.segundo_apellido || ""}`);
          const areaName = normalizeText(AREA_NAMES[a.area] || a.area);
          const zonaName = normalizeText(zonas.find(z => z.id === a.zona_id)?.nombre || "Sin asignar");
          
          return (
            fullName.includes(normalizedSearchTerm) ||
            normalizeText(a.email).includes(normalizedSearchTerm) ||
            a.rut.includes(searchTerm) || // RUT no necesita normalización
            normalizeText(a.empresa).includes(normalizedSearchTerm) ||
            areaName.includes(normalizedSearchTerm) ||
            normalizeText(a.cargo).includes(normalizedSearchTerm) ||
            normalizeText(a.tipo_credencial).includes(normalizedSearchTerm) ||
            (a.numero_credencial && normalizeText(a.numero_credencial).includes(normalizedSearchTerm)) ||
            zonaName.includes(normalizedSearchTerm)
          );
        }
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
  const updateEstado = async (newEstado: "pendiente" | "aprobado" | "rechazado") => {
    if (!selectedAcreditacion) return;

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from("acreditados")
        .update({ status: newEstado })
        .eq("id", selectedAcreditacion.id);

      if (updateError) throw updateError;

      // Send email
      if (newEstado === "aprobado") {
        const zonaNombre = zonas.find(z => z.id === selectedAcreditacion.zona_id)?.nombre || "Por confirmar";
        const areaNombre = AREA_NAMES[selectedAcreditacion.area] || selectedAcreditacion.area;
        await fetch("/api/send-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: selectedAcreditacion.nombre,
            apellido: `${selectedAcreditacion.primer_apellido} ${selectedAcreditacion.segundo_apellido || ""}`.trim(),
            correo: selectedAcreditacion.email,
            zona: zonaNombre,
            area: areaNombre,
          }),
        });
      } else if (newEstado === "rechazado") {
        const zonaNombre = zonas.find(z => z.id === selectedAcreditacion.zona_id)?.nombre || "Por confirmar";
        const areaNombre = AREA_NAMES[selectedAcreditacion.area] || selectedAcreditacion.area;
        await fetch("/api/send-rejection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: selectedAcreditacion.nombre,
            apellido: `${selectedAcreditacion.primer_apellido} ${selectedAcreditacion.segundo_apellido || ""}`.trim(),
            correo: selectedAcreditacion.email,
            zona: zonaNombre,
            area: areaNombre,
          }),
        });
      }

      const successMessage = `Acreditación cambiada a ${newEstado} exitosamente`;
      setMessage({
        type: "success",
        text: successMessage,
      });
      setSuccessModal({ isOpen: true, message: successMessage });

      // Update local state instead of refetching
      setAcreditaciones(prev => prev.map(a => 
        a.id === selectedAcreditacion.id ? { ...a, status: newEstado } : a
      ));

      setIsModalOpen(false);
    } catch {
      setMessage({ type: "error", text: "Error al actualizar estado" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveClick = () => {
    if (!selectedAcreditacion) return;
    setConfirmActionModal({
      isOpen: true,
      type: "aprobado",
      message: `¿Estás seguro de que quieres aprobar la acreditación de ${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido} de ${selectedAcreditacion.empresa}?`
    });
  };

  const handleRejectClick = () => {
    if (!selectedAcreditacion) return;
    setConfirmActionModal({
      isOpen: true,
      type: "rechazado",
      message: `¿Estás seguro de que quieres rechazar la acreditación de ${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido} de ${selectedAcreditacion.empresa}?`
    });
  };

  const handleConfirmAction = () => {
    if (confirmActionModal.type) {
      updateEstado(confirmActionModal.type);
      setConfirmActionModal({ isOpen: false, type: null, message: "" });
    }
  };

  const handleCancelAction = () => {
    setConfirmActionModal({ isOpen: false, type: null, message: "" });
  };

  const handleConfirmDelete = (message: string, onConfirm: () => void) => {
    setConfirmDeleteModal({ isOpen: true, message, onConfirm });
  };

  // Selection handlers
  const handleSelectionChange = (id: number, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id] 
        : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(filteredAcreditaciones.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "approve" | "reject" | "sendEmail" | "delete", ids: number[]) => {
    if (ids.length === 0) return;

    setIsProcessing(true);
    try {
      if (action === "approve" || action === "reject") {
        const newStatus = action === "approve" ? "aprobado" : "rechazado";
        
        const { error } = await supabase
          .from("acreditados")
          .update({ status: newStatus })
          .in("id", ids);

        if (error) throw error;

        // Update local state
        setAcreditaciones(prev => prev.map(a => 
          ids.includes(a.id) ? { ...a, status: newStatus } : a
        ));

        setMessage({ 
          type: "success", 
          text: `${ids.length} acreditación${ids.length !== 1 ? 'es' : ''} ${action === "approve" ? 'aprobada' : 'rechazada'}${ids.length !== 1 ? 's' : ''} exitosamente` 
        });
        setSuccessModal({ 
          isOpen: true, 
          message: `${ids.length} acreditación${ids.length !== 1 ? 'es' : ''} ${action === "approve" ? 'aprobada' : 'rechazada'}${ids.length !== 1 ? 's' : ''} exitosamente` 
        });
      } else if (action === "sendEmail") {
        // Filter only approved or rejected accreditations for email sending
        const emailEligible = filteredAcreditaciones.filter(a => 
          ids.includes(a.id) && (a.status === "aprobado" || a.status === "rechazado")
        );

        if (emailEligible.length === 0) {
          setMessage({ type: "error", text: "Solo se pueden enviar emails a acreditaciones aprobadas o rechazadas" });
          return;
        }

        // Send emails
        const emailPromises = emailEligible.map(async (acred) => {
          const zonaNombre = zonas.find(z => z.id === acred.zona_id)?.nombre || "Por confirmar";
          const areaNombre = AREA_NAMES[acred.area] || acred.area;
          
          if (acred.status === "aprobado") {
            return fetch("/api/send-approval", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: acred.email,
                nombre: `${acred.nombre} ${acred.primer_apellido}`,
                zona: zonaNombre,
                area: areaNombre,
                tipoCredencial: acred.tipo_credencial,
                numeroCredencial: acred.numero_credencial
              })
            });
          } else {
            return fetch("/api/send-rejection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: acred.email,
                nombre: `${acred.nombre} ${acred.primer_apellido}`,
                motivo: acred.motivo_rechazo || "Sin motivo especificado"
              })
            });
          }
        });

        const results = await Promise.allSettled(emailPromises);
        const successCount = results.filter(r => r.status === "fulfilled").length;
        const failureCount = results.filter(r => r.status === "rejected").length;

        if (successCount > 0) {
          setMessage({ 
            type: "success", 
            text: `Emails enviados exitosamente: ${successCount}${failureCount > 0 ? `, fallidos: ${failureCount}` : ''}` 
          });
          setSuccessModal({ 
            isOpen: true, 
            message: `Emails enviados exitosamente: ${successCount}${failureCount > 0 ? `, fallidos: ${failureCount}` : ''}` 
          });
        } else {
          setMessage({ type: "error", text: "Error al enviar emails" });
        }
      } else if (action === "delete") {
        // Delete selected accreditations
        const { error } = await supabase
          .from("acreditados")
          .delete()
          .in("id", ids);

        if (error) throw error;

        // Update local state
        setAcreditaciones(prev => prev.filter(a => !ids.includes(a.id)));

        setMessage({ 
          type: "success", 
          text: `${ids.length} acreditación${ids.length !== 1 ? 'es' : ''} eliminada${ids.length !== 1 ? 's' : ''} exitosamente` 
        });
        setSuccessModal({ 
          isOpen: true, 
          message: `${ids.length} acreditación${ids.length !== 1 ? 'es' : ''} eliminada${ids.length !== 1 ? 's' : ''} exitosamente` 
        });
      }

      // Clear selection after action
      setSelectedIds([]);
    } catch (error) {
      console.error("Error in bulk action:", error);
      setMessage({ type: "error", text: "Error al procesar la acción masiva" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete acreditacion
  const deleteAcreditacion = async () => {
    if (!selectedAcreditacion) return;
    
    // Cerrar modal de confirmación
    setConfirmDeleteModal({ isOpen: false, message: "", onConfirm: null });
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
      
      // Update local state instead of refetching
      setAcreditaciones(prev => prev.filter(a => a.id !== selectedAcreditacion.id));
      
      setIsModalOpen(false);
    } catch {
      setMessage({ type: "error", text: "Error al eliminar" });
    } finally {
      setIsProcessing(false);
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  };

  const handleAsignZona = async (zonaId: number) => {
    if (!selectedAcreditacion) return;

    // Optimistic update
    const previousZonaId = selectedAcreditacion.zona_id;
    setSelectedAcreditacion({ ...selectedAcreditacion, zona_id: zonaId });

    try {
      const { error } = await supabase
        .from("acreditados")
        .update({ zona_id: zonaId, updated_at: new Date().toISOString() })
        .eq("id", selectedAcreditacion.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Zona asignada correctamente" });
      
      // Update local state instead of refetching
      setAcreditaciones(prev => prev.map(a => 
        a.id === selectedAcreditacion.id ? { ...a, zona_id: zonaId } : a
      ));

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      // Revert on error
      setSelectedAcreditacion({ ...selectedAcreditacion, zona_id: previousZonaId });
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al asignar zona",
      });
    }
  };

  const assignZonaDirect = async (acred: Acreditacion, zonaId: number | null) => {
    try {
      const { error } = await supabase
        .from("acreditados")
        .update({ zona_id: zonaId, updated_at: new Date().toISOString() })
        .eq("id", acred.id);

      if (error) throw error;

      setMessage({ type: "success", text: zonaId ? "Zona asignada correctamente" : "Zona removida correctamente" });
      
      // Update local state instead of refetching
      setAcreditaciones(prev => prev.map(a => 
        a.id === acred.id ? { ...a, zona_id: zonaId ?? undefined } : a
      ));

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al asignar zona",
      });
    }
  };

  const updateEstadoDirect = async (acred: Acreditacion, newEstado: "pendiente" | "aprobado" | "rechazado") => {
    try {
      const { error: updateError } = await supabase
        .from("acreditados")
        .update({ status: newEstado })
        .eq("id", acred.id);

      if (updateError) throw updateError;

      const successMessage = `Acreditación cambiada a ${newEstado} exitosamente`;
      setMessage({
        type: "success",
        text: successMessage,
      });

      // Update local state instead of refetching
      setAcreditaciones(prev => prev.map(a => 
        a.id === acred.id ? { ...a, status: newEstado } : a
      ));

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch {
      setMessage({ type: "error", text: "Error al actualizar estado" });
    }
  };

  const sendApprovalEmail = async (acred: Acreditacion) => {
    try {
      const zonaNombre = zonas.find(z => z.id === acred.zona_id)?.nombre || "Por confirmar";
      const areaNombre = AREA_NAMES[acred.area] || acred.area;
      await fetch("/api/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: acred.nombre,
          apellido: `${acred.primer_apellido} ${acred.segundo_apellido || ""}`.trim(),
          correo: acred.email,
          zona: zonaNombre,
          area: areaNombre,
        }),
      });
      setMessage({
        type: "success",
        text: "Email de aprobación enviado exitosamente",
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch {
      setMessage({ type: "error", text: "Error al enviar email de aprobación" });
    }
  };

  const sendRejectionEmail = async (acred: Acreditacion) => {
    try {
      const zonaNombre = zonas.find(z => z.id === acred.zona_id)?.nombre || "Por confirmar";
      const areaNombre = AREA_NAMES[acred.area] || acred.area;
      await fetch("/api/send-rejection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: acred.nombre,
          apellido: `${acred.primer_apellido} ${acred.segundo_apellido || ""}`.trim(),
          correo: acred.email,
          zona: zonaNombre,
          area: areaNombre,
        }),
      });
      setMessage({
        type: "success",
        text: "Email de rechazo enviado exitosamente",
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch {
      setMessage({ type: "error", text: "Error al enviar email de rechazo" });
    }
  };

  const handleConfirmEmail = (acred: Acreditacion, onConfirm: () => void) => {
    setConfirmEmailModal({ isOpen: true, acreditacion: acred, onConfirm });
  };

  const closeConfirmEmailModal = () => {
    setConfirmEmailModal({ isOpen: false, acreditacion: null, onConfirm: null });
  };

  const handleEmailError = (message: string) => {
    setEmailErrorModal({ isOpen: true, message });
  };

  const closeEmailErrorModal = () => {
    setEmailErrorModal({ isOpen: false, message: "" });
  };

  if (isLoading) return <LoadingSpinner message="Cargando dashboard..." />;

  const contextValue = {
    acreditaciones,
    filteredAcreditaciones,
    zonas,
    AREA_NAMES,
    ESTADO_COLORS,
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    message,
    setMessage,
    selectedAcreditacion,
    setSelectedAcreditacion,
    isModalOpen,
    setIsModalOpen,
    isProcessing,
    setIsProcessing,
    confirmDeleteModal,
    setConfirmDeleteModal,
    fetchAcreditaciones,
    openDetail,
    handleAsignZona,
    assignZonaDirect,
    updateEstado,
    updateEstadoDirect,
    sendApprovalEmail,
    sendRejectionEmail,
  };

  return (
    <AdminProvider value={contextValue}>
      <>
        <style>
          {`@import url("https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Special+Gothic+Condensed+One&display=swap");`}
        </style>
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #000000 0%, #666666 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-6">
              <Image
                src="/colocolo/EscudoColo.png"
                alt="Logo Colo-Colo"
                width={80}
                height={80}
                className="h-auto"
              
            />
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Panel de Administración</h1>
              <p className="text-white/90 text-sm mt-1 font-medium">Sistema de Acreditaciones prensa Colo-Colo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/70 text-xs">Administrador</p>
              <p className="text-white font-medium text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cerrando...
                </>
              ) : (
                "Cerrar Sesión"
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <AdminStats acreditaciones={acreditaciones} />

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
          <AdminFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            estadoFilter={estadoFilter}
            setEstadoFilter={setEstadoFilter}
            onRefresh={fetchAcreditaciones}
          />

          <AdminExportActions estadoFilter={estadoFilter} setMessage={setMessage} />
        </div>

        {/* Tabla */}
        <AdminTable
          filteredAcreditaciones={filteredAcreditaciones}
          AREA_NAMES={AREA_NAMES}
          ESTADO_COLORS={ESTADO_COLORS}
          onOpenDetail={openDetail}
          onConfirmEmail={handleConfirmEmail}
          onEmailError={handleEmailError}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedAcreditacion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-6 flex items-center justify-between">
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
                <h3 className="text-lg font-bold text-black mb-3">Datos del Acreditado</h3>
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
                <h3 className="text-lg font-bold text-black mb-3">Información Institucional</h3>
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
                  <h3 className="text-lg font-bold text-black mb-3">Contacto Responsable</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_nombre}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Primer Apellido</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_primer_apellido || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Segundo Apellido</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_segundo_apellido || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">RUT</label>
                      <p className="text-base font-semibold">{selectedAcreditacion.responsable_rut || "-"}</p>
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
                <h3 className="text-lg font-bold text-black mb-3">Información Adicional</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Fecha Solicitud:</strong> {new Date(selectedAcreditacion.created_at).toLocaleDateString("es-CL")}</p>
                  <p><strong>Zona Asignada:</strong> {selectedAcreditacion.zona_id ? zonas.find(z => z.id === selectedAcreditacion.zona_id)?.nombre || "Desconocida" : "Sin asignar"}</p>
                  <p><strong>Estado:</strong> <span className="capitalize font-bold">{selectedAcreditacion.status}</span></p>
                  {selectedAcreditacion.motivo_rechazo && (
                    <p><strong>Motivo Rechazo:</strong> {selectedAcreditacion.motivo_rechazo}</p>
                  )}
                </div>
              </div>

              {/* Modificar Zona */}
              <div className="border-2 border-gray-300 rounded-lg">
                <h3 className="text-lg font-bold text-white bg-gradient-to-r from-black to-gray-800 px-4 py-3 rounded-t-lg">
                  Modificar Zona Asignada
                </h3>
                <div className="bg-gray-50 p-4">
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Zona Actual:
                    </label>
                    <p className="text-base font-bold text-black">
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none bg-white font-medium text-base"
                    >
                      <option value="">Sin asignar</option>
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
                  <button
                    onClick={() => updateEstado("pendiente")}
                    disabled={isProcessing || selectedAcreditacion.status === "pendiente"}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={handleApproveClick}
                    disabled={isProcessing || selectedAcreditacion.status === "aprobado"}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={handleRejectClick}
                    disabled={isProcessing || selectedAcreditacion.status === "rechazado"}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => setConfirmDeleteModal({ 
                      isOpen: true, 
                      message: `¿Estás seguro de que deseas eliminar la acreditación de ${selectedAcreditacion.nombre} ${selectedAcreditacion.primer_apellido} permanentemente? Esta acción no se puede deshacer.`,
                      onConfirm: deleteAcreditacion
                    })}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        title="Eliminar Acreditación"
        message={confirmDeleteModal.message}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (confirmDeleteModal.onConfirm) {
            confirmDeleteModal.onConfirm();
          }
          setConfirmDeleteModal({ isOpen: false, message: "", onConfirm: null });
        }}
        onCancel={() => setConfirmDeleteModal({ isOpen: false, message: "", onConfirm: null })}
        isLoading={isProcessing}
      />

      {/* Modal de confirmación para aprobar/rechazar */}
      <ConfirmationModal
        isOpen={confirmActionModal.isOpen}
        title={confirmActionModal.type === "aprobado" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
        message={confirmActionModal.message}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
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

      {/* Modal de confirmación para envío de email */}
      <ConfirmationModal
        isOpen={confirmEmailModal.isOpen}
        title="Confirmar envío de email"
        message={
          confirmEmailModal.acreditacion
            ? `¿Estás seguro de que quieres enviar el email de ${
                confirmEmailModal.acreditacion.status === "aprobado" ? "aprobación" : "rechazo"
              } a ${confirmEmailModal.acreditacion.nombre} ${confirmEmailModal.acreditacion.primer_apellido}?`
            : ""
        }
        onConfirm={() => {
          if (confirmEmailModal.onConfirm) {
            confirmEmailModal.onConfirm();
          }
          closeConfirmEmailModal();
        }}
        onCancel={closeConfirmEmailModal}
      />

      {/* Modal de error de email */}
      <Modal
        isOpen={emailErrorModal.isOpen}
        type="error"
        title="Error al enviar email"
        message={emailErrorModal.message}
        buttons={[
          {
            label: "Aceptar",
            onClick: closeEmailErrorModal,
            variant: "primary",
          },
        ]}
        onClose={closeEmailErrorModal}
      />
      </div>
      </>
    </AdminProvider>
  );
}