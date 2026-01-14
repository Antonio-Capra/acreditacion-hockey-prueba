"use client";
import { useState, useEffect } from "react";
import AreaSelector, { TipoArea } from "@/components/acreditacion/AreaSelector";
import AccreditationForm from "@/components/acreditacion/AccreditationForm";
import AcreditacionMasiva from "@/components/acreditacion/AcreditacionMasiva";
import DisclaimerModal from "@/components/acreditacion/Disclaimer";
import Image from "next/image";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function AcreditacionPage() {
  const [tipoAcreditacion, setTipoAcreditacion] = useState<"hockey" | "prensa" | null>(null);
  const [area, setArea] = useState<TipoArea | null>(null);
  const [enviado, setEnviado] = useState<null | { nombre: string; apellido: string }>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const router = useRouter();

  // Redirect automático a prensa cuando se selecciona
  useEffect(() => {
    if (tipoAcreditacion === "prensa") {
      const timer = setTimeout(() => {
        router.push("/acreditacion/prensa");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tipoAcreditacion, router]);

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (tipoAcreditacion === "hockey" && area) {
      // Si estamos en formulario de hockey, volver al selector de tipos
      setArea(null);
      setEnviado(null);
    } else if (tipoAcreditacion) {
      // Si estamos en selector de tipos, volver al disclaimer/inicio
      setTipoAcreditacion(null);
    } else {
      // Si no hay nada seleccionado, ir al landing
      setIsNavigating(true);
      router.push("/");
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1e5799] to-[#7db9e8] overflow-x-hidden max-w-full">
      {isNavigating && <LoadingSpinner message="Cargando..." />}
      {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}

      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#FFFFFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/2 transform translate-x-1/2 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
      </div>

      <IconoFlotanteAdmin />
      <BotonFlotante />

      <main className="min-h-screen w-full max-w-full flex flex-col items-center px-4 py-8 relative overflow-hidden box-border">
        <button
          onClick={handleBack}
          className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50 inline-flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-medium transition-all px-3 sm:px-4 py-2 sm:py-2 rounded-full border border-white/30 hover:scale-105 active:scale-95 text-xs sm:text-sm"
        >
          <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Volver</span>
        </button>

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

          {/* Selector Tipo Acreditación */}
          {!tipoAcreditacion ? (
            <div className="space-y-4">
              <p className="text-center text-white font-semibold mb-6">
                ¿Qué tipo de acreditación necesitas?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hockey */}
                <button
                  onClick={() => setTipoAcreditacion("hockey")}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <div className="text-4xl mb-3">🏒</div>
                  <h2 className="text-xl font-bold text-[#1e5799] mb-2">Hockey</h2>
                  <p className="text-gray-600 text-sm">
                    Acreditación para jugadores, cuerpo técnico y personal del evento
                  </p>
                </button>

                {/* Prensa */}
                <button
                  onClick={() => setTipoAcreditacion("prensa")}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <div className="text-4xl mb-3">📰</div>
                  <h2 className="text-xl font-bold text-[#1e5799] mb-2">Prensa</h2>
                  <p className="text-gray-600 text-sm">
                    Acreditación para periodistas, camarógrafos y reporteros
                  </p>
                </button>
              </div>
            </div>
          ) : null}

          {/* Contenido Hockey */}
          {tipoAcreditacion === "hockey" && (
            <>
              <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                <div className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all ${
                  !area 
                    ? "bg-white text-[#1e5799] shadow-xl font-semibold" 
                    : "bg-white/20 text-white/70 border border-white/30 backdrop-blur-sm"
                }`}>
                  <span className="font-semibold">1</span>
                  <span className="hidden sm:inline">Selecciona área</span>
                  <span className="sm:hidden">Área</span>
                </div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all ${
                  area 
                    ? "bg-white text-[#1e5799] shadow-xl font-semibold" 
                    : "bg-white/20 text-white/70 border border-white/30 backdrop-blur-sm"
                }`}>
                  <span className="font-semibold">2</span>
                  <span className="hidden sm:inline">Completa datos</span>
                  <span className="sm:hidden">Datos</span>
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
                  onCancel={() => { setArea(null); setTipoAcreditacion(null); }}
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
                      onClick={() => { setEnviado(null); setArea(null); setTipoAcreditacion(null); }}
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Contenido Prensa */}
          {tipoAcreditacion === "prensa" && (
            <div className="text-center">
              <p className="text-white mb-6 font-semibold">
                Cargando formulario de prensa...
              </p>
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
      </main>

      {/* Disclaimer Modal */}
      <DisclaimerModal 
        onAccept={() => setShowDisclaimer(false)}
        isVisible={showDisclaimer}
      />
    </div>
  );
}
