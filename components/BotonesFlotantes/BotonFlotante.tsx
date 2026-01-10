// components/FloatingButton.tsx
export default function BotonFlotante() {
  return (
    <a
      href="https://www.somosvs.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-2xl border border-[#a10d79]/20 hover:bg-white hover:scale-105 transition-all duration-300">
        <span className="text-[#a10d79] font-semibold text-sm">Somos VS</span>
        <svg className="w-5 h-5 text-[#e8b543] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}
