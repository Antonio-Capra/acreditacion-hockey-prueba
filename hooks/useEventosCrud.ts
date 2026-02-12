"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface EventoRow {
  id: number;
  nombre: string;
  fecha?: string | null;
  activo?: boolean | null;
}

export interface EventoDetail {
  name: string;
  date: string;
  time: string;
  location: string;
  opponent: string;
  localCrestUrl: string;
  opponentCrestUrl: string;
  closed: boolean;
}

const BLANK: EventoDetail = {
  name: "",
  date: "",
  time: "",
  location: "",
  opponent: "",
  localCrestUrl: "",
  opponentCrestUrl: "",
  closed: false,
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useEventosCrud() {
  const [eventos, setEventos] = useState<EventoRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<EventoDetail>(BLANK);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* helpers */
  const flashSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const flashError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  /* ======================== fetch lista ======================== */

  const fetchList = useCallback(async () => {
    try {
      setLoadingList(true);
      const { data, error: e } = await supabase
        .from("eventos")
        .select("id, nombre, fecha, activo")
        .order("id", { ascending: false });
      if (e) throw e;
      setEventos(data || []);
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Error al cargar eventos");
    } finally {
      setLoadingList(false);
    }
  }, [flashError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ======================== fetch detalle ======================== */

  const fetchDetail = useCallback(
    async (id: number) => {
      try {
        setLoadingDetail(true);
        setError(null);
        const { data, error: e } = await supabase
          .from("eventos")
          .select(
            "id, nombre, fecha, hora, lugar, rival, escudo_local_url, escudo_rival_url, activo"
          )
          .eq("id", id)
          .single();
        if (e) throw e;
        if (data) {
          setDetail({
            name: data.nombre ?? "",
            date: data.fecha ?? "",
            time: data.hora ?? "",
            location: data.lugar ?? "",
            opponent: data.rival ?? "",
            localCrestUrl: data.escudo_local_url ?? "",
            opponentCrestUrl: data.escudo_rival_url ?? "",
            closed: data.activo === false,
          });
        }
      } catch (err) {
        flashError(err instanceof Error ? err.message : "Error al cargar evento");
      } finally {
        setLoadingDetail(false);
      }
    },
    [flashError]
  );

  /* Cuando cambia selectedId, carga detalle */
  useEffect(() => {
    if (selectedId !== null) {
      fetchDetail(selectedId);
    } else {
      setDetail(BLANK);
    }
  }, [selectedId, fetchDetail]);

  /* ======================== select ======================== */

  const select = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  /* ======================== crear ======================== */

  const create = useCallback(async (): Promise<number | null> => {
    try {
      setSaving(true);
      setError(null);
      const { data, error: e } = await supabase
        .from("eventos")
        .insert({ nombre: "Nuevo evento", activo: false })
        .select("id")
        .single();
      if (e) throw e;
      if (data?.id) {
        await fetchList();
        setSelectedId(data.id);
        flashSuccess("Evento creado — completa los datos y guarda");
        return data.id;
      }
      return null;
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Error al crear evento");
      return null;
    } finally {
      setSaving(false);
    }
  }, [fetchList, flashSuccess, flashError]);

  /* ======================== guardar ======================== */

  const save = useCallback(async (): Promise<boolean> => {
    if (!selectedId) return false;
    if (!detail.name.trim()) {
      flashError("El nombre del evento no puede estar vacío");
      return false;
    }
    try {
      setSaving(true);
      setError(null);
      const { error: e } = await supabase
        .from("eventos")
        .update({
          nombre: detail.name,
          fecha: detail.date || null,
          hora: detail.time || null,
          lugar: detail.location,
          rival: detail.opponent,
          escudo_local_url: detail.localCrestUrl || null,
          escudo_rival_url: detail.opponentCrestUrl || null,
          activo: !detail.closed,
        })
        .eq("id", selectedId);
      if (e) throw e;
      flashSuccess("Evento guardado");
      await fetchList();
      return true;
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, detail, fetchList, flashSuccess, flashError]);

  /* ======================== activar ======================== */

  const activate = useCallback(async (): Promise<boolean> => {
    if (!selectedId) return false;
    try {
      setSaving(true);
      setError(null);
      const { error: e1 } = await supabase
        .from("eventos")
        .update({ activo: false })
        .neq("id", selectedId);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("eventos")
        .update({ activo: true })
        .eq("id", selectedId);
      if (e2) throw e2;
      setDetail((prev) => ({ ...prev, closed: false }));
      flashSuccess("Evento marcado como activo");
      await fetchList();
      return true;
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Error al activar");
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, fetchList, flashSuccess, flashError]);

  /* ======================== eliminar ======================== */

  const remove = useCallback(async (): Promise<number | null> => {
    if (!selectedId) return null;
    if (eventos.length <= 1) {
      flashError("No puedes eliminar el único evento");
      return null;
    }
    try {
      setSaving(true);
      setError(null);

      const checks = await Promise.all([
        supabase.from("acreditados").select("id", { count: "exact", head: true }).eq("evento_id", selectedId),
        supabase.from("ventanas_acreditacion").select("id", { count: "exact", head: true }).eq("evento_id", selectedId),
        supabase.from("configuracion_acreditacion").select("id", { count: "exact", head: true }).eq("evento_id", selectedId),
      ]);

      if (checks.some((r) => (r.count ?? 0) > 0)) {
        flashError(
          "No se puede eliminar: tiene datos asociados (acreditados, zonas, etc.). Ciérralo y crea uno nuevo."
        );
        return null;
      }

      const { error: e } = await supabase.from("eventos").delete().eq("id", selectedId);
      if (e) throw e;

      const nextEvt = eventos.find((ev) => ev.id !== selectedId);
      const nextId = nextEvt?.id ?? null;
      setSelectedId(nextId);
      await fetchList();
      flashSuccess("Evento eliminado");
      return nextId;
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Error al eliminar");
      return null;
    } finally {
      setSaving(false);
    }
  }, [selectedId, eventos, fetchList, flashSuccess, flashError]);

  /* ======================== update form field ======================== */

  const updateField = useCallback(<K extends keyof EventoDetail>(key: K, value: EventoDetail[K]) => {
    setDetail((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ======================== return ======================== */

  return {
    // lista
    eventos,
    loadingList,
    // selección
    selectedId,
    select,
    // detalle
    detail,
    loadingDetail,
    updateField,
    // operaciones
    saving,
    create,
    save,
    activate,
    remove,
    // feedback
    error,
    success,
    setError,
    clearMessages,
    // helpers
    isActiveEvent: eventos.find((e) => e.id === selectedId)?.activo === true,
  };
}
