"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ConfiguracionAcreditacion {
  id: number;
  evento_id: number;
  esta_abierta: boolean;
  actualizado_en: string;
}

export interface VentanaAcreditacion {
  id: number;
  evento_id: number;
  inicia_en: string;
  termina_en: string;
  esta_activa: boolean;
  nota?: string | null;
}

const DEFAULT_CLOSE_MESSAGE =
  "Lamentablemente ya no estas en tiempo de acreditarte. El plazo de acreditacion ha finalizado.";

const isDateWithinWindow = (now: Date, window: VentanaAcreditacion) => {
  const startsAt = new Date(window.inicia_en).getTime();
  const endsAt = new Date(window.termina_en).getTime();
  const current = now.getTime();
  return current >= startsAt && current <= endsAt;
};

export function useAcreditacionConfig(eventoId: number) {
  const [config, setConfig] = useState<ConfiguracionAcreditacion | null>(null);
  const [ventanas, setVentanas] = useState<VentanaAcreditacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: configData, error: configError } = await supabase
        .from("configuracion_acreditacion")
        .select("id, evento_id, esta_abierta, actualizado_en")
        .eq("evento_id", eventoId)
        .single();

      if (configError && configError.code !== "PGRST116") {
        throw configError;
      }

      const { data: ventanasData, error: ventanasError } = await supabase
        .from("ventanas_acreditacion")
        .select("id, evento_id, inicia_en, termina_en, esta_activa, nota")
        .eq("evento_id", eventoId)
        .order("inicia_en", { ascending: true });

      if (ventanasError) {
        throw ventanasError;
      }

      setConfig(configData || null);
      setVentanas(ventanasData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar configuracion";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const ventanasActivas = useMemo(
    () => ventanas.filter((ventana) => ventana.esta_activa),
    [ventanas]
  );

  const isWithinWindow = useMemo(() => {
    if (ventanasActivas.length === 0) return false;
    const now = new Date();
    return ventanasActivas.some((ventana) => isDateWithinWindow(now, ventana));
  }, [ventanasActivas]);

  const hasSchedule = ventanasActivas.length > 0;
  const manualOpen = config?.esta_abierta ?? true;
  const isOpen = manualOpen && (!hasSchedule || isWithinWindow);

  const setManualOpen = async (value: boolean) => {
    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("configuracion_acreditacion")
        .upsert(
          {
            evento_id: eventoId,
            esta_abierta: value,
            actualizado_en: new Date().toISOString(),
          },
          { onConflict: "evento_id" }
        )
        .select("id, evento_id, esta_abierta, actualizado_en")
        .single();

      if (updateError) throw updateError;

      setConfig(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar configuracion";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const addVentana = async (payload: {
    inicia_en: string;
    termina_en: string;
    nota?: string;
    esta_activa?: boolean;
  }) => {
    try {
      setSaving(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from("ventanas_acreditacion")
        .insert({
          evento_id: eventoId,
          inicia_en: payload.inicia_en,
          termina_en: payload.termina_en,
          nota: payload.nota || null,
          esta_activa: payload.esta_activa ?? true,
        })
        .select("id, evento_id, inicia_en, termina_en, esta_activa, nota")
        .single();

      if (insertError) throw insertError;

      setVentanas((prev) => [...prev, data].sort((a, b) => a.inicia_en.localeCompare(b.inicia_en)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear ventana";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateVentana = async (id: number, updates: Partial<VentanaAcreditacion>) => {
    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("ventanas_acreditacion")
        .update(updates)
        .eq("id", id)
        .select("id, evento_id, inicia_en, termina_en, esta_activa, nota")
        .single();

      if (updateError) throw updateError;

      setVentanas((prev) =>
        prev
          .map((ventana) => (ventana.id === id ? data : ventana))
          .sort((a, b) => a.inicia_en.localeCompare(b.inicia_en))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar ventana";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteVentana = async (id: number) => {
    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("ventanas_acreditacion")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setVentanas((prev) => prev.filter((ventana) => ventana.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar ventana";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    ventanas,
    ventanasActivas,
    hasSchedule,
    isWithinWindow,
    isOpen,
    manualOpen,
    loading,
    saving,
    error,
    closeMessage: DEFAULT_CLOSE_MESSAGE,
    refresh: fetchConfig,
    setManualOpen,
    addVentana,
    updateVentana,
    deleteVentana,
  };
}
