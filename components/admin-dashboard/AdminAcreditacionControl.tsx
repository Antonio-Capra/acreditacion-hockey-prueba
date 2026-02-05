"use client";

import { useMemo, useState } from "react";
import { useAcreditacionConfig } from "@/hooks/useAcreditacionConfig";

const EVENTO_ID = 1;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toISOStringFromLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

export default function AdminAcreditacionControl() {
  const {
    manualOpen,
    isOpen,
    hasSchedule,
    ventanas,
    ventanasActivas,
    loading,
    saving,
    error,
    setManualOpen,
    addVentana,
    updateVentana,
    deleteVentana,
  } = useAcreditacionConfig(EVENTO_ID);

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const statusLabel = isOpen ? "Abierto" : "Cerrado";
  const manualLabel = manualOpen ? "Encendido" : "Apagado";
  const scheduleLabel = hasSchedule
    ? `Programado (${ventanasActivas.length} ventana${ventanasActivas.length === 1 ? "" : "s"})`
    : "Sin programacion";

  const nextWindow = useMemo(() => {
    if (ventanasActivas.length === 0) return null;
    const now = new Date();
    return ventanasActivas.find((ventana) => new Date(ventana.termina_en) > now) || null;
  }, [ventanasActivas]);

  const handleAddWindow = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!startsAt || !endsAt) {
      setFormError("Completa inicio y fin.");
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setFormError("Fechas invalidas.");
      return;
    }

    if (startDate >= endDate) {
      setFormError("La fecha de inicio debe ser anterior a la de termino.");
      return;
    }

    await addVentana({
      inicia_en: toISOStringFromLocal(startsAt),
      termina_en: toISOStringFromLocal(endsAt),
      nota: note.trim() || undefined,
      esta_activa: true,
    });

    setStartsAt("");
    setEndsAt("");
    setNote("");
  };

  return (
    <div className="mb-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl px-6 py-4 shadow-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e5799]">Control de Acreditacion</h2>
          <p className="text-sm text-gray-600">
            Estado efectivo: <span className="font-semibold">{statusLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Manual: {manualLabel}</span>
          <button
            type="button"
            onClick={() => setManualOpen(!manualOpen)}
            disabled={loading || saving}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              manualOpen ? "bg-green-500" : "bg-gray-300"
            } ${saving ? "opacity-60" : ""}`}
            aria-pressed={manualOpen}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                manualOpen ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-2xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs uppercase text-blue-700 font-semibold">Programacion</p>
            <p className="text-sm text-blue-900 font-medium mt-1">{scheduleLabel}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-600 font-semibold">Ventanas</p>
            <p className="text-sm text-gray-900 font-medium mt-1">{ventanas.length} registradas</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs uppercase text-amber-700 font-semibold">Proxima ventana</p>
            <p className="text-sm text-amber-900 font-medium mt-1">
              {nextWindow ? `${formatDateTime(nextWindow.inicia_en)} - ${formatDateTime(nextWindow.termina_en)}` : "No definida"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleAddWindow} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Inicio</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fin</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nota</label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ej: Apertura general"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-[#1e5799] text-white rounded-xl font-semibold hover:bg-[#207cca] transition-colors disabled:opacity-60"
            >
              Agregar ventana
            </button>
          </div>
        </form>

        {formError && (
          <div className="mb-4 text-sm text-red-600 font-medium">{formError}</div>
        )}

        <div className="space-y-3">
          {ventanas.map((ventana) => (
            <div
              key={ventana.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {formatDateTime(ventana.inicia_en)} - {formatDateTime(ventana.termina_en)}
                </p>
                {ventana.nota && <p className="text-xs text-gray-500 mt-1">{ventana.nota}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateVentana(ventana.id, { esta_activa: !ventana.esta_activa })}
                  disabled={saving}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    ventana.esta_activa
                      ? "border-green-200 bg-green-100 text-green-700"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  {ventana.esta_activa ? "Activa" : "Inactiva"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteVentana(ventana.id)}
                  disabled={saving}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {ventanas.length === 0 && (
            <div className="text-sm text-gray-500">No hay ventanas configuradas.</div>
          )}
        </div>
      </div>
    </div>
  );
}
