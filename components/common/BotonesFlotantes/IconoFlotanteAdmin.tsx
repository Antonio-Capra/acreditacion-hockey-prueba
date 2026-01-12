"use client";

import Link from "next/link";

export default function IconoFlotanteAdmin() {
  return (
    <Link
      href="/admin"
      className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 group"
      title="Acceso Administrador"
    >
      <div className="bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all p-2 sm:p-3 rounded-full border border-white/30 hover:scale-110 flex items-center justify-center group-hover:gap-2">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-white text-xs sm:text-sm font-medium pr-1 opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 overflow-hidden whitespace-nowrap">Admin</span>
      </div>
    </Link>
  );
}
