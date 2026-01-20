// app/page.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function LandingPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/acreditacion");
  };

  return (
    <div className="relative min-h-screen">
      {isNavigating && <LoadingSpinner message="Cargando..." />}

      <IconoFlotanteAdmin />
      <BotonFlotante />

      {/* Hero Section con Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: "url('/UCimg/UCtoroz.jpg')",
                backgroundPosition: 'center',
                backgroundSize: 'cover'
            }}
        ></div>
        
        {/* Overlay oscuro */}
        <div className="absolute inset-0 hero-overlay"></div>

        {/* Content - Layout con centro libre */}
        <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-between py-8">
            
            {/* Top Section - Solo título pequeño arriba a la izquierda */}
            <div className="text-left text-white pt-4 pl-4 md:pl-8">
                {/* Badge Superior */}
                <div className="inline-block mb-3 px-4 py-1.5 glassmorphism rounded-full text-xs font-semibold uppercase tracking-widest">
                    <i className="fas fa-futbol mr-2" style={{color: 'var(--azul-claro)'}}></i>
                    Partido Oficial
                </div>

                {/* Título compacto */}
                <h1 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">
                    <span className="block text-white drop-shadow-2xl">Universidad Católica</span>
                </h1>

                {/* VS y rival en una línea */}
                <div className="flex items-center gap-3">
                    <span className="text-lg md:text-xl font-light tracking-wide" style={{color: 'var(--azul-claro)'}}>vs</span>
                    <h2 className="text-lg md:text-2xl font-medium text-white opacity-90">
                        Deportes Concepción
                    </h2>
                </div>
            </div>

            {/* Centro completamente vacío - aquí está la cara del jugador */}

            {/* Bottom Section - Todo el evento abajo */}
            <div className="text-white pb-6">
                
                {/* CTA Principal - Más elegante */}
                <div className="text-center mb-6">
                    <Link
                        href="/acreditacion"
                        prefetch={true}
                        onClick={handleNavigate}
                        className="group relative inline-flex items-center gap-2 px-8 py-3 text-white text-sm md:text-base font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 btn-glow overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                            border: `1px solid var(--azul-mas-claro)`
                        }}>
                        <span className="absolute inset-0 w-full h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                            style={{background: `linear-gradient(135deg, var(--azul-medio) 0%, var(--azul-mas-claro) 100%)`}}>
                        </span>
                        <i className="fas fa-ticket-alt relative z-10 text-xl group-hover:translate-x-1 transition-transform duration-300"></i>
                        <span className="relative z-10 text-xl">Acreditarse Ahora</span>
                        <i className="fas fa-arrow-right relative z-10 text-xl group-hover:translate-x-2 transition-transform duration-300"></i>
                    </Link>
                </div>

                {/* Información en línea horizontal - minimalista */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm">
                    {/* Fecha */}
                    <div className="flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-sm" style={{color: 'var(--azul-claro)'}}></i>
                        <span className="font-light">Sábado 25 Enero</span>
                    </div>

                    {/* Separador */}
                    <div className="hidden md:block w-1 h-1 rounded-full bg-white opacity-50"></div>

                    {/* Hora */}
                    <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-sm" style={{color: 'var(--azul-claro)'}}></i>
                        <span className="font-light">18:00 hrs</span>
                    </div>

                    {/* Separador */}
                    <div className="hidden md:block w-1 h-1 rounded-full bg-white opacity-50"></div>

                    {/* Estadio */}
                    <div className="flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-sm" style={{color: 'var(--azul-claro)'}}></i>
                        <span className="font-light">San Carlos de Apoquindo</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="relative text-white py-6"
          style={{background: 'linear-gradient(180deg, rgba(30, 87, 153, 0.95) 0%, var(--azul-oscuro) 100%)'}}>
          <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Logo o Nombre */}
                  <div className="flex items-center gap-3">
                      <i className="fas fa-shield-alt text-xl" style={{color: 'var(--azul-claro)'}}></i>
                      <span className="text-base font-semibold">Club Deportivo Universidad Católica</span>
                  </div>

                  {/* Copyright dinámico */}
                  <div className="text-center md:text-right">
                      <span className="text-xs text-white opacity-80">
                          © {new Date().getFullYear()} Desarrolado por Accredia para Universidad Católica. © Todos los derechos reservados.
                      </span>
                  </div>
              </div>

              {/* Separador */}
              <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center">
                  <div className="flex justify-center gap-5 text-white">
                      <a href="#" className="transition-all duration-300 hover:scale-110" 
                          style={{color: 'var(--azul-claro)'}}>
                          <i className="fab fa-facebook text-lg"></i>
                      </a>
                      <a href="#" className="transition-all duration-300 hover:scale-110"
                          style={{color: 'var(--azul-claro)'}}>
                          <i className="fab fa-twitter text-lg"></i>
                      </a>
                      <a href="#" className="transition-all duration-300 hover:scale-110"
                          style={{color: 'var(--azul-claro)'}}>
                          <i className="fab fa-instagram text-lg"></i>
                      </a>
                      <a href="#" className="transition-all duration-300 hover:scale-110"
                          style={{color: 'var(--azul-claro)'}}>
                          <i className="fab fa-youtube text-lg"></i>
                      </a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
}

