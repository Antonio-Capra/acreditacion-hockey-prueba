// app/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BotonFlotante from "@/components/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/BotonesFlotantes/IconoFlotanteAdmin";

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
    <div className="bg-gradient-to-br from-[#a10d79] via-[#3d2362] to-[#7518ef]">
      {/* Overlay de loading */}
      {isNavigating && (
        <div className="fixed inset-0 bg-[#3d2362]/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-semibold">Cargando...</p>
          </div>
        </div>
      )}

      <IconoFlotanteAdmin />
      <BotonFlotante />

      {/* Primera sección: Logo grande */}
      <section className="min-h-screen w-full flex flex-col items-center justify-between px-4 py-12 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#e8b543] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7518ef] rounded-full blur-3xl"></div>
        </div>

        {/* Espaciador superior */}
        <div></div>

        {/* Logo centrado */}
        <div className="w-full max-w-4xl text-center relative z-10">
          <div className="opacity-0 animate-fade-in">
            <Image
              src="/img/DesafioInter.png"
              alt="Logo Desafío Internacional"
              width={800}
              height={300}
              priority
              className="w-full max-w-3xl mx-auto h-auto object-contain drop-shadow-2xl"
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
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7518ef]/5 to-[#e8b543]/10"></div>
        
        <div className={`w-full max-w-6xl text-center relative z-10 transition-all duration-1000 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          {/* Título */}
          <h2 className="text-sm sm:text-base font-medium text-purple-200 mb-12 uppercase tracking-wider">
            Enfrentamiento
          </h2>

          {/* Escudos y VS */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 md:gap-20 mb-12">
            {/* Universidad de Chile */}
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-4 sm:p-6 mb-4 shadow-2xl">
                <Image
                  src="/img/Udechile.png"
                  alt="Escudo Universidad de Chile"
                  width={250}
                  height={250}
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">Universidad de Chile</p>
            </div>

            {/* VS */}
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              VS
            </div>

            {/* Racing de Avellaneda */}
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-4 sm:p-6 mb-4 shadow-2xl">
                <Image
                  src="/img/Racing.png"
                  alt="Escudo Racing de Avellaneda"
                  width={250}
                  height={250}
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white/80">Racing de Avellaneda</p>
            </div>
          </div>

          {/* Botón principal */}
          <div className="mb-12">
            <Link
              href="/acreditacion"
              prefetch={true}
              onClick={handleNavigate}
              className="group inline-flex items-center gap-3 px-16 py-7 bg-gradient-to-r from-[#e8b543] via-[#d7834f] to-[#b5301f] text-white text-xl font-bold rounded-2xl hover:from-[#d7834f] hover:via-[#b5301f] hover:to-[#b5301f] transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-2xl"
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
                  <svg className="w-5 h-5 text-[#e8b543]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">18 de enero 2026</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#d7834f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">Estadio Ester Roa, Concepción</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <p className="text-sm text-white/60">
            Sistema de acreditación oficial • Registro rápido y seguro
          </p> <br />
          <p className="text-white/40 text-xs">
          © 2026 Somos VS. Todos los derechos reservados.
        </p>
        </div>
      </section>
    </div>
  );
}

