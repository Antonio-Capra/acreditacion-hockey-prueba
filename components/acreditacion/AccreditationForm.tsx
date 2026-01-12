// components/acreditacion/AccreditationForm.tsx
"use client";

import { useState } from "react";
import type { TipoArea } from "@/types";
import { supabase } from "@/lib/supabase";

export type DatosBasicos = {
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  empresa: string;
};

export default function AccreditationForm({
  area,
  onCancel,
  onSuccess,
}: {
  area: TipoArea;
  onCancel: () => void;
  onSuccess: (datos: DatosBasicos) => void;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosBasicos>({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    empresa: "",
  });
  const [aceptaTyC, setAceptaTyC] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones mínimas (sin validar RUT/Documento)
    if (!datos.nombre.trim() || !datos.apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    if (!aceptaTyC) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setCargando(true);
    try {
      const { error: sbError } = await supabase.from("acreditaciones").insert({
        area,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        rut: datos.rut.trim(),
        correo: datos.correo.trim().toLowerCase(),
        empresa: datos.empresa.trim(),
      });

      if (sbError) {
        console.error("Supabase insert error:", sbError);
        setError(sbError.message);
        return;
      }

      onSuccess(datos);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido.";
      console.error("Catch error:", err);
      setError(msg);
    } finally {
      setCargando(false);
    }
  }


  return (
    <section className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Datos para: {area}</h2>
        <button className="text-sm text-[#a10d79] hover:text-[#7518ef] font-medium underline" onClick={onCancel}>
          Cambiar área
        </button>
      </div>

      <form onSubmit={manejarSubmit} className="grid grid-cols-1 gap-4">
        {/* Nombre / Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nombre</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#a10d79] focus:ring-2 focus:ring-[#a10d79]/20 transition-all"
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Apellido</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#a10d79] focus:ring-2 focus:ring-[#a10d79]/20 transition-all"
              value={datos.apellido}
              onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Documento / Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">RUT / Documento</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#a10d79] focus:ring-2 focus:ring-[#a10d79]/20 transition-all"
              placeholder="RUT, DNI o Pasaporte"
              value={datos.rut}
              onChange={(e) => setDatos({ ...datos, rut: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Correo</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#a10d79] focus:ring-2 focus:ring-[#a10d79]/20 transition-all"
              value={datos.correo}
              onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
            />
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Empresa</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#a10d79] focus:ring-2 focus:ring-[#a10d79]/20 transition-all"
            value={datos.empresa}
            onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
          />
        </div>
        {/* Términos y condiciones */}
        <div className="flex items-start gap-2">
          <input
            id="acepta-tyc"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#a10d79] focus:ring-[#a10d79]"
            checked={aceptaTyC}
            onChange={(e) => setAceptaTyC(e.target.checked)}
          />
          <label htmlFor="acepta-tyc" className="text-sm text-gray-700">
            Acepto los{" "}
            <a
              href="/docs/TerminosFEOCH.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a10d79] hover:text-[#7518ef] underline font-medium"
            >
              términos y condiciones
            </a>.
          </label>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={cargando || !aceptaTyC}
            className="rounded-xl bg-gradient-to-r from-[#e8b543] via-[#d7834f] to-[#b5301f] hover:from-[#d7834f] hover:via-[#b5301f] hover:to-[#b5301f] text-white font-semibold px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enviar solicitud
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={cargando}
            className="rounded-xl bg-white border-2 border-[#a10d79]/30 text-[#a10d79] hover:bg-[#a10d79]/5 font-medium px-6 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Volver
          </button>
        </div>
      </form>
    </section>
  );
}
