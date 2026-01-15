"use client";

import { useState, useEffect } from "react";

interface SuccessToastProps {
  title: string;
  message: string;
  details?: string[];
  duration?: number;
  onClose?: () => void;
}

export default function SuccessToast({
  title,
  message,
  details,
  duration = 5000,
  onClose,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <h3 className="font-bold text-green-800">{title}</h3>
            <p className="text-sm text-green-700 mt-1">{message}</p>
            {details && details.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-green-600">
                {details.map((detail, idx) => (
                  <li key={idx}>• {detail}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="text-green-600 hover:text-green-800 flex-shrink-0 text-xl"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
