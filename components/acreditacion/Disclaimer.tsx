import React, { useState } from "react";

interface DisclaimerItem {
  icon: React.ReactNode;
  title?: string;
  text: string;
}

interface DisclaimerModalProps {
  onAccept: () => void;
  isVisible?: boolean;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, isVisible = true }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const disclaimerItems: DisclaimerItem[] = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#e8b543]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      ),
      text: "Cada solicitud de acreditación debe ser realizada por el editor del medio, quien tendrá que agregar a los trabajadores que vengan a cubrir el partido.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#e8b543]" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      text: "Plazo de acreditación: desde el lunes 10 de febrero hasta el viernes 14 de febrero a las 18:00 hrs, sin excepción. No se aceptarán solicitudes fuera de plazo.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#e8b543]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      text: "Cruzados no aceptará solicitudes con más inscritos que el número indicado en los cupos.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#e8b543]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v2h8v-2zm0-3h-8v2h8V11zm0-3H4V6h14v2z" />
        </svg>
      ),
      text: "Solicitudes de excepciones a los cupos y/o disponibilidad de espacios de estacionamiento (limitados), deben ser consultadas al área de comunicaciones de Cruzados, con la debida anterioridad y por los canales formales (correo palarcon@cruzados.cl).",
    },
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 10;
    setIsScrolledToBottom(isAtBottom);
  };

  return (
    <>
      {!isVisible ? null : (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" suppressHydrationWarning>
          {/* Modal */}
          <div className="bg-white rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] w-full sm:max-w-2xl flex flex-col overflow-hidden duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#f59e0b] to-[#e8b543] px-6 sm:px-8 py-6 flex items-center gap-3 shadow-md">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Términos Importantes
                </h2>
                <p className="text-white/80 text-xs sm:text-sm">
                  Lee con atención antes de continuar
                </p>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto px-6 sm:px-8 py-6"
              onScroll={handleScroll}
            >
              <div className="space-y-4">
                {disclaimerItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-xl p-4 border border-[#f59e0b]/20 hover:border-[#f59e0b]/50 transition-all"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1 flex items-start">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {item.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#78350f] text-sm sm:text-base leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll hint */}
              {!isScrolledToBottom && (
                <div className="flex justify-center pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 animate-bounce">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                    Desplázate para ver más
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 sm:px-8 py-4 flex gap-3 sm:gap-4">
              <button
                onClick={onAccept}
                disabled={!isScrolledToBottom}
                className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  isScrolledToBottom
                    ? "bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white hover:from-[#207cca] hover:to-[#7db9e8] shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isScrolledToBottom ? "✓ Entiendo y acepto" : "Desplázate hasta abajo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisclaimerModal;
