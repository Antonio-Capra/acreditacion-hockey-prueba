"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

/** ===== Tipos ===== */
type Zona = `Zona ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | null;

export type Row = {
  id: number;
  area: string;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  empresa: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  created_at: string;
  zona: Zona;
};

/** ===== Constantes ===== */
const AREAS = [
  "Producción",
  "Voluntarios",
  "Auspiciadores",
  "Proveedores",
  "Fan Fest",
  "Prensa",
] as const;

// Mapa: valor guardado -> texto que se muestra en el select
const ZONA_LABEL: Record<Exclude<Zona, null>, string> = {
  "Zona 1": "Zona 1.Venue",
  "Zona 2": "Zona 2.FOP",
  "Zona 3": "Zona 3.LOC",
  "Zona 4": "Zona 4.VIP",
  "Zona 5": "Zona 5.Broadcast",
  "Zona 6": "Zona 6.Officials",
  "Zona 7": "Zona 7.Media",
  "Zona 8": "Zona 8.Volunteers",
  "Zona 9": "Todas las zonas", // 👈 nueva zona, texto frontend
};

// Lista de valores internos (lo que se guarda en la BD)
const ZONAS = Object.keys(ZONA_LABEL) as Exclude<Zona, null>[];

/** ===== Componente ===== */
export default function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [area, setArea] = useState<string>("*");
  const [status, setStatus] = useState<string>("*");

  const load = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("acreditaciones")
      .select(
        "id,area,nombre,apellido,rut,correo,empresa,status,created_at,zona"
      )
      .order("created_at", { ascending: false });

    if (area !== "*") query = query.eq("area", area);
    if (status !== "*") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) console.error(error);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [area, status]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.nombre, r.apellido, r.rut, r.correo, r.empresa ?? ""].some((x) =>
        x.toLowerCase().includes(term)
      )
    );
  }, [rows, q]);

  const setEstado = async (id: number, nuevo: Row["status"]) => {
    const { error } = await supabase
      .from("acreditaciones")
      .update({ status: nuevo })
      .eq("id", id);
    if (error) return alert(error.message);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nuevo } : r))
    );
  };

  const setZona = async (id: number, zona: Zona) => {
    const { error } = await supabase
      .from("acreditaciones")
      .update({ zona })
      .eq("id", id);
    if (error) return alert(error.message);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, zona } : r)));
  };

  const aprobarConZona = async (r: Row) => {
    if (!r.zona) {
      alert("Debes seleccionar una zona antes de aprobar.");
      return;
    }

    // 1) Actualiza en Supabase
    const { error } = await supabase
      .from("acreditaciones")
      .update({ status: "aprobado", zona: r.zona })
      .eq("id", r.id);

    if (error) {
      alert(error.message);
      return;
    }

    // Actualiza estado local
    setRows((prev) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, status: "aprobado", zona: r.zona } : x
      )
    );

    // 2) Envía el correo (no rompe nada si falla)
    try {
      await fetch("/api/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: r.nombre,
          apellido: r.apellido,
          correo: r.correo,
          zona: r.zona,
          area: r.area,
        }),
      });
    } catch (e) {
      console.error("Error enviando correo de aprobación", e);
    }
  };

  const eliminarRegistro = async (r: Row) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la acreditación de ${r.nombre} ${r.apellido}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    const { error } = await supabase
      .from("acreditaciones")
      .delete()
      .eq("id", r.id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      return;
    }

    // Elimina del estado local
    setRows((prev) => prev.filter((x) => x.id !== r.id));
  };

  const exportCSV = () => {
    // Headers en español más descriptivos
    const headers = [
      "ID",
      "Área",
      "Nombre",
      "Apellido",
      "RUT/Documento",
      "Correo Electrónico",
      "Empresa/Medio",
      "Estado",
      "Zona Asignada",
      "Fecha de Solicitud",
    ];

    const lines = [headers.join(",")].concat(
      filtered.map((r) => {
        // Formatear fecha legible
        const fecha = new Date(r.created_at).toLocaleString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Traducir estado
        const estadoES =
          r.status === "pendiente"
            ? "Pendiente"
            : r.status === "aprobado"
            ? "Aprobado"
            : "Rechazado";

        // Usar el label legible de zona si existe
        const zonaLegible = r.zona ? ZONA_LABEL[r.zona] : "Sin asignar";

        const row = [
          r.id,
          r.area,
          r.nombre,
          r.apellido,
          r.rut,
          r.correo,
          r.empresa || "N/A",
          estadoES,
          zonaLegible,
          fecha,
        ];

        return row.map((val) => JSON.stringify(String(val))).join(",");
      })
    );

    const csv = "\uFEFF" + lines.join("\n"); // BOM para que Excel reconozca UTF-8
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acreditaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // No necesitamos location.reload() porque onAuthStateChange actualiza automáticamente
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#1e5799] to-[#7db9e8] relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          {/* Encabezado con logo */}
          <header className="mb-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col gap-4">
              {/* Logo y título */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-10 sm:w-32 sm:h-12">
                    <Image
                      src="/UCimg/EscudoUC.png"
                      alt="Escudo UC"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="border-l-2 border-blue-300 pl-3 sm:pl-4">
                    <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#1e5799] to-[#7db9e8] bg-clip-text text-transparent">
                      Panel de acreditaciones
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Gestión de solicitudes de acreditación
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e5799] to-[#7db9e8] hover:shadow-lg text-white hover:text-[#1e5799] font-semibold px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Exportar CSV</span>
                    <span className="sm:hidden">Exportar</span>
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Filtros */}
          <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-5 border border-blue-100">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Filtros de búsqueda</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  placeholder="Buscar por nombre, rut, correo, empresa"
                  className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <select
                className="rounded-xl border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="*">Todas las áreas</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="*">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
              <button
                onClick={load}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e5799] to-[#7db9e8] hover:shadow-lg text-white font-semibold px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refrescar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-100">
            {/* Indicador de scroll en móvil */}
            <div className="block sm:hidden bg-blue-50 px-4 py-2 text-center">
              <p className="text-xs text-blue-700">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Desliza para ver más columnas
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-[#1e5799] to-[#7db9e8] text-white">
                  <tr>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Fecha</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Área</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Nombre</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Documento</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Correo</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Empresa</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Estado</th>
                    <th className="text-left p-2 sm:p-4 font-semibold border-r border-white/20 text-xs sm:text-sm">Zona</th>
                    <th className="text-left p-2 sm:p-4 font-semibold text-xs sm:text-sm">Acciones</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td className="p-8 text-center" colSpan={9}>
                        <div className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-600 font-medium">Cargando acreditaciones...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="p-8 text-center" colSpan={9}>
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 font-medium">No se encontraron resultados</p>
                          <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const rowColor =
                        r.status === "aprobado"
                          ? "bg-green-50 hover:bg-green-100"
                          : r.status === "rechazado"
                          ? "bg-red-50 hover:bg-red-100"
                          : "hover:bg-gray-50";

                      return (
                        <tr key={r.id} className={`border-t border-gray-200 transition-colors ${rowColor}`}>
                          <td className="p-2 sm:p-4 whitespace-nowrap text-gray-600 border-r border-gray-200">
                            <div className="text-xs">
                              {new Date(r.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(r.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-2 sm:p-4 whitespace-nowrap border-r border-gray-200">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {r.area}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200 text-xs sm:text-sm">
                            {r.nombre} {r.apellido}
                          </td>
                          <td className="p-2 sm:p-4 whitespace-nowrap text-gray-600 font-mono text-xs border-r border-gray-200">
                            {r.rut}
                          </td>
                          <td className="p-2 sm:p-4 whitespace-nowrap text-gray-600 text-xs border-r border-gray-200">
                            {r.correo}
                          </td>
                          <td className="p-2 sm:p-4 whitespace-nowrap text-gray-600 border-r border-gray-200 text-xs sm:text-sm">
                            {r.empresa ?? "—"}
                          </td>

                          {/* Estado */}
                          <td className="p-2 sm:p-4 whitespace-nowrap border-r border-gray-200">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              r.status === "aprobado"
                                ? "bg-green-100 text-green-800"
                                : r.status === "rechazado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {r.status}
                            </span>
                          </td>

                          {/* Zona (select editable con etiquetas nuevas) */}
                          <td className="p-2 sm:p-4 whitespace-nowrap border-r border-gray-200">
                            <select
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white"
                              value={r.zona ?? ""}
                              onChange={(e) => {
                                const val = e.target.value as Zona | "";
                                setZona(
                                  r.id,
                                  val === "" ? null : (val as Zona)
                                );
                              }}
                            >
                              <option value="">Sin asignar</option>
                              {ZONAS.map((z) => (
                                <option key={z} value={z}>
                                  {ZONA_LABEL[z]}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-2 sm:p-4 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <button
                                onClick={() => aprobarConZona(r)}
                                className="group relative inline-flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                title="Aprobar"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  Aprobar
                                </span>
                              </button>
                              <button
                                onClick={() => setEstado(r.id, "rechazado")}
                                className="group relative inline-flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                title="Rechazar"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  Rechazar
                                </span>
                              </button>
                              <button
                                onClick={() => setEstado(r.id, "pendiente")}
                                className="group relative inline-flex items-center justify-center rounded-lg bg-gray-500 hover:bg-gray-600 text-white px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                title="Marcar como pendiente"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  Pendiente
                                </span>
                              </button>
                              <button
                                onClick={() => eliminarRegistro(r)}
                                className="group relative inline-flex items-center justify-center rounded-lg bg-[#2989d8] hover:bg-[#207cca] text-white px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                                title="Eliminar registro"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  Eliminar
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



