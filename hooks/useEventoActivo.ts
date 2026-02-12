"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface EventoActivo {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  local: string;
  rival: string;
  escudo_local_url?: string | null;
  escudo_rival_url?: string | null;
  descripcion?: string | null;
  activo?: boolean | null;
}

export function useEventoActivo() {
  const [evento, setEvento] = useState<EventoActivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("eventos")
        .select(
          "id, nombre, descripcion, fecha, hora, lugar, local, rival, escudo_local_url, escudo_rival_url, activo"
        )
        .eq("activo", true)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setEvento(data);
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
