import React from "react";

interface ButtonSpinnerProps {
  size?: number;
  colorClass?: string;
  className?: string;
}

export default function ButtonSpinner({ size = 16, colorClass = "text-white", className = "" }: ButtonSpinnerProps) {
  return (
    <svg
      className={`animate-spin ${colorClass} ${className}`}
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
