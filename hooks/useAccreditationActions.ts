import { supabase } from "@/lib/supabase";
import { Zona } from "@/constants/areas";

export interface Acreditacion {
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

export type Row = Acreditacion;

interface UseAccreditationActionsProps {
  onSetRows: (updater: (prev: Row[]) => Row[]) => void;
  onOpenConfirm: (title: string, message: string, action: () => Promise<void>) => void;
  onOpenResult: (
    type: 'success' | 'error',
    title: string,
    message: string
  ) => void;
}

export function useAccreditationActions({
  onSetRows,
  onOpenConfirm,
  onOpenResult,
}: UseAccreditationActionsProps) {
  
  // Actualizar estado de una acreditación
  const setEstado = async (id: number, nuevo: Row["status"]) => {
    const { error } = await supabase
      .from("acreditaciones")
      .update({ status: nuevo })
      .eq("id", id);
    
    if (error) {
      alert(error.message);
      return;
    }
    
    onSetRows((prev: Row[]) =>
      prev.map((r) => (r.id === id ? { ...r, status: nuevo } : r))
    );
  };

  // Actualizar zona de una acreditación
  const setZona = async (id: number, zona: Zona) => {
    const { error } = await supabase
      .from("acreditaciones")
      .update({ zona })
      .eq("id", id);
    
    if (error) {
      alert(error.message);
      return;
    }
    
    onSetRows((prev: Row[]) => prev.map((r) => (r.id === id ? { ...r, zona } : r)));
  };

  // Enviar correo de aprobación
  const enviarCorreoAprobacion = async (r: Row) => {
    try {
      const response = await fetch("/api/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: r.nombre,
          apellido: r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : ''),
          correo: r.email,
          zona: r.area, // Usando area como zona por ahora
          area: r.area,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error al enviar correo:", result);
        onOpenResult(
          'error',
          "⚠️ Acreditación aprobada, pero correo no enviado",
          `Error: ${result.error || "Desconocido"}\n\nVerifica la configuración de RESEND_API_KEY en el archivo .env`
        );
        return false;
      }

      console.log("✅ Correo enviado exitosamente a:", r.email);
      onOpenResult(
        'success',
        "✅ ¡Acreditación aprobada!",
        `La acreditación de ${r.nombre} ${r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : '')} ha sido aprobada y el correo ha sido enviado exitosamente a ${r.email}.`
      );
      return true;
    } catch (e) {
      console.error("Error enviando correo de aprobación:", e);
      onOpenResult(
        'error',
        "⚠️ Error al enviar correo",
        "Acreditación aprobada, pero hubo un problema al enviar el correo. Revisa la consola (F12) para más detalles."
      );
      return false;
    }
  };

  // Ejecutar aprobación (actualizar BD + enviar correo)
  const ejecutarAprobacion = async (r: Row) => {
    const { error } = await supabase
      .from("acreditaciones")
      .update({ status: "aprobado", zona_id: r.zona_id })
      .eq("id", r.id);

    if (error) {
      onOpenResult('error', "❌ Error al aprobar", error.message);
      return;
    }

    onSetRows((prev: Row[]) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, status: "aprobado", zona_id: r.zona_id } : x
      )
    );

    await enviarCorreoAprobacion(r);
  };

  // Abrir modal de confirmación para aprobar con zona
  const aprobarConZona = (r: Row) => {
    if (!r.zona_id) {
      onOpenConfirm(
        "Zona no seleccionada",
        "Debes seleccionar una zona antes de aprobar.",
        async () => {}
      );
      return;
    }

    onOpenConfirm(
      "Confirmar aprobación",
      `¿Deseas aprobar la acreditación de ${r.nombre} ${r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : '')} en ${r.area}?\n\nSe enviará un correo de confirmación.`,
      async () => {
        await ejecutarAprobacion(r);
      }
    );
  };

  // Eliminar acreditación
  const eliminarRegistro = (r: Row) => {
    onOpenConfirm(
      "⚠️ Confirmar eliminación",
      `¿Estás seguro de eliminar la acreditación de ${r.nombre} ${r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : '')}?\n\nEsta acción no se puede deshacer.`,
      async () => {
        const { error } = await supabase
          .from("acreditaciones")
          .delete()
          .eq("id", r.id);

        if (error) {
          onOpenResult(
            'error',
            "❌ Error al eliminar",
            `No se pudo eliminar el registro: ${error.message}`
          );
          return;
        }

        onSetRows((prev: Row[]) => prev.filter((x) => x.id !== r.id));
        onOpenResult(
          'success',
          "✅ Acreditación eliminada",
          `La acreditación de ${r.nombre} ${r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : '')} ha sido eliminada exitosamente.`
        );
      }
    );
  };

  return {
    setEstado,
    setZona,
    aprobarConZona,
    ejecutarAprobacion,
    eliminarRegistro,
  };
}
