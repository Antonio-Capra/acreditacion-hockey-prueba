"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useEventosCrud } from "@/hooks/useEventosCrud";
import { useCrestUpload } from "@/hooks/useCrestUpload";
import ConfirmationModal from "@/components/common/ConfirmationModal";

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

interface AdminSidebarProps {
  eventoId: number | null;
  onEventoChange: (id: number) => void;
}

/* ================================================================== */
/*  Sub-componentes internos                                           */
/* ================================================================== */

/* ---- Selector de eventos ---- */

function EventSelector({
  eventos,
  selectedId,
  loading,
  onSelect,
  onCreate,
  creating,
}: {
  eventos: { id: number; nombre: string; activo?: boolean | null }[];
  selectedId: number | null;
  loading: boolean;
  onSelect: (id: number | null) => void;
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase">
        📋 Evento
      </label>
      <div className="flex gap-2 items-stretch">
        <div className="relative flex-1">
          <select
            className="w-full appearance-none border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-base font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer pr-10"
            value={selectedId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onSelect(val ? Number(val) : null);
            }}
            disabled={loading}
          >
            <option value="">— Seleccionar evento —</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre} {ev.activo ? " ★" : ""}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 8 4 4 4-4"/></svg>
          </div>
        </div>

        <button
          onClick={onCreate}
          disabled={creating}
          className="shrink-0 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-base font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
          title="Crear nuevo evento"
        >
          {creating ? (
            <span className="animate-pulse">…</span>
          ) : (
            <span className="flex items-center gap-1">＋ Crear</span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---- Formulario del evento ---- */

function EventForm({
  detail,
  onChange,
}: {
  detail: {
    name: string;
    date: string;
    time: string;
    location: string;
    opponent: string;
  };
  onChange: <K extends "name" | "date" | "time" | "location" | "opponent">(
    key: K,
    value: string
  ) => void;
}) {
  const inputClass = "w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:outline-none transition-all";

  return (
    <div className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase mb-1.5">
          ✏️ Nombre del evento
        </label>
        <input
          type="text"
          value={detail.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={inputClass}
          placeholder="Ej: UC vs Rival - Fecha X"
        />
      </div>

      {/* Fecha + Hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase mb-1.5">
            📅 Fecha
          </label>
          <input
            type="date"
            value={detail.date}
            onChange={(e) => onChange("date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase mb-1.5">
            🕐 Hora
          </label>
          <input
            type="time"
            value={detail.time}
            onChange={(e) => onChange("time", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Lugar + Rival */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase mb-1.5">
            📍 Lugar
          </label>
          <input
            type="text"
            value={detail.location}
            onChange={(e) => onChange("location", e.target.value)}
            className={inputClass}
            placeholder="Ej: San Carlos de Apoquindo"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase mb-1.5">
            🆚 Rival
          </label>
          <input
            type="text"
            value={detail.opponent}
            onChange={(e) => onChange("opponent", e.target.value)}
            className={inputClass}
            placeholder="Ej: Colo Colo"
          />
        </div>
      </div>
    </div>
  );
}

/* ---- Uploader de escudos ---- */

function CrestUploader({
  label,
  url,
  onUrlChange,
  busy,
  onFile,
}: {
  label: string;
  url: string;
  onUrlChange: (v: string) => void;
  busy: boolean;
  onFile: (f: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
      <label className="block text-sm font-bold text-gray-600 tracking-wide uppercase text-center">
        {label}
      </label>

      {/* preview */}
      {url ? (
        <div className="flex justify-center py-1">
          <Image
            src={url}
            alt={label}
            width={80}
            height={80}
            className="h-20 w-20 object-contain rounded-lg border-2 border-gray-200 bg-white p-1 shadow-sm"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex justify-center py-1">
          <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
            <span className="text-2xl text-gray-300">🛡️</span>
          </div>
        </div>
      )}

      {/* drop zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        {busy ? (
          <span className="text-sm text-blue-600 font-medium animate-pulse">Subiendo…</span>
        ) : (
          <div>
            <span className="text-lg">📤</span>
            <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-500 transition-colors">
              Arrastra o haz clic
            </p>
          </div>
        )}
      </div>

      {/* url manual */}
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="O pega una URL"
        className="w-full border-2 border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
      />
    </div>
  );
}

/* ---- Botones de acción ---- */

function EventActions({
  saving,
  isActive,
  onSave,
  onActivate,
  onDelete,
  closed,
  onToggleClosed,
}: {
  saving: boolean;
  isActive: boolean;
  onSave: () => void;
  onActivate: () => void;
  onDelete: () => void;
  closed: boolean;
  onToggleClosed: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Toggle cerrar acreditación */}
      <label className="flex items-center gap-3 cursor-pointer bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition-colors">
        <input
          type="checkbox"
          checked={closed}
          onChange={(e) => onToggleClosed(e.target.checked)}
          className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-base font-semibold text-red-700">🔒 Cerrar acreditación</span>
      </label>

      {/* Botones principales */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>💾 Guardar</>
          )}
        </button>
        <button
          onClick={onActivate}
          disabled={saving || isActive}
          className={`text-white text-base font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 ${
            isActive
              ? "bg-gradient-to-b from-emerald-400 to-emerald-500 cursor-default"
              : "bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
          }`}
          title={isActive ? "Ya es el evento activo" : "Marcar como evento activo"}
        >
          {isActive ? "✅ Activo" : "⚡ Activar"}
        </button>
      </div>

      {/* Botón eliminar separado */}
      <button
        onClick={onDelete}
        disabled={saving}
        className="w-full bg-white border-2 border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-base font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
      >
        🗑️ Eliminar evento
      </button>
    </div>
  );
}

/* ================================================================== */
/*  Componente principal                                               */
/* ================================================================== */

export default function AdminSidebar({ eventoId, onEventoChange }: AdminSidebarProps) {
  const crud = useEventosCrud();

  /* ---- crest upload ---- */
  const handleCrestSuccess = useCallback(
    (field: "localCrestUrl" | "opponentCrestUrl", url: string) => {
      crud.updateField(field, url);
    },
    [crud]
  );

  const crest = useCrestUpload(crud.selectedId, handleCrestSuccess);

  /* ---- confirmación de eliminación ---- */
  const [deleteModal, setDeleteModal] = useState(false);

  /* ---- handlers que conectan con el padre ---- */

  const handleSave = async () => {
    const ok = await crud.save();
    if (ok && crud.selectedId !== null) {
      // Solo notifica al padre si este evento ya era el activo
      // para que refresque datos
      if (crud.isActiveEvent) {
        onEventoChange(crud.selectedId);
      }
    }
  };

  const handleActivate = async () => {
    const ok = await crud.activate();
    if (ok && crud.selectedId !== null) {
      onEventoChange(crud.selectedId);
    }
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    const nextId = await crud.remove();
    setDeleteModal(false);
    // Si se eliminó el evento activo del padre, cambiar al siguiente
    if (nextId !== null && eventoId === crud.selectedId) {
      onEventoChange(nextId);
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* ---- Header con gradiente ---- */}
      <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-6 py-5">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          ⚙️ Gestión de Eventos
        </h2>
        <p className="text-blue-200 text-sm mt-0.5">
          {crud.eventos.length} evento{crud.eventos.length !== 1 ? "s" : ""} registrado{crud.eventos.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-6 space-y-5">

      {/* ---- Mensajes de feedback ---- */}
      {crud.error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-base font-medium px-4 py-3 rounded-r-lg flex items-start gap-2">
          <span className="text-lg">❌</span>
          <span>{crud.error}</span>
        </div>
      )}
      {crud.success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 text-base font-medium px-4 py-3 rounded-r-lg flex items-start gap-2 animate-[fadeIn_0.3s_ease-in]">
          <span className="text-lg">✅</span>
          <span>{crud.success}</span>
        </div>
      )}
      {crest.error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-base font-medium px-4 py-3 rounded-r-lg flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="text-lg">⚠️</span>{crest.error}</span>
          <button onClick={crest.clearError} className="text-amber-500 hover:text-amber-700 font-bold text-lg leading-none">✕</button>
        </div>
      )}

      {/* ---- Selector ---- */}
      <EventSelector
        eventos={crud.eventos}
        selectedId={crud.selectedId}
        loading={crud.loadingList}
        onSelect={crud.select}
        onCreate={crud.create}
        creating={crud.saving}
      />

      {/* ---- Ficha del evento (solo si hay selección) ---- */}
      {crud.selectedId !== null ? (
        crud.loadingDetail ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-base mt-3">Cargando evento…</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Divider: Datos */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos del evento</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Formulario */}
            <EventForm detail={crud.detail} onChange={crud.updateField} />

            {/* Divider: Escudos */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escudos</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Escudos */}
            <div className="grid grid-cols-2 gap-4">
              <CrestUploader
                label="🏠 Escudo Local"
                url={crud.detail.localCrestUrl}
                onUrlChange={(v) => crud.updateField("localCrestUrl", v)}
                busy={crest.localBusy}
                onFile={(f) => crest.upload(f, "local")}
              />
              <CrestUploader
                label="🏟️ Escudo Rival"
                url={crud.detail.opponentCrestUrl}
                onUrlChange={(v) => crud.updateField("opponentCrestUrl", v)}
                busy={crest.opponentBusy}
                onFile={(f) => crest.upload(f, "opponent")}
              />
            </div>

            {/* Divider: Acciones */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Acciones */}
            <EventActions
              saving={crud.saving}
              isActive={crud.isActiveEvent}
              onSave={handleSave}
              onActivate={handleActivate}
              onDelete={handleDelete}
              closed={crud.detail.closed}
              onToggleClosed={(v) => crud.updateField("closed", v)}
            />
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <span className="text-5xl">📂</span>
          <p className="text-gray-500 text-base mt-3 font-medium">
            Selecciona o crea un evento
          </p>
          <p className="text-gray-400 text-sm mt-1">
            para ver y editar su ficha
          </p>
        </div>
      )}

      </div>{/* cierre del padding container */}

      {/* ---- Modal de confirmación de eliminación ---- */}
      <ConfirmationModal
        isOpen={deleteModal}
        title="Eliminar evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(false)}
        isLoading={crud.saving}
      />
    </div>
  );
}
