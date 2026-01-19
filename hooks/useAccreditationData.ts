import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      .from("acreditados")
      .select(
        "id,nombre,primer_apellido,segundo_apellido,rut,email,cargo,tipo_credencial,numero_credencial,area,empresa,zona_id,status,motivo_rechazo,responsable_nombre,responsable_email,responsable_telefono,created_at"
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
      [r.nombre, r.primer_apellido + (r.segundo_apellido ? ` ${r.segundo_apellido}` : ''), r.rut, r.email, r.empresa ?? ""].some((x) =>
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
