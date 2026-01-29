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
    <div className="bg-gradient-to-r from-black/5 to-gray-800/5 p-6 rounded-lg border-2 border-black/20 hover:border-black/40 transition-colors">
      <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-3">
        <span className="bg-black text-white px-3 py-1 rounded-full text-base font-bold w-8 h-8 flex items-center justify-center">
          {stepNumber}
        </span>
        {title}
      </h2>
      {description && (
        <p className="text-base text-gray-600 mb-4 ml-11">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
