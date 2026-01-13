"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../LoadingSpinner";

export default function IconoFlotanteAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    router.push("/admin");
  };

  return (
    <>
      {isLoading && <LoadingSpinner message="Cargando..." />}
      
      <Link
        href="/admin"
        onClick={handleClick}
        className="fixed top-3 sm:top-6 right-3 sm:right-6 z-50 group"
        title="Acceso Administrador"
      >
        <div className="bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all p-2.5 sm:p-3 rounded-full border border-white/30 hover:scale-110 flex items-center justify-center group-hover:gap-2 active:scale-95">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-white text-xs sm:text-sm font-medium pr-1 opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap hidden sm:inline">Admin</span>
        </div>
      </Link>
    </>
  );
}
