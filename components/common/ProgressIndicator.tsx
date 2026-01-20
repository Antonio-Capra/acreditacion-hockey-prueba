"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
}: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Indicador visual con círculos */}
      <div className="flex items-center justify-center mb-4">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={idx} className="flex items-center justify-center" style={{ flex: `1 1 ${100 / totalSteps}%` }}>
              {/* Círculo del paso - centrado en su espacio */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-500 text-white shadow-lg"
                    : isActive
                    ? "bg-[#1e5799] text-white shadow-lg ring-4 ring-[#1e5799]/20"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Etiquetas de pasos */}
      <div className="flex justify-center mb-3">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={idx} className="text-center" style={{ width: `${100 / totalSteps}%` }}>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? "text-[#1e5799] font-bold"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {stepLabels[idx] || `Paso ${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Texto descriptivo */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Paso <span className="font-bold text-[#1e5799]">{currentStep}</span> de {totalSteps}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {currentStep === 1 && "Complete la información del responsable de la acreditación"}
          {currentStep === 2 && "Seleccione el medio/empresa y el área de acreditación"}
          {currentStep === 3 && "Complete los datos personales de los acreditados"}
        </p>
      </div>
    </div>
  );
}
