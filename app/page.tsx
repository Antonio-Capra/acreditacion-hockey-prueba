// app/page.tsx
"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useEventoActivo } from "@/hooks";

export default function LandingPage() {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const { evento, loading: eventoLoading } = useEventoActivo();

    const formattedDate = useMemo(() => {
        if (!evento?.fecha) return "";
        const parsed = new Date(`${evento.fecha}T${evento.hora || "00:00"}`);
        if (Number.isNaN(parsed.getTime())) return "";
        const formatter = new Intl.DateTimeFormat("es-CL", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
        const text = formatter.format(parsed);
        return text.charAt(0).toUpperCase() + text.slice(1);
    }, [evento?.fecha, evento?.hora]);

    const formattedTime = evento?.hora ? `${evento.hora} hrs` : "";
    const localCrestSrc = evento?.escudo_local_url ?? "";
    const rivalCrestSrc = evento?.escudo_rival_url ?? "";

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsNavigating(true);
        router.push("/acreditacion");
    };

    return (
        <>
            <style>
                {`@import url("https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Special+Gothic+Condensed+One&display=swap");`}
            </style>
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
                            backgroundImage: "url('/UCimg/Claro.jpg')",
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
                                        background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                                        border: `2px solid var(--azul-mas-claro)`
                                    }}>
                                    <i className="fas fa-futbol mr-3" style={{ color: 'white', fontSize: '1.4em' }}></i>
                                    Liga de Primera Mercado Libre
                                </div>

                                {/* Fecha */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2 mb-1 sm:mb-0"
                                    style={{
                                        background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                                        border: `2px solid var(--azul-mas-claro)`
                                    }}>
                                    <i className="fas fa-calendar-alt mr-3" style={{ color: 'white', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">{formattedDate || "Domingo 8 Febrero"}</span>
                                </div>

                                {/* Hora */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2 mb-1 sm:mb-0"
                                    style={{
                                        background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                                        border: `2px solid var(--azul-mas-claro)`
                                    }}>
                                    <i className="fas fa-clock mr-3" style={{ color: 'white', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">{formattedTime || "20:30 hrs"}</span>
                                </div>

                                {/* Estadio */}
                                <div className="inline-block px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg border-2"
                                    style={{
                                        background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                                        border: `2px solid var(--azul-mas-claro)`
                                    }}>
                                    <i className="fas fa-map-marker-alt mr-3" style={{ color: 'white', fontSize: '1.3em' }}></i>
                                    <span className="font-semibold">{evento.lugar || "Claro Arena"}</span>
                                </div>
                            </div>

                            {/* Título compacto */}
                            <h1 className="text-center sm:text-left text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 leading-tight w-full">
                                <span className="block text-white drop-shadow-2xl">{evento.local || "Universidad Catolica"}</span>
                            </h1>

                            {/* VS y rival en una línea */}
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 w-full justify-center sm:justify-start">
                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light tracking-wide" style={{ color: 'var(--azul-claro)' }}>vs</span>
                                <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white opacity-90">
                                    {evento.rival || "Deportes Concepcion"}
                                </h2>
                            </div>
                        </div>

                        {/* Centro completamente vacío - aquí está la cara del jugador */}

                        {/* Bottom Section - Todo el evento abajo */}
                        <div className="text-white pb-6 flex flex-col items-center w-full">

                            {/* Shields Section */}
                            <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-12 lg:gap-16 xl:gap-20 mb-4 sm:mb-8 w-full">
                                {/* Universidad Católica */}
                                <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                                  {eventoLoading ? (
                                    <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 xl:h-40 xl:w-40 rounded-full bg-gray-200/60 border border-gray-200 animate-pulse" />
                                  ) : (
                                    <Image
                                      src={localCrestSrc}
                                      alt="Escudo Universidad Católica"
                                      width={300}
                                      height={300}
                                      className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain max-w-xs min-w-[64px] min-h-[64px]"
                                    />
                                  )}
                                </div>

                                {/* VS */}
                                <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg">
                                    VS
                                </div>

                                {/* Deportes Concepción */}
                                <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                                  {eventoLoading ? (
                                    <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 xl:h-40 xl:w-40 rounded-full bg-gray-200/60 border border-gray-200 animate-pulse" />
                                  ) : (
                                    <Image
                                      src={rivalCrestSrc}
                                      alt="Escudo Deportes Concepción"
                                      width={300}
                                      height={300}
                                      className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain max-w-xs min-w-[64px] min-h-[64px]"
                                    />
                                  )}
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
                                        background: `linear-gradient(135deg, var(--azul-oscuro) 0%, var(--azul-medio) 100%)`,
                                        border: `1px solid var(--azul-mas-claro)`
                                    }}>
                                    <span className="absolute inset-0 w-full h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                        style={{ background: `linear-gradient(135deg, var(--azul-medio) 0%, var(--azul-mas-claro) 100%)` }}>
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
                    style={{ background: 'linear-gradient(180deg, rgba(30, 87, 153, 0.95) 0%, var(--azul-oscuro) 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Logos y unión */}
                            <div className="flex items-center gap-4">
                                <Image src="/UCimg/LogoUC.png" alt="Logo Cruzados" width={80} height={40} className="h-10 w-auto object-contain" />
                                <Image src="/UCimg/ClaroArenaL.png" alt="Logo Claro Arena" width={80} height={40} className="h-10 w-auto object-contain" />
                            </div>

                            {/* Copyright dinámico */}
                            <div className="text-center md:text-right">
                                <span className="text-sm text-white opacity-80">
                                    © {new Date().getFullYear()} Desarrolado por Accredia para Cruzados. © Todos los derechos reservados.
                                </span>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center">
                            <div className="flex justify-center gap-5 text-white">
                                <a href="https://www.facebook.com/cruzados.cl/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: 'var(--azul-claro)' }}>
                                    <i className="fab fa-facebook text-xl"></i>
                                </a>
                                <a href="https://x.com/Cruzados" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: 'var(--azul-claro)' }}>
                                    <i className="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="https://www.instagram.com/cruzados_oficial/?hl=es-la" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: 'var(--azul-claro)' }}>
                                    <i className="fab fa-instagram text-lg"></i>
                                </a>
                                <a href="https://www.youtube.com/user/OficialCruzados" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:scale-110"
                                    style={{ color: 'var(--azul-claro)' }}>
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

