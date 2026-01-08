// components/AccreditationForm.tsx
"use client";

import { useState } from "react";
import type { TipoArea } from "./AreaSelector";
import { supabase } from "@/lib/supabase";

export type DatosBasicos = {
  nombre: string;
  apellido: string;
  rut: string; // Puede ser pasaporte/DNI/RUT; sin validación de DV
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
    console.error("Supabase insert error:", sbError); // <— mira la consola
    setError(sbError.message);                         // <— muestra el mensaje real
    return;
  }

  onSuccess(datos);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : "Error desconocido.";
  console.error("Catch error:", err);
  setError(msg);
}
  if (!aceptaTyC) {
  setError("Debes aceptar los términos y condiciones.");
  return;
}

  }


  return (
    <section className="rounded-2xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Datos para: {area}</h2>
        <button className="text-sm underline" onClick={onCancel}>
          Cambiar área
        </button>
      </div>

      <form onSubmit={manejarSubmit} className="grid grid-cols-1 gap-4">
        {/* Nombre / Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={datos.apellido}
              onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Documento / Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">RUT / Documento</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              placeholder="RUT, DNI o Pasaporte"
              value={datos.rut}
              onChange={(e) => setDatos({ ...datos, rut: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              type="email"
              className="w-full rounded-xl border px-3 py-2"
              value={datos.correo}
              onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
            />
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={datos.empresa}
            onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
          />
        </div>
        {/* Términos y condiciones */}
<div className="flex items-start gap-2">
  <input
    id="acepta-tyc"
    type="checkbox"
    className="mt-1 h-4 w-4 rounded border-gray-300"
    checked={aceptaTyC}
    onChange={(e) => setAceptaTyC(e.target.checked)}
  />
  <label htmlFor="acepta-tyc" className="text-sm text-gray-700">
    Acepto los{" "}
    <a
      href="/docs/TerminosFEOCH.pdf"  // ← si usas URL externa, reemplázala aquí
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      términos y condiciones
    </a>.
  </label>
</div>


        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={cargando || !aceptaTyC}
            className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {cargando ? "Enviando…" : "Enviar solicitud"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2">
            Volver
          </button>
        </div>
      </form>
    </section>
  );
}