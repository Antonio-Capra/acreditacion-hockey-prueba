"use client";

interface FormSectionProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export default function FormSection({
  stepNumber,
  title,
  children,
  description,
}: FormSectionProps) {
  return (
    <div className="bg-gradient-to-r from-[#1e5799]/5 to-[#2989d8]/5 p-6 rounded-lg border-2 border-[#1e5799]/20 hover:border-[#1e5799]/40 transition-colors">
      <h2 className="text-xl font-bold text-[#1e5799] mb-2 flex items-center gap-3">
        <span className="bg-[#1e5799] text-white px-3 py-1 rounded-full text-sm font-bold w-8 h-8 flex items-center justify-center">
          {stepNumber}
        </span>
        {title}
      </h2>
      {description && (
        <p className="text-sm text-gray-600 mb-4 ml-11">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
