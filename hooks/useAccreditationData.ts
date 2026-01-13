import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Acreditacion } from "@/types";

export type Row = Acreditacion;

interface UseAccreditationDataProps {
  area?: string;
  status?: string;
}

export function useAccreditationData() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [area, setArea] = useState<string>("*");
  const [status, setStatus] = useState<string>("*");

  // Cargar datos desde Supabase
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

  // Ejecutar carga al montar y cuando cambian los filtros
  useEffect(() => {
    load();
  }, [load]);

  // Filtrar datos por búsqueda
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.nombre, r.apellido, r.rut, r.correo, r.empresa ?? ""].some((x) =>
        x.toLowerCase().includes(term)
      )
    );
  }, [rows, q]);

  return {
    rows,
    setRows,
    loading,
    filtered,
    q,
    setQ,
    area,
    setArea,
    status,
    setStatus,
    load,
  };
}
