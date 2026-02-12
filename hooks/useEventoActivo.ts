"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface EventoActivo {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  rival: string;
  escudo_local_url?: string | null;
  escudo_rival_url?: string | null;
  descripcion?: string | null;
  activo?: boolean | null;
}

const DEFAULT_EVENTO: EventoActivo = {
  id: 1,
  nombre: "Universidad Catolica",
  fecha: "2026-02-08",
  hora: "20:30",
  lugar: "Claro Arena",
  rival: "Deportes Concepcion",
  escudo_local_url: "/UCimg/EscudoUC1.png",
  escudo_rival_url: "/UCimg/EscudoConce.png",
  descripcion: null,
  activo: true,
};

export function useEventoActivo() {
  const [evento, setEvento] = useState<EventoActivo>(DEFAULT_EVENTO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("eventos")
        .select(
          "id, nombre, descripcion, fecha, hora, lugar, rival, escudo_local_url, escudo_rival_url, activo"
        )
        .eq("activo", true)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setEvento((prev) => ({
          ...prev,
          ...data,
          id: data.id ?? prev.id,
          nombre: data.nombre ?? prev.nombre,
          fecha: data.fecha ?? prev.fecha,
          hora: data.hora ?? prev.hora,
          lugar: data.lugar ?? prev.lugar,
          rival: data.rival ?? prev.rival,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar evento";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvento();
  }, [fetchEvento]);

  return {
    evento,
    loading,
    error,
    refresh: fetchEvento,
  };
}
