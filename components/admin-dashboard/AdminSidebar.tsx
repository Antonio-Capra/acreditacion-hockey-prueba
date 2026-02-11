"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface EventInfo {
  name: string;
  date: string;
  time: string;
  location: string;
  opponent: string;
  localCrestUrl: string;
  opponentCrestUrl: string;
}

const DEFAULT_EVENT: EventInfo = {
  name: "Universidad Catolica vs Deportes Concepcion",
  date: "2026-02-08",
  time: "12:30",
  location: "Claro Arena",
  opponent: "Deportes Concepcion",
  localCrestUrl: "",
  opponentCrestUrl: "",
};

interface EventoOption {
  id: number;
  nombre: string;
  fecha?: string | null;
  activo?: boolean | null;
}

interface AdminSidebarProps {
  eventoId: number | null;
  onEventoChange: (id: number) => void;
}

export default function AdminSidebar({ eventoId, onEventoChange }: AdminSidebarProps) {
  const [eventInfo, setEventInfo] = useState<EventInfo>(DEFAULT_EVENT);
  const [eventClosed, setEventClosed] = useState(false);
  const [eventos, setEventos] = useState<EventoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const activeEventoId = eventoId ?? eventos.find((evt) => evt.activo)?.id ?? null;
  const selectedEventoId = activeEventoId ?? eventoId;
  const selectedEventoLabel = useMemo(() => {
    const match = eventos.find((evt) => evt.id === selectedEventoId);
    if (!match) return "Seleccionar evento";
    const base = match.nombre || `Evento ${match.id}`;
    return match.activo ? `${base} (Activo)` : base;
  }, [eventos, selectedEventoId]);

  const fetchEventos = async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("eventos")
        .select("id, nombre, fecha, activo")
        .order("id", { ascending: false });

      if (fetchError) throw fetchError;

      setEventos(data || []);

      const active = (data || []).find((evt) => evt.activo);
      if (!eventoId && active) {
        onEventoChange(active.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar evento";
      setError(message);
    }
  };

  useEffect(() => {
      try {
      fetchEventos();
    } catch {
      // Errors are handled inside fetchEventos
    }
  }, [eventoId, onEventoChange]);

  useEffect(() => {
    const fetchEvento = async () => {
      if (!selectedEventoId) return;
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("eventos")
          .select(
            "id, nombre, fecha, hora, lugar, rival, escudo_local_url, escudo_rival_url, activo"
          )
          .eq("id", selectedEventoId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setEventInfo({
            name: data.nombre ?? DEFAULT_EVENT.name,
            date: data.fecha ?? DEFAULT_EVENT.date,
            time: data.hora ?? DEFAULT_EVENT.time,
            location: data.lugar ?? DEFAULT_EVENT.location,
            opponent: data.rival ?? DEFAULT_EVENT.opponent,
            localCrestUrl: data.escudo_local_url ?? "",
            opponentCrestUrl: data.escudo_rival_url ?? "",
          });
          setEventClosed(data.activo === false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar evento";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [selectedEventoId]);

  const handleSave = async () => {
    try {
      if (!selectedEventoId) return;
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from("eventos")
        .update({
          nombre: eventInfo.name,
          fecha: eventInfo.date || null,
          hora: eventInfo.time || null,
          lugar: eventInfo.location,
          rival: eventInfo.opponent,
          escudo_local_url: eventInfo.localCrestUrl || null,
          escudo_rival_url: eventInfo.opponentCrestUrl || null,
          activo: !eventClosed,
        })
        .eq("id", selectedEventoId);

      if (updateError) throw updateError;

      setSuccess("Evento actualizado");
      setTimeout(() => setSuccess(null), 2500);
      onEventoChange(selectedEventoId);
      fetchEventos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async () => {
    try {
      if (!selectedEventoId) return;
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error: deactivateError } = await supabase
        .from("eventos")
        .update({ activo: false })
        .neq("id", selectedEventoId);

      if (deactivateError) throw deactivateError;

      const { error: activateError } = await supabase
        .from("eventos")
        .update({ activo: true })
        .eq("id", selectedEventoId);

      if (activateError) throw activateError;

      setEventClosed(false);
      setSuccess("Evento marcado como activo");
      setTimeout(() => setSuccess(null), 2500);
      onEventoChange(selectedEventoId);
      fetchEventos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al activar evento";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { data, error: insertError } = await supabase
        .from("eventos")
        .insert({
          nombre: "Nuevo evento",
          fecha: DEFAULT_EVENT.date,
          hora: DEFAULT_EVENT.time,
          lugar: DEFAULT_EVENT.location,
          rival: DEFAULT_EVENT.opponent,
          escudo_local_url: DEFAULT_EVENT.localCrestUrl || null,
          escudo_rival_url: DEFAULT_EVENT.opponentCrestUrl || null,
          activo: false,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (data?.id) {
        onEventoChange(data.id);
        fetchEventos();
        setSuccess("Evento creado (borrador)");
        setTimeout(() => setSuccess(null), 2500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear evento";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (!selectedEventoId) return;
      if (eventos.length <= 1) {
        setError("No puedes eliminar el unico evento.");
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      const checks = await Promise.all([
        supabase
          .from("acreditados")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", selectedEventoId),
        supabase
          .from("ventanas_acreditacion")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", selectedEventoId),
        supabase
          .from("configuracion_acreditacion")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", selectedEventoId),
        supabase
          .from("zonas_acreditacion")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", selectedEventoId),
        supabase
          .from("areas_prensa")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", selectedEventoId),
      ]);

      const hasData = checks.some((res) => (res.count ?? 0) > 0);
      if (hasData) {
        setError(
          "No se puede eliminar: el evento tiene datos asociados. Cierra el evento y crea uno nuevo."
        );
        return;
      }

      const { error: deleteError } = await supabase
        .from("eventos")
        .delete()
        .eq("id", selectedEventoId);

      if (deleteError) throw deleteError;

      const nextEventId = eventos.find((evt) => evt.id !== selectedEventoId)?.id ?? null;
      if (nextEventId) {
        onEventoChange(nextEventId);
      }
      fetchEventos();
      setSuccess("Evento eliminado");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar evento";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative px-6 py-5 bg-[radial-gradient(120%_120%_at_0%_0%,#2f7cc9_0%,#1e5799_45%,#0f3b70_100%)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Configuracion
              </p>
              <h2 className="text-white font-bold text-xl">Panel del Evento</h2>
            </div>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              Admin
            </span>
          </div>
          <p className="text-white/80 text-xs mt-2">
            Actualiza datos del evento.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              {success}
            </div>
          )}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-blue-700 font-semibold">Evento seleccionado</p>
                <p className="text-base text-blue-900 font-semibold mt-1">{eventInfo.name}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {eventInfo.date} · {eventInfo.time} · {eventInfo.location}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  eventClosed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {eventClosed ? "Cerrado" : "Activo"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">Gestion</p>
                <p className="text-sm font-semibold text-gray-800">Eventos</p>
              </div>
              <span className="text-xs text-gray-400">{eventos.length} total</span>
            </div>
            <label className="block text-xs font-semibold text-gray-600">
              Seleccionar evento
              <select
                value={selectedEventoId ?? ""}
                onChange={(e) => onEventoChange(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                disabled={loading || eventos.length === 0}
              >
                <option value="" disabled>
                  {selectedEventoLabel || "Seleccionar evento"}
                </option>
                {eventos.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.nombre || `Evento ${evt.id}`}
                    {evt.activo ? " (Activo)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={saving}
                className="w-full px-4 py-2 border border-[#1e5799] text-[#1e5799] rounded-xl font-semibold hover:bg-[#1e5799]/10 transition-colors disabled:opacity-60"
              >
                Crear borrador
              </button>
              <button
                type="button"
                onClick={handleSetActive}
                disabled={saving || !selectedEventoId}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                Marcar como activo
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={saving || eventos.length <= 1}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Eliminar evento
              </button>
            </div>
          </div>

          <details open className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-[#1e5799] flex items-center justify-between">
              Ficha del evento
              <span className="text-xs text-gray-400 group-open:rotate-180 transition">▾</span>
            </summary>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="block text-xs font-semibold text-gray-600">
                Nombre del evento
                <input
                  type="text"
                  value={eventInfo.name}
                  onChange={(e) => setEventInfo({ ...eventInfo, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Fecha
                <input
                  type="date"
                  value={eventInfo.date}
                  onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Hora
                <input
                  type="time"
                  value={eventInfo.time}
                  onChange={(e) => setEventInfo({ ...eventInfo, time: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Lugar
                <input
                  type="text"
                  value={eventInfo.location}
                  onChange={(e) => setEventInfo({ ...eventInfo, location: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Rival
                <input
                  type="text"
                  value={eventInfo.opponent}
                  onChange={(e) => setEventInfo({ ...eventInfo, opponent: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Escudo organizador (URL)
                <input
                  type="url"
                  value={eventInfo.localCrestUrl}
                  onChange={(e) => setEventInfo({ ...eventInfo, localCrestUrl: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  placeholder="https://..."
                  disabled={loading}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Escudo rival (URL)
                <input
                  type="url"
                  value={eventInfo.opponentCrestUrl}
                  onChange={(e) => setEventInfo({ ...eventInfo, opponentCrestUrl: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  placeholder="https://..."
                  disabled={loading}
                />
              </label>
            </div>
          </details>

          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Evento cerrado</p>
                <p className="text-xs text-gray-500">Si esta cerrado, el evento deja de estar activo</p>
              </div>
              <button
                type="button"
                onClick={() => setEventClosed(!eventClosed)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  eventClosed ? "bg-red-500" : "bg-gray-300"
                }`}
                aria-pressed={eventClosed}
                disabled={loading}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    eventClosed ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e5799]/20 bg-gradient-to-r from-[#1e5799]/10 to-[#2989d8]/10 p-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full px-4 py-2 bg-[#1e5799] text-white rounded-xl font-semibold hover:bg-[#207cca] transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title="Eliminar evento"
        message={`Se eliminara el evento "${eventInfo.name}". Esta accion no se puede deshacer.`}
        confirmText="Si, eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          handleDeleteEvent();
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
        isLoading={saving}
      />
    </section>
  );
}
