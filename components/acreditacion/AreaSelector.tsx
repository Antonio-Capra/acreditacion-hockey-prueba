// components/acreditacion/AreaSelector.tsx
import { AREAS } from "@/constants/areas";
import type { TipoArea } from "@/types";

export default function AreaSelector({ onSelect }: { onSelect: (a: TipoArea) => void }) {
  return (
    <section className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-2xl">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900">Selecciona el área</h1>
      <p className="text-gray-700 mb-6">
        Antes de completar tus datos, elige a qué grupo perteneces.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => onSelect(a)}
            className="rounded-xl bg-gradient-to-r from-[#a10d79] to-[#7518ef] text-white px-4 py-3 text-left transition-all duration-200
                       hover:from-[#7518ef] hover:to-[#a10d79] hover:scale-105 hover:shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-[#e8b543]"
          >
            <span className="block text-base font-semibold">{a}</span>
            <span className="block text-sm text-white/80">Continuar →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
