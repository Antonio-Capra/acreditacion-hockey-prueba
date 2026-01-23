"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";

interface BotonVolverProps {
  href?: string;
}

export default function BotonVolver({ href = "/" }: BotonVolverProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <>
      {isNavigating && <LoadingSpinner message="Cargando..." />}

      {/* Botón volver */}
      <Link
        href={href}
        onClick={handleClick}
        className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50 inline-flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-medium transition-all px-4 sm:px-5 py-3 sm:py-3 rounded-full border border-white/30 hover:scale-105 active:scale-95 text-sm sm:text-base"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Volver</span>
      </Link>
    </>
  );
}
