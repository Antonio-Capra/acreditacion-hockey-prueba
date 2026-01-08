// app/page.tsx
"use client";
import { useState } from "react";
import AreaSelector, { TipoArea } from "@/components/AreaSelector";
import AccreditationForm, { DatosBasicos } from "@/components/AccreditationForm";
import Image from "next/image";


export default function Page() {
const [area, setArea] = useState<TipoArea | null>(null);
const [enviado, setEnviado] = useState<null | { nombre: string; apellido: string }>(null);


return (
<main className="min-h-dvh w-full flex flex-col items-center px-4 py-8">
<div className="w-full max-w-2xl">
  {/* Header con banner y logo */}
{/* Header con banner, logo y título */}
<header className="mb-8 relative flex flex-col items-center text-center">
  <div className="relative w-full">
    {/* Banner */}
    <Image
      src="/img/logo-mundial.png"
      alt="Banner del evento"
      width={1600}
      height={500}
      priority
      className="w-full h-40 sm:h-56 md:h-64 object-contain rounded-2xl"
    />
  </div>

  {/* Título principal debajo del banner */}
  <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
    Acreditaciones Mundial Femenino Junior Santiago 2025
  </h1>
</header>


<div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
<span className={`px-2 py-1 rounded ${!area ? "bg-black text-white" : "bg-gray-200"}`}>1. Selecciona área</span>
<span>→</span>
<span className={`px-2 py-1 rounded ${area ? "bg-black text-white" : "bg-gray-200"}`}>2. Completa tus datos</span>
</div>


{!area && <AreaSelector onSelect={(a) => setArea(a)} />}


{area && !enviado && (
<AccreditationForm
area={area}
onCancel={() => setArea(null)}
onSuccess={(datos) => setEnviado({ nombre: datos.nombre, apellido: datos.apellido })}
/>
)}


{enviado && (
<div className="rounded-2xl border p-6">
<h2 className="text-2xl font-semibold mb-2">¡Solicitud enviada!</h2>
<p className="text-gray-700">
Gracias {enviado.nombre} {enviado.apellido}. Hemos recibido tu solicitud de acreditación.
</p>
<button className="mt-6 rounded-xl border px-4 py-2 hover:bg-gray-50" onClick={() => { setEnviado(null); setArea(null); }}>
Enviar otra respuesta
</button>
</div>
)}
</div>
</main>
);
}


