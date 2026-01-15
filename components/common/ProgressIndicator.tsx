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
      <div className="flex gap-2 mb-3">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={idx} className="flex-1 flex items-center gap-2">
              <div
                className={`h-2 flex-1 rounded-full transition-all ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                    ? "bg-[#1e5799]"
                    : "bg-gray-300"
                }`}
              />
              {stepLabels[idx] && (
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? "text-[#1e5799]" : "text-gray-500"
                  }`}
                >
                  {stepLabels[idx]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-600 text-center">
        Paso {currentStep} de {totalSteps}
      </p>
    </div>
  );
}
