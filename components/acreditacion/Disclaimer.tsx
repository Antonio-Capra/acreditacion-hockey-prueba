'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DisclaimerModalProps {
  isVisible: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ isVisible, onAccept }: DisclaimerModalProps) {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de tolerancia
      setCanAccept(isAtBottom);
    }
  };

  useEffect(() => {
    if (isVisible && contentRef.current) {
      // Reset state when modal opens
      setCanAccept(false);
      // Check initial scroll position
      handleScroll();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Términos y Condiciones de Acreditación</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 mb-4 text-xl md:text-2xl">
            Antes de continuar, por favor revise completamente los términos y condiciones para el proceso de acreditación.
          </p>

          {/* Scrollable Content */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e5799]/30 scrollbar-track-gray-100 scrollbar-thumb-rounded-full hover:scrollbar-thumb-[#1e5799]/50 transition-colors"
          >
            <div className="space-y-4 text-xl md:text-2xl text-gray-700 pr-2">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="space-y-3">
                  <p className="font-semibold text-blue-800 flex items-center gap-2">
                    <span className="text-3xl">📋</span>
                    <span>Proceso de Acreditación</span>
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Cada solicitud de acreditación debe ser realizada por el editor del medio, quien tendrá que agregar a los trabajadores que vengan a cubrir el partido.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
                <div className="space-y-3">
                  <p className="font-semibold text-yellow-800 flex items-center gap-2">
                    <span className="text-3xl">⏰</span>
                    <span>Plazo de Acreditación</span>
                  </p>
                  <p className="text-yellow-700 leading-relaxed">
                    Desde el lunes 02 de febrero, hasta el jueves 05 a las 12:30 horas; sin excepción. No se aceptarán solicitudes fuera de plazo.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
                <div className="space-y-3">
                  <p className="font-semibold text-red-800 flex items-center gap-2">
                    <span className="text-3xl">⚠️</span>
                    <span>Restricciones de Cupos</span>
                  </p>
                  <p className="text-red-700 leading-relaxed">
                    Cruzados no aceptará solicitudes con más inscritos que el cupo asignado según corresponda a su tipo de medio.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                <div className="space-y-3">
                  <p className="font-semibold text-green-800 flex items-center gap-2">
                    <span className="text-3xl">📞</span>
                    <span>Excepciones y Consultas</span>
                  </p>
                  <p className="text-green-700 leading-relaxed">
                    Solicitudes de excepciones a los cupos y/o disponibilidad de espacios de estacionamiento (limitados), deben ser consultadas al área de comunicaciones de Cruzados, con la debida anterioridad y por los canales formales (correo palarcon@cruzados.cl).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onAccept}
              disabled={!canAccept}
              className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 text-lg ${
                canAccept
                  ? 'bg-gradient-to-r from-[#1e5799] to-[#2989d8] hover:from-[#2989d8] hover:to-[#3c9de5] text-white shadow-lg hover:shadow-xl active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAccept ? 'Entiendo y acepto los términos' : 'Desliza y lee para continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}