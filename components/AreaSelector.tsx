// components/AreaSelector.tsx
export type TipoArea =
  | "Producción"
  | "Voluntarios"
  | "Auspiciadores"
  | "Proveedores"
  | "Fan Fest"
  | "Prensa";

const AREAS: TipoArea[] = [
  "Producción",
  "Voluntarios",
  "Auspiciadores",
  "Proveedores",
  "Fan Fest",
  "Prensa",
];

export default function AreaSelector({ onSelect }: { onSelect: (a: TipoArea) => void }) {
  return (
    <section className="rounded-2xl border p-6">
      <h1 className="text-2xl font-semibold mb-4">Selecciona el área</h1>
      <p className="text-gray-700 mb-6">
        Antes de completar tus datos, elige a qué grupo perteneces.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AREAS.map((a) => (
          <button
  key={a}
  onClick={() => onSelect(a)}
  className="rounded-xl border px-4 py-3 text-left transition-all duration-150
             hover:bg-gray-100 hover:border-gray-400 hover:shadow-md
             focus:outline-none focus:ring-2 focus:ring-gray-300"
>
  <span className="block text-base font-medium">{a}</span>
  <span className="block text-sm text-gray-500">Continuar →</span>
</button>

        ))}
      </div>
    </section>
  );
}