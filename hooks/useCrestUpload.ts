"use client";

import { useCallback, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Tipos & constantes                                                 */
/* ------------------------------------------------------------------ */

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_IMAGE_SIZE_MB = 2;

export interface CrestUploadState {
  localBusy: boolean;
  opponentBusy: boolean;
  error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useCrestUpload(
  eventoId: number | null,
  onSuccess: (field: "localCrestUrl" | "opponentCrestUrl", url: string) => void
) {
  const [state, setState] = useState<CrestUploadState>({
    localBusy: false,
    opponentBusy: false,
    error: null,
  });

  const upload = useCallback(
    async (file: File, side: "local" | "opponent") => {
      if (!eventoId) return;

      /* validar tipo */
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setState((s) => ({
          ...s,
          error: `Formato no soportado. Usa: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
        }));
        return;
      }

      /* validar tamaño */
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setState((s) => ({ ...s, error: `El archivo excede ${MAX_IMAGE_SIZE_MB} MB` }));
        return;
      }

      const busyKey = side === "local" ? "localBusy" : "opponentBusy";
      setState((s) => ({ ...s, [busyKey]: true, error: null }));

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("eventoId", String(eventoId));
        formData.append("side", side);

        const res = await fetch("/api/admin/upload-crest", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Error al subir imagen" }));
          throw new Error(body.error || "Error al subir imagen");
        }

        const { url } = await res.json();
        if (url) {
          const field = side === "local" ? "localCrestUrl" : "opponentCrestUrl";
          onSuccess(field, url);
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Error al subir imagen",
        }));
      } finally {
        setState((s) => ({ ...s, [busyKey]: false }));
      }
    },
    [eventoId, onSuccess]
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return { ...state, upload, clearError };
}
