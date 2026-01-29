// app/page.tsx - Versión Colo-Colo simplificada
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <>
            <style>
                {`
                    :root {
                        --blanco: #ffffff;
                        --gris-claro: #f5f5f5;
                        --gris-medio: #cccccc;
                        --gris-oscuro: #666666;
                        --negro: #000000;
                        --gris-plateado: #c0c0c0;
                    }
                    .hero-overlay {
                        background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%);
                    }
                    .text-primary { color: #ffffff; }
                    .text-secondary { color: #000000; }
                    .bg-primary { background-color: #ffffff; }
                    .bg-secondary { background-color: #000000; }
                    .border-primary { border-color: #c0c0c0; }
                `}
            </style>
            <div className="relative min-h-screen bg-black">
                {isNavigating && <LoadingSpinner message="Cargando..." />}

                <IconoFlotanteAdmin />
                <BotonFlotante />

                {/* Hero Section con Background */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("/colocolo/EstadioColo.png")',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}
                    ></div>

                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 hero-overlay"></div>

                    {/* Content - Layout con centro libre */}
                    <div className="relative z-10 container mx-auto px-4 min-h-screen max-w-screen-xl flex flex-col flex-grow justify-around gap-y-8 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">

                        {/* Top Section - Título con badge e info del evento */}
                        <div className="flex flex-col items-center sm:items-start text-white pt-4 pl-2 sm:pl-4 md:pl-8 w-full">
                            {/* Badge Superior e Info del Evento en mobile: apilado, en desktop: fila */}
                            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-4 md:gap-6 mb-3 sm:mb-6 w-full">
                                {/* Badge Superior */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2 mb-1 sm:mb-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 100%)',
                                        border: '2px solid #666666',
                                        color: '#000000'
                                    }}>
                                    <i className="fas fa-futbol mr-3" style={{ color: '#000000', fontSize: '1.4em' }}></i>
                                    Liga de Primera Mercado Libre
                                </div>

                                {/* Fecha */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2 mb-1 sm:mb-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #000000 0%, #666666 100%)',
                                        border: '2px solid #c0c0c0',
                                        color: '#ffffff'
                                    }}>
                                    <i className="fas fa-calendar-alt mr-3" style={{ color: '#ffffff', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">8 de Febrero 2026</span>
                                </div>

                                {/* Hora */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2 mb-1 sm:mb-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #000000 0%, #666666 100%)',
                                        border: '2px solid #c0c0c0',
                                        color: '#ffffff'
                                    }}>
                                    <i className="fas fa-clock mr-3" style={{ color: '#ffffff', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">20:30 hrs</span>
                                </div>

                                {/* Estadio */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #000000 0%, #666666 100%)',
                                        border: '2px solid #c0c0c0',
                                        color: '#ffffff'
                                    }}>
                                    <i className="fas fa-map-marker-alt mr-3" style={{ color: '#ffffff', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">Estadio Monumental</span>
                                </div>
                            </div>

                            {/* Título compacto */}
                            <h1 className="text-center sm:text-left text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 leading-tight w-full">
                                <span className="block text-white drop-shadow-2xl">COLO-COLO</span>
                            </h1>

                            {/* VS y rival en una línea */}
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 w-full justify-center sm:justify-start">
                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light tracking-wide" style={{ color: '#c0c0c0' }}>vs</span>
                                <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white opacity-90">
                                    Universidad Católica
                                </h2>
                            </div>
                        </div>

                        {/* Centro completamente vacío - aquí está la cara del jugador */}

                        {/* Bottom Section - Todo el evento abajo */}
                        <div className="text-white pb-6 flex flex-col items-center w-full">

                            {/* Shields Section */}
                            <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-12 lg:gap-16 xl:gap-20 mb-4 sm:mb-8 w-full">
                                {/* Equipo Principal */}
                                <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                                    <Image
                                        src="/colocolo/EscudoColo.png"
                                        alt="Escudo Colo-Colo"
                                        width={300}
                                        height={300}
                                        className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain max-w-xs min-w-[64px] min-h-[64px]"
                                    />
                                </div>

                                {/* VS */}
                                <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg">
                                    VS
                                </div>

                                {/* Rival */}
                                <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                                    <Image
                                        src="/UCimg/EscudoUC.png"
                                        alt="Escudo Universidad Católica"
                                        width={300}
                                        height={300}
                                        className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain max-w-xs min-w-[64px] min-h-[64px]"
                                    />
                                </div>
                            </div>

                            {/* CTA Principal - Más elegante */}
                            <div className="text-center mb-6">
                                <Link
                                    href="/acreditacion"
                                    prefetch={true}
                                    onClick={handleNavigate}
                                    className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 text-white text-sm sm:text-base md:text-xl font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 btn-glow overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #000000 0%, #666666 100%)',
                                        border: '1px solid #c0c0c0'
                                    }}>
                                    <span className="absolute inset-0 w-full h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                        style={{ background: 'linear-gradient(135deg, #666666 0%, #c0c0c0 100%)' }}>
                                    </span>
                                    <i className="fas fa-ticket-alt relative z-10 text-lg sm:text-xl md:text-2xl group-hover:translate-x-1 transition-transform duration-300"></i>
                                    <span className="relative z-10 text-lg sm:text-xl md:text-2xl">Acredítate: haz clic aquí</span>
                                    <i className="fas fa-arrow-right relative z-10 text-lg sm:text-xl md:text-2xl group-hover:translate-x-2 transition-transform duration-300"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Minimalista */}
                <footer className="relative text-white py-6"
                    style={{ background: 'linear-gradient(180deg, #000000E6 0%, #333333 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Logos y unión */}
                            <div className="flex items-center gap-4">
                                <Image
                                    src="/colocolo/EscudoColo.png"
                                    alt="Logo Colo-Colo"
                                    width={80}
                                    height={50}
                                    className="h-10 w-auto object-contain"
                                />
                                
                            </div>

                            {/* Copyright estático */}
                            <div className="text-center md:text-right">
                                <span className="text-sm text-white opacity-80">
                                    © {new Date().getFullYear()} Desarrollado por Accredia para Colo-Colo. © Todos los derechos reservados.
                                </span>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center">
                            <div className="flex justify-center gap-5 text-white">
                                <a href="https://www.facebook.com/ColoColo" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: '#c0c0c0' }}>
                                    <i className="fab fa-facebook text-xl"></i>
                                </a>
                                <a href="https://x.com/ColoColo" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: '#c0c0c0' }}>
                                    <i className="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="https://www.instagram.com/colocolo" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: '#c0c0c0' }}>
                                    <i className="fab fa-instagram text-lg"></i>
                                </a>
                                <a href="https://www.youtube.com/user/ColoColoOficial" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: '#c0c0c0' }}>
                                    <i className="fab fa-youtube text-lg"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

