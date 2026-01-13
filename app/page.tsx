// app/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/acreditacion");
  };

  return (
    <div className="bg-gradient-to-br from-[#1e5799] to-[#7db9e8] overflow-x-hidden max-w-full">
      {isNavigating && <LoadingSpinner message="Cargando..." />}

      <IconoFlotanteAdmin />
      <BotonFlotante />

      {/* Primera sección: Logo grande */}
      <section className="min-h-screen w-full max-w-full flex flex-col items-center justify-between px-4 py-12 relative overflow-hidden box-border">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#7db9e8] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/2 transform translate-x-1/2 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
        </div>

        {/* Espaciador superior */}
        <div></div>

        {/* Logo centrado con título */}
        <div className="w-full max-w-4xl text-center relative z-10">
          <div className="opacity-0 animate-fade-in flex flex-col items-center gap-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              ACREDITACIONES UC
            </h1>
            <Image
              src="/UCimg/EscudoUC.png"
              alt="Escudo Universidad Católica"
              width={180}
              height={180}
              priority
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Indicador de scroll en la parte inferior */}
        <div className="opacity-0 animate-fade-in-delay-3 pb-8">
          <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
            <span className="text-sm">Desliza para continuar</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Segunda sección: Escudos y botón */}
      <section className="min-h-screen w-full max-w-full flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden box-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#207cca]/5 to-[#7db9e8]/10"></div>
        
        <div className={`w-full max-w-6xl text-center relative z-10 transition-all duration-1000 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          {/* Título */}
          <h2 className="text-sm sm:text-base font-medium text-blue-100 mb-12 uppercase tracking-wider">
            ¡PRIMERA FECHA DEL CAMPEONATO EN EL CLARO ARENA!
          </h2>

          {/* Escudos y VS */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 md:gap-20 mb-12">
            {/* Universidad Católica */}
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-6 sm:p-8 mb-4 shadow-2xl">
                <Image
                  src="/UCimg/EscudoUC.png"
                  alt="Escudo Universidad Católica"
                  width={250}
                  height={250}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">Universidad Católica</p>
            </div>

            {/* VS */}
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              VS
            </div>

            {/* Deportes Concepción */}
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-6 sm:p-8 mb-4 shadow-2xl">
                <Image
                  src="/UCimg/EscudoConce.png"
                  alt="Escudo Deportes Concepción"
                  width={150}
                  height={150}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">Deportes Concepción</p>
            </div>
          </div>

          {/* Botón principal */}
          <div className="mb-12">
            <Link
              href="/acreditacion"
              prefetch={true}
              onClick={handleNavigate}
              className="group inline-flex items-center gap-3 px-16 py-7 bg-white hover:bg-gray-50 text-[#1e5799] text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[0_20px_60px_rgba(30,87,153,0.4)] border-2 border-[#207cca]/20 hover:border-[#207cca]/40"
            >
              <span>¡Acreditarse ahora!</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Detalles del evento */}
          <div className="mb-8">
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-6 border border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#7db9e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">8 de febrero 2026</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2989d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">Estadio Claro arena, Santiago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <p className="text-sm text-white/60">
            Sistema de acreditación oficial • Registro rápido y seguro
          </p> <br />
          <p className="text-white/40 text-xs">
            Desarrollado por VS para Universidad Católica • © 2026
          </p>
        </div>
      </section>
    </div>
  );
}

