"use client";

interface AdminExportActionsProps {
  estadoFilter: string;
  setMessage: (message: { type: "success" | "error"; text: string } | null) => void;
}

export default function AdminExportActions({ estadoFilter, setMessage }: AdminExportActionsProps) {
  return (
    <div className="mb-6">
      {/* Encabezado del Panel */}
      <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl px-6 py-4 shadow-lg">
        <h2 className="text-lg font-bold text-[#1e5799]">
          Exportar Datos
        </h2>
      </div>

      {/* Contenido del Panel */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-2xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/admin/export-excel?format=completo&status=${estadoFilter || "all"}`);
                if (!response.ok) {
                  const error = await response.json();
                  setMessage({
                    type: "error",
                    text: error.error || "No hay acreditaciones para exportar"
                  });
                  return;
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `acreditados_completo_${new Date().toISOString().split("T")[0]}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                setMessage({ type: "error", text: "Error al descargar Excel" });
              }
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
              } catch {
                setMessage({ type: "error", text: "Error al descargar Excel" });
              }
            }}
            className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative">Punto Ticket (Aprobados)</span>
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/admin/export-excel?format=puntoticket&status=${estadoFilter || "all"}`);
                if (!response.ok) {
                  const error = await response.json();
                  setMessage({
                    type: "error",
                    text: error.error || "No hay acreditaciones para exportar con el filtro actual"
                  });
                  return;
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `acreditados_puntoticket_filtrado_${new Date().toISOString().split("T")[0]}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                setMessage({ type: "error", text: "Error al descargar Excel" });
              }
            }}
            className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative">Punto Ticket (Filtrado)</span>
          </button>
        </div>
        <div className="bg-blue-50 border-l-4 border-[#1e5799] p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> &quot;Punto Ticket (Aprobados)&quot; solo exporta acreditaciones aprobadas. Usa &quot;Punto Ticket (Filtrado)&quot; para exportar según el filtro de estado actual.
          </p>
        </div>
      </div>
    </div>
  );
}