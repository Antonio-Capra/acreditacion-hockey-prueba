"use client";

interface ValidationBadgeProps {
  isValid: boolean;
  showIcon?: boolean;
}

export default function ValidationBadge({
  isValid,
  showIcon = true,
}: ValidationBadgeProps) {
  if (!showIcon) return null;

  return (
    <span
      className={`inline-block text-lg transition-all ${
        isValid ? "text-green-500" : "text-gray-300"
      }`}
    >
      {isValid ? "✓" : "○"}
    </span>
  );
}
