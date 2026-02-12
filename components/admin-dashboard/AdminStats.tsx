"use client";

import { useState, useEffect } from "react";

interface EmailIssue {
  id: number;
  to_email: string;
  nombre: string;
  apellido: string;
  email_type: string;
  status: string;
  bounce_type: string | null;
  bounce_message: string | null;
  updated_at: string;
}

interface AdminStatsProps {
  acreditaciones: Array<{ status: string; zona_id?: number | null }>;
  eventoId?: number | null;
  zonas?: Array<{ id: number; nombre: string }>;
}

export default function AdminStats({ acreditaciones, eventoId, zonas = [] }: AdminStatsProps) {
  const [emailIssues, setEmailIssues] = useState<EmailIssue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const total = acreditaciones.length;
  const pendientes = acreditaciones.filter(a => a.status === 'pendiente').length;
  const aprobadas = acreditaciones.filter(a => a.status === 'aprobado').length;
  const rechazadas = acreditaciones.filter(a => a.status === 'rechazado').length;

  // Agrupar aprobadas por zona
  const approvedByZone = (() => {
    const map = new Map<string, number>();

    // contar por zona_id
    acreditaciones.forEach((a) => {
      if (a.status !== 'aprobado') return;
      const zid = a.zona_id ?? -1;
      const zoneName = zid === -1 ? 'Sin asignar' : (zonas.find(z => z.id === zid)?.nombre ?? `Zona ${zid}`);
      map.set(zoneName, (map.get(zoneName) || 0) + 1);
    });

    return Array.from(map.entries()); // [ [zoneName, count], ... ]
  })();

  // Fetch email issues (filtrar por evento si se provee)
  useEffect(() => {
    const fetchEmailIssues = async () => {
      try {
        const query = eventoId ? `?evento_id=${eventoId}` : "";
        const res = await fetch(`/api/admin/email-issues${query}`);
        if (!res.ok) {
          console.error("Email issues response not ok:", res.status);
          setEmailIssues([]);
          return;
        }
        const text = await res.text();
        if (!text) {
          setEmailIssues([]);
          return;
        }
        const data = JSON.parse(text);
        setEmailIssues(data.issues || []);
      } catch (error) {
        console.error("Error fetching email issues:", error);
        setEmailIssues([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmailIssues();
  }, [eventoId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "bounced": return "Rebotado";
      case "complained": return "Spam";
      case "delayed": return "Retrasado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bounced": return "bg-red-100 text-red-800";
      case "complained": return "bg-orange-100 text-orange-800";
      case "delayed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 relative">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Acreditaciones</p>
              <p className="text-4xl font-bold text-[#1e5799] mt-2">{total}</p>
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
              <p className="text-4xl font-bold text-yellow-600 mt-2">{pendientes}</p>
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
              <p className="text-4xl font-bold text-green-600 mt-2">{aprobadas}</p>

              {/* Desglose por zona */}
              {approvedByZone.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {approvedByZone.map(([zoneName, count]) => (
                    <span key={zoneName} className="text-xs px-2 py-1 bg-green-800 text-white rounded-full border border-green-100">
                      {zoneName} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-5xl ">
              ✅
            </div>
          </div>
        </div>

        {/* Rechazadas */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Rechazadas</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{rechazadas}</p>
            </div>
            <div className="text-5xl">
              ❌
            </div>
          </div>
        </div>

        {/* Badge de alerta - solo aparece si hay issues */}
        {!isLoading && emailIssues.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full md:col-span-4 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-3 transition-all cursor-pointer group"
          >
            <span className="text-2xl">⚠️</span>
            <span className="text-red-700 font-medium">
              {emailIssues.length} email{emailIssues.length > 1 ? "s" : ""} con problemas
            </span>
            <span className="text-red-500 text-sm group-hover:underline">
              Ver detalles →
            </span>
          </button>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                <h2 className="text-lg font-bold text-red-800">Emails con problemas</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {emailIssues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay emails con problemas</p>
              ) : (
                <div className="space-y-3">
                  {emailIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {issue.nombre} {issue.apellido}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{issue.to_email}</p>
                          {issue.bounce_message && (
                            <p className="text-xs text-red-600 mt-1 line-clamp-2">
                              {issue.bounce_message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {getStatusLabel(issue.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {issue.email_type === "approval" ? "Aprobación" : "Rechazo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-100 p-4">
              <p className="text-xs text-gray-500 text-center">
                Los emails rebotados indican direcciones inválidas o buzones llenos.
                Considera contactar a estas personas por otro medio.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}