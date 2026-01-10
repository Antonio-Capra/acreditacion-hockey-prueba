"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      {/* Overlay de loading */}
      {isNavigating && (
        <div className="fixed inset-0 bg-[#3d2362]/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white font-semibold">Cargando...</p>
          </div>
        </div>
      )}

      {/* Botón volver */}
      <Link
        href={href}
        onClick={handleClick}
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-medium transition-all px-4 py-2 rounded-full border border-white/30 hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>
    </>
  );
}
