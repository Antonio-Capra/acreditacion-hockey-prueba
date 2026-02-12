"use client";

import { useState, useEffect, useCallback } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface EmailTemplate {
  id?: number;
  evento_id: number;
  tipo: "approval" | "rejection";
  zona_key: "cancha" | "default";
  subject: string | null;
  partido_descripcion: string | null;
  partido_fecha: string | null;
  sede: string | null;
  apertura_puertas: string | null;
  cierre_ingreso_prensa: string | null;
  contacto_email: string | null;
  reply_to: string | null;
  instrucciones_acceso_override: string | null;
  info_general_override: string | null;
  intro_text_override: string | null;
}

interface AdminMailTabProps {
  eventoId: number | null;
}

/* ================================================================== */
/*  Defaults                                                           */
/* ================================================================== */

const DEFAULTS = {
  approval: {
    subject: "✅ Tu acreditación ha sido aprobada",
    sede: "Claro Arena",
    apertura_puertas: "18:30 hrs.",
    cierre_ingreso_prensa: "20:15 hrs.",
    contacto_email: "palarcon@cruzados.cl",
    reply_to: "palarcon@cruzados.cl",
  },
  rejection: {
    subject: "❌ Tu acreditación ha sido rechazada",
    sede: "Claro Arena",
    contacto_email: "palarcon@cruzados.cl",
    reply_to: "palarcon@cruzados.cl",
  },
};

/* ================================================================== */
/*  Shared fields (same for cancha & default)                          */
/* ================================================================== */

const SHARED_FIELDS: (keyof EmailTemplate)[] = [
  "subject",
  "partido_descripcion",
  "partido_fecha",
  "sede",
  "apertura_puertas",
  "cierre_ingreso_prensa",
  "contacto_email",
  "reply_to",
  "intro_text_override",
  "info_general_override",
];

/* ================================================================== */
/*  Helper                                                             */
/* ================================================================== */

function emptyTemplate(
  eventoId: number,
  tipo: "approval" | "rejection",
  zonaKey: "cancha" | "default"
): EmailTemplate {
  const defaults = tipo === "approval" ? DEFAULTS.approval : DEFAULTS.rejection;
  return {
    evento_id: eventoId,
    tipo,
    zona_key: zonaKey,
    subject: defaults.subject,
    partido_descripcion: null,
    partido_fecha: null,
    sede: defaults.sede,
    apertura_puertas: tipo === "approval" ? DEFAULTS.approval.apertura_puertas : null,
    cierre_ingreso_prensa: tipo === "approval" ? DEFAULTS.approval.cierre_ingreso_prensa : null,
    contacto_email: defaults.contacto_email,
    reply_to: defaults.reply_to,
    instrucciones_acceso_override: null,
    info_general_override: null,
    intro_text_override: null,
  };
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function AdminMailTab({ eventoId }: AdminMailTabProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [selectedTipo, setSelectedTipo] = useState<"approval" | "rejection">("approval");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedZona, setAdvancedZona] = useState<"cancha" | "default">("default");

  // Shared fields (one set for both zones)
  const [shared, setShared] = useState<EmailTemplate | null>(null);
  // Per-zone instrucciones
  const [instrDefault, setInstrDefault] = useState<string | null>(null);
  const [instrCancha, setInstrCancha] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Fetch                                                            */
  /* ---------------------------------------------------------------- */

  const fetchTemplates = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-templates?evento_id=${eventoId}`);
      if (!res.ok) { setTemplates([]); return; }
      const text = await res.text();
      if (!text) { setTemplates([]); return; }
      const data = JSON.parse(text);
      setTemplates(data.templates || []);
    } catch {
      console.error("Error fetching templates");
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  /* ---------------------------------------------------------------- */
  /*  Sync state from fetched templates                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!eventoId) return;

    const tplDefault = templates.find(
      (t) => t.tipo === selectedTipo && t.zona_key === "default"
    );
    const tplCancha = templates.find(
      (t) => t.tipo === selectedTipo && t.zona_key === "cancha"
    );

    // Use default template as source for shared fields, fallback to cancha, fallback to empty
    const source = tplDefault || tplCancha || emptyTemplate(eventoId, selectedTipo, "default");
    setShared(source);

    setInstrDefault(tplDefault?.instrucciones_acceso_override || null);
    setInstrCancha(tplCancha?.instrucciones_acceso_override || null);

    setHasChanges(false);
    setShowAdvanced(false);
  }, [templates, selectedTipo, eventoId]);

  /* ---------------------------------------------------------------- */
  /*  Update helpers                                                   */
  /* ---------------------------------------------------------------- */

  const updateShared = (field: keyof EmailTemplate, value: string | null) => {
    if (!shared) return;
    setShared({ ...shared, [field]: value || null });
    setHasChanges(true);
  };

  /* ---------------------------------------------------------------- */
  /*  Save → writes to BOTH zona records with shared fields            */
  /* ---------------------------------------------------------------- */

  const handleSave = async () => {
    if (!shared || !eventoId) return;
    setSaving(true);
    setMessage(null);

    try {
      // Build base payload with shared fields
      const base: Record<string, unknown> = { evento_id: eventoId, tipo: selectedTipo };
      for (const key of SHARED_FIELDS) {
        base[key] = shared[key] ?? null;
      }

      if (selectedTipo === "approval") {
        // Save default template
        const defaultPayload = {
          ...base,
          zona_key: "default",
          instrucciones_acceso_override: instrDefault || null,
        };

        // Save cancha template
        const canchaPayload = {
          ...base,
          zona_key: "cancha",
          instrucciones_acceso_override: instrCancha || null,
        };

        const [r1, r2] = await Promise.all([
          fetch("/api/admin/email-templates", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultPayload),
          }),
          fetch("/api/admin/email-templates", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(canchaPayload),
          }),
        ]);

        if (!r1.ok || !r2.ok) throw new Error("Error al guardar uno de los templates");
      } else {
        // Rejection: solo una variante (default)
        const payload = {
          ...base,
          zona_key: "default",
          instrucciones_acceso_override: null,
        };

        const res = await fetch("/api/admin/email-templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al guardar template");
      }

      setMessage({ type: "success", text: "Template guardado correctamente" });
      setHasChanges(false);
      await fetchTemplates();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (!eventoId) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500 text-lg">
        Selecciona un evento para administrar los templates de email.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e5799] mx-auto" />
        <p className="mt-4 text-gray-500 text-lg">Cargando templates...</p>
      </div>
    );
  }

  const isApproval = selectedTipo === "approval";
  const hasSaved = !!templates.find((t) => t.tipo === selectedTipo);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-[#1e5799] mb-2">📧 Gestión de Emails</h2>
        <p className="text-base text-gray-500">
          Personaliza el contenido de los emails de aprobación y rechazo para este evento.
          Los datos se aplican automáticamente a todas las zonas.
        </p>
      </div>

      {/* Tipo selector */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setSelectedTipo("approval")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold transition ${
              selectedTipo === "approval"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-100"
            }`}
          >
            ✅ Email de Aprobación
          </button>
          <button
            type="button"
            onClick={() => setSelectedTipo("rejection")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold transition ${
              selectedTipo === "rejection"
                ? "bg-red-600 text-white shadow-lg scale-105"
                : "bg-red-50 text-red-700 border-2 border-red-300 hover:bg-red-100"
            }`}
          >
            ❌ Email de Rechazo
          </button>

          {hasSaved && (
            <span className="ml-auto flex items-center text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full font-semibold">
              ✓ Configurado
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      {shared && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          {/* Variables clave */}
          <div className="p-8 space-y-7">
            <h3 className="text-xl font-bold text-gray-800">
              🔑 Datos del Evento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject */}
              <div className="col-span-full">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Asunto del email
                </label>
                <input
                  type="text"
                  value={shared.subject || ""}
                  onChange={(e) => updateShared("subject", e.target.value)}
                  placeholder={isApproval ? DEFAULTS.approval.subject : DEFAULTS.rejection.subject}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                />
              </div>

              {/* Partido descripción */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Descripción del Partido
                </label>
                <input
                  type="text"
                  value={shared.partido_descripcion || ""}
                  onChange={(e) => updateShared("partido_descripcion", e.target.value)}
                  placeholder="Ej: Universidad Católica vs. Deportes Concepción"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                />
              </div>

              {/* Partido fecha */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Fecha / Hora del Partido
                </label>
                <input
                  type="text"
                  value={shared.partido_fecha || ""}
                  onChange={(e) => updateShared("partido_fecha", e.target.value)}
                  placeholder="Ej: domingo 8 de febrero a las 20:30 horas"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                />
              </div>

              {/* Sede */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Sede / Estadio
                </label>
                <input
                  type="text"
                  value={shared.sede || ""}
                  onChange={(e) => updateShared("sede", e.target.value)}
                  placeholder="Claro Arena"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                />
              </div>

              {/* Reply to */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Email de contacto (reply-to)
                </label>
                <input
                  type="email"
                  value={shared.reply_to || ""}
                  onChange={(e) => updateShared("reply_to", e.target.value)}
                  placeholder="palarcon@cruzados.cl"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                />
              </div>

              {/* Solo para approval */}
              {isApproval && (
                <>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Apertura de puertas
                    </label>
                    <input
                      type="text"
                      value={shared.apertura_puertas || ""}
                      onChange={(e) => updateShared("apertura_puertas", e.target.value)}
                      placeholder="18:30 hrs."
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Cierre ingreso prensa
                    </label>
                    <input
                      type="text"
                      value={shared.cierre_ingreso_prensa || ""}
                      onChange={(e) => updateShared("cierre_ingreso_prensa", e.target.value)}
                      placeholder="20:15 hrs."
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Email de consulta (en el cuerpo del email)
                    </label>
                    <input
                      type="email"
                      value={shared.contacto_email || ""}
                      onChange={(e) => updateShared("contacto_email", e.target.value)}
                      placeholder="palarcon@cruzados.cl"
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Divider + advanced toggle */}
          <div className="border-t-2 border-gray-100 px-8 py-5 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-3 text-base font-semibold text-gray-600 hover:text-[#1e5799] transition"
            >
              <span className={`transform transition-transform text-lg ${showAdvanced ? "rotate-90" : ""}`}>
                ▶
              </span>
              Edición avanzada (personalizar bloques de texto completos)
            </button>
          </div>

          {/* Advanced: override textareas */}
          {showAdvanced && (
            <div className="px-8 pb-8 pt-4 space-y-7 bg-gray-50/30">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-base text-amber-800">
                <strong>Nota:</strong> Si dejas estos campos vacíos, se usará el texto por defecto del sistema.
                Al escribir contenido aquí, reemplazará completamente la sección correspondiente en el email.
              </div>

              {/* Intro text override */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Texto introductorio personalizado
                </label>
                <p className="text-sm text-gray-400 mb-3">
                  {isApproval
                    ? "Reemplaza el texto 'Su solicitud de acreditación para el partido...'"
                    : "Reemplaza el texto 'Debido a la capacidad limitada de espacios...'"}
                </p>
                <textarea
                  value={shared.intro_text_override || ""}
                  onChange={(e) => updateShared("intro_text_override", e.target.value)}
                  placeholder="Dejar vacío para usar el texto generado automáticamente desde las variables"
                  rows={4}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base resize-y"
                />
              </div>

              {isApproval && (
                <>
                  {/* Instrucciones acceso - zona selector */}
                  <div className="border-2 border-blue-200 rounded-2xl overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h4 className="text-base font-bold text-blue-900">
                          Instrucciones de acceso por zona
                        </h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Cada zona puede tener instrucciones de acceso distintas
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAdvancedZona("default")}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${
                            advancedZona === "default"
                              ? "bg-[#1e5799] text-white shadow"
                              : "bg-white text-[#1e5799] border-2 border-[#1e5799]/30 hover:bg-blue-50"
                          }`}
                        >
                          General
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvancedZona("cancha")}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${
                            advancedZona === "cancha"
                              ? "bg-[#1e5799] text-white shadow"
                              : "bg-white text-[#1e5799] border-2 border-[#1e5799]/30 hover:bg-blue-50"
                          }`}
                        >
                          Cancha
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <label className="block text-base font-semibold text-gray-700 mb-2">
                        Instrucciones de acceso — {advancedZona === "cancha" ? "Cancha (Reporteros Gráficos)" : "General (Prensa)"}
                      </label>
                      <textarea
                        value={advancedZona === "cancha" ? instrCancha || "" : instrDefault || ""}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          if (advancedZona === "cancha") {
                            setInstrCancha(val);
                          } else {
                            setInstrDefault(val);
                          }
                          setHasChanges(true);
                        }}
                        placeholder="Dejar vacío para usar las instrucciones por defecto del sistema"
                        rows={6}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base resize-y"
                      />
                    </div>
                  </div>

                  {/* Info general override */}
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Información general
                    </label>
                    <p className="text-sm text-gray-400 mb-3">
                      Reemplaza toda la sección de información general (requisitos, normas, estacionamientos).
                    </p>
                    <textarea
                      value={shared.info_general_override || ""}
                      onChange={(e) => updateShared("info_general_override", e.target.value)}
                      placeholder="Dejar vacío para usar la información general por defecto"
                      rows={8}
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition text-base resize-y"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer con acciones */}
          <div className="border-t-2 border-gray-200 px-8 py-5 bg-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {message && (
                <span
                  className={`text-base font-semibold px-4 py-2 rounded-full ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-300"
                      : "bg-red-50 text-red-700 border border-red-300"
                  }`}
                >
                  {message.text}
                </span>
              )}
              {hasChanges && !message && (
                <span className="text-base text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-full border border-amber-300">
                  ⚠ Hay cambios sin guardar
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-8 py-3 bg-[#1e5799] hover:bg-[#174a85] text-white rounded-xl font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Guardando...
                </span>
              ) : (
                "💾 Guardar Template"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview section */}
      {shared && (shared.partido_descripcion || shared.partido_fecha) && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">👁️ Vista previa del texto introductorio</h3>
          <div className={`border-l-4 ${isApproval ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"} p-6 rounded-r-xl`}>
            {shared.intro_text_override ? (
              <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{shared.intro_text_override}</p>
            ) : (
              <p className="text-base text-gray-700 leading-relaxed">
                {isApproval ? (
                  <strong>
                    Su solicitud de acreditación para el partido{" "}
                    {shared.partido_descripcion || "[Partido]"} a disputarse el{" "}
                    {shared.partido_fecha || "[fecha]"} en el{" "}
                    {shared.sede || "Claro Arena"}, ha sido aceptada.
                  </strong>
                ) : (
                  <>
                    Debido a la capacidad limitada de espacios disponibles en prensa para el partido{" "}
                    <strong>{shared.partido_descripcion || "[Partido]"}</strong> a disputarse el{" "}
                    <strong>{shared.partido_fecha || "[fecha]"}</strong> en el{" "}
                    <strong>{shared.sede || "Claro Arena"}</strong>, lamentamos informarle que su(s) acreditación(es)
                    ha(n) sido rechazada(s).
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
