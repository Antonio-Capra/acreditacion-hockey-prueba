"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  const exportCSV = () => {
    const headers = [
      "id",
      "area",
      "nombre",
      "apellido",
      "rut",
      "correo",
      "empresa",
      "status",
      "zona",
      "created_at",
    ];

    const lines = [headers.join(",")].concat(
      filtered.map((r) =>
        headers
          .map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? ""))
          .join(",")
      )
    );

    const csv = lines.join("\n");
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
    location.reload();
  };

  return (
    <main className="min-h-dvh w-full flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Encabezado */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Panel de Acreditaciones</h1>
            <p className="text-gray-600">
              Filtra, aprueba/rechaza y exporta a CSV.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="rounded-xl border px-3 py-2">
              Exportar CSV
            </button>
            <button onClick={logout} className="rounded-xl border px-3 py-2">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Filtros */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Buscar por nombre, rut, correo, empresa"
            className="rounded-xl border px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2"
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
            className="rounded-xl border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="*">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <button onClick={load} className="rounded-xl border px-3 py-2">
            Refrescar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Área</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Documento</th>
                <th className="text-left p-3">Correo</th>
                <th className="text-left p-3">Empresa</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Zona</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={9}>
                    Cargando…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={9}>
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const rowColor =
                    r.status === "aprobado"
                      ? "bg-green-50"
                      : r.status === "rechazado"
                      ? "bg-red-50"
                      : "";

                  return (
                    <tr key={r.id} className={`border-t ${rowColor}`}>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.area}</td>
                      <td className="p-3 whitespace-nowrap">
                        {r.nombre} {r.apellido}
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.rut}</td>
                      <td className="p-3 whitespace-nowrap">{r.correo}</td>
                      <td className="p-3 whitespace-nowrap">
                        {r.empresa ?? "—"}
                      </td>

                      {/* Estado */}
                      <td className="p-3 whitespace-nowrap capitalize">
                        {r.status}
                      </td>

                      {/* Zona (select editable con etiquetas nuevas) */}
                      <td className="p-3 whitespace-nowrap">
                        <select
                          className="rounded-lg border px-2 py-1"
                          value={r.zona ?? ""}
                          onChange={(e) => {
                            const val = e.target.value as Zona | "";
                            setZona(
                              r.id,
                              val === "" ? null : (val as Zona)
                            );
                          }}
                        >
                          <option value="">—</option>
                          {ZONAS.map((z) => (
                            <option key={z} value={z}>
                              {ZONA_LABEL[z]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobarConZona(r)}
                            className="rounded-lg border px-2 py-1 hover:bg-green-50"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => setEstado(r.id, "rechazado")}
                            className="rounded-lg border px-2 py-1 hover:bg-red-50"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => setEstado(r.id, "pendiente")}
                            className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                          >
                            Pendiente
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
    </main>
  );
}



