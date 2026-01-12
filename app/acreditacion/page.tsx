"use client";
import { useState } from "react";
import AreaSelector, { TipoArea } from "@/components/acreditacion/AreaSelector";
import AccreditationForm, { DatosBasicos } from "@/components/acreditacion/AccreditationForm";
import AcreditacionMasiva from "@/components/acreditacion/AcreditacionMasiva";
import Image from "next/image";
import Link from "next/link";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import { useRouter } from "next/navigation";

export default function AcreditacionPage() {
  const [area, setArea] = useState<TipoArea | null>(null);
  const [enviado, setEnviado] = useState<null | { nombre: string; apellido: string }>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/");
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#1e5799] to-[#7db9e8] relative">
      {isNavigating && (
        <div className="fixed inset-0 bg-[#1e5799]/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-semibold">Cargando...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#FFFFFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
      </div>

      <IconoFlotanteAdmin />
      <BotonFlotante />

      <div className="relative z-10 w-full flex flex-col items-center px-4 py-8">
        <Link
          href="/"
          onClick={handleBack}
          className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-medium transition-all px-4 py-2 rounded-full border border-white/30 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Volver</span>
        </Link>

        <div className="w-full max-w-2xl">
          <header className="mb-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-xs mb-4 min-h-[60px] flex items-center justify-center">
              <Image
                src="/UCimg/LogoUC.png"
                alt="Logo del evento"
                width={150}
                height={75}
                priority
                className="w-full h-auto object-contain drop-shadow-2xl opacity-0 animate-fade-in"
                style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg opacity-0 animate-fade-in-delay-1">
              Sistema de acreditación
            </h1>
            <p className="text-white/80 mt-2 opacity-0 animate-fade-in-delay-2">
              Universidad Católica vs Deportes Concepción - Claro Arena
            </p>
          </header>

          <div className="mb-8 flex items-center justify-center gap-3 text-sm">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              !area 
                ? "bg-white text-[#1e5799] shadow-xl font-semibold" 
                : "bg-white/20 text-white/70 border border-white/30 backdrop-blur-sm"
            }`}>
              <span className="font-semibold">1</span>
              <span>Selecciona área</span>
            </div>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              area 
                ? "bg-white text-[#1e5799] shadow-xl font-semibold" 
                : "bg-white/20 text-white/70 border border-white/30 backdrop-blur-sm"
            }`}>
              <span className="font-semibold">2</span>
              <span>Completa datos</span>
            </div>
          </div>

          {!area && (
            <>
              <AreaSelector onSelect={(a) => setArea(a)} />
              <div className="mt-8">
                <AcreditacionMasiva />
              </div>
            </>
          )}

          {area && !enviado && (
            <AccreditationForm
              area={area}
              onCancel={() => setArea(null)}
              onSuccess={(datos) => setEnviado({ nombre: datos.nombre, apellido: datos.apellido })}
            />
          )}

          {enviado && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-8 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#2989d8] to-[#7db9e8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Solicitud enviada!</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Gracias <span className="font-semibold text-[#1e5799]">{enviado.nombre} {enviado.apellido}</span>.
                  <br />
                  Hemos recibido tu solicitud de acreditación.
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white font-semibold rounded-xl hover:from-[#207cca] hover:to-[#7db9e8] transition-all duration-300 hover:scale-105 shadow-lg" 
                  onClick={() => { setEnviado(null); setArea(null); }}
                >
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="py-6 text-center mt-8">
          <p className="text-sm text-white/60">
            Sistema de acreditación oficial • Registro rápido y seguro
          </p>
          <br />
          <p className="text-white/40 text-xs">
            Desarrollado por VS para Universidad Católica • © 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
