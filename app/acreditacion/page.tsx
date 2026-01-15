"use client";

import { useState } from "react";
import Image from "next/image";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import DisclaimerModal from "@/components/acreditacion/Disclaimer";
import FormSection from "@/components/acreditacion/FormSection";
import ProgressIndicator from "@/components/common/ProgressIndicator";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SuccessToast from "@/components/common/SuccessToast";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import ValidationBadge from "@/components/common/ValidationBadge";
import { useRouter } from "next/navigation";

interface Acreditado {
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface FormData {
  responsable_nombre: string;
  responsable_primer_apellido: string;
  responsable_segundo_apellido: string;
  responsable_email: string;
  responsable_telefono: string;
  empresa: string;
  area: string;
  acreditados: Acreditado[];
}

const AREAS = [
  { codigo: "A", nombre: "Radiales con caseta", cupos: 5 },
  { codigo: "B", nombre: "Radiales sin caseta", cupos: 3 },
  { codigo: "C", nombre: "TV Nacionales", cupos: 2 },
  { codigo: "D", nombre: "Sitios Web", cupos: 2 },
  { codigo: "E", nombre: "Medios Escritos", cupos: 2 },
  { codigo: "F", nombre: "Agencias", cupos: 1 },
  { codigo: "G", nombre: "Reportero gráfico cancha", cupos: 1 },
];

const CARGOS = [
  "Periodista",
  "Periodista Pupitre",
  "Relator",
  "Comentarista",
  "Camarógrafo",
  "Reportero Gráfico Cancha",
  "Reportero Gráfico Tribuna",
  "Técnico",
];

function createEmptyAcreditado(): Acreditado {
  return {
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    rut: "",
    email: "",
    cargo: "",
    tipo_credencial: "",
    numero_credencial: "",
  };
}

export default function AcreditacionPage() {
  const [formData, setFormData] = useState<FormData>({
    responsable_nombre: "",
    responsable_primer_apellido: "",
    responsable_segundo_apellido: "",
    responsable_email: "",
    responsable_telefono: "",
    empresa: "",
    area: "A",
    acreditados: [createEmptyAcreditado()],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    acreditados_count: number;
  }>({ show: false, acreditados_count: 0 });
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleResponsableChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAreaChange = (value: string) => {
    const selectedArea = AREAS.find((a) => a.codigo === value);
    const cupos = selectedArea?.cupos || 1;

    // Crear arreglo de acreditados con el número de cupos
    const newAcreditados = Array.from({ length: cupos }, () =>
      createEmptyAcreditado()
    );

    setFormData((prev) => ({
      ...prev,
      area: value,
      acreditados: newAcreditados,
    }));
  };

  const handleAcreditadoChange = (
    index: number,
    field: keyof Acreditado,
    value: string
  ) => {
    const newAcreditados = [...formData.acreditados];
    newAcreditados[index] = {
      ...newAcreditados[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      acreditados: newAcreditados,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos del responsable
    if (
      !formData.responsable_nombre ||
      !formData.responsable_primer_apellido ||
      !formData.responsable_email
    ) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor completa los datos del responsable",
      });
      return;
    }

    if (!formData.empresa) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor especifica el medio/empresa",
      });
      return;
    }

    // Validar que todos los acreditados estén completos
    if (
      formData.acreditados.some(
        (a) =>
          !a.nombre ||
          !a.primer_apellido ||
          !a.rut ||
          !a.email ||
          !a.cargo ||
          !a.tipo_credencial
      )
    ) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor completa todos los datos de los acreditados",
      });
      return;
    }

    // Mostrar modal de confirmación
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/acreditaciones/prensa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsable_nombre: formData.responsable_nombre,
          responsable_primer_apellido: formData.responsable_primer_apellido,
          responsable_segundo_apellido: formData.responsable_segundo_apellido,
          responsable_email: formData.responsable_email,
          responsable_telefono: formData.responsable_telefono,
          empresa: formData.empresa,
          area: formData.area,
          acreditados: formData.acreditados.map((a) => ({
            ...a,
            area: formData.area,
            empresa: formData.empresa,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la solicitud");
      }

      setShowConfirmation(false);

      // Mostrar toast de éxito
      setSuccessToast({
        show: true,
        acreditados_count: formData.acreditados.length,
      });

      // Limpiar formulario después del toast
      setTimeout(() => {
        setFormData({
          responsable_nombre: "",
          responsable_primer_apellido: "",
          responsable_segundo_apellido: "",
          responsable_email: "",
          responsable_telefono: "",
          empresa: "",
          area: "A",
          acreditados: [createEmptyAcreditado()],
        });
        setCurrentStep(1);
      }, 2000);
    } catch (error) {
      setShowConfirmation(false);
      setSubmissionStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Error al procesar la solicitud",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedArea = AREAS.find((a) => a.codigo === formData.area);

  return (
    <div className="bg-gradient-to-br from-[#1e5799] to-[#7db9e8] overflow-x-hidden max-w-full">
      {showDisclaimer && (
        <DisclaimerModal
          onAccept={() => setShowDisclaimer(false)}
          isVisible={showDisclaimer}
        />
      )}

      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#FFFFFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/2 transform translate-x-1/2 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
      </div>

      <IconoFlotanteAdmin />
      <BotonFlotante />

      <main className="min-h-screen w-full max-w-full flex flex-col items-center px-4 py-8 relative overflow-hidden box-border">
        <button
          onClick={() => router.push("/")}
          className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50 inline-flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 font-medium transition-all px-3 sm:px-4 py-2 sm:py-2 rounded-full border border-white/30 hover:scale-105 active:scale-95 text-xs sm:text-sm"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Volver</span>
        </button>

        <div className="w-full max-w-2xl">
          <header className="mb-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-xs mb-4 min-h-[60px] flex items-center justify-center">
              <Image
                src="/UCimg/LogoUC.png"
                alt="Logo del evento"
                width={150}
                height={75}
                priority
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
              Acreditación Prensa
            </h1>
            <p className="text-white/80 mt-2">
              Universidad Católica vs Deportes Concepción - Claro Arena
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 sm:p-8 shadow-2xl space-y-8"
          >
            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={3}
              stepLabels={["Responsable", "Institución", "Acreditados"]}
            />

            {/* Mensaje de estado */}
            {submissionStatus.type && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  submissionStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {submissionStatus.message}
              </div>
            )}

            {/* Sección Responsable */}
            <FormSection
              stepNumber={1}
              title="Datos del Responsable"
              description="Información de contacto del responsable de la acreditación"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.responsable_nombre}
                  onChange={(e) => {
                    handleResponsableChange("responsable_nombre", e.target.value);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Primer Apellido"
                  value={formData.responsable_primer_apellido}
                  onChange={(e) => {
                    handleResponsableChange(
                      "responsable_primer_apellido",
                      e.target.value
                    );
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Segundo Apellido"
                  value={formData.responsable_segundo_apellido}
                  onChange={(e) => {
                    handleResponsableChange(
                      "responsable_segundo_apellido",
                      e.target.value
                    );
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.responsable_email}
                  onChange={(e) => {
                    handleResponsableChange("responsable_email", e.target.value);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.responsable_telefono}
                  onChange={(e) => {
                    handleResponsableChange(
                      "responsable_telefono",
                      e.target.value
                    );
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                />
              </div>
            </FormSection>

            {/* Sección Identificación Institucional */}
            <FormSection
              stepNumber={2}
              title="Identificación Institucional"
              description="Información de la empresa y categoría de acreditación"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Medio/Empresa"
                  value={formData.empresa}
                  onChange={(e) => {
                    handleResponsableChange("empresa", e.target.value);
                    setCurrentStep(2);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />

                <select
                  value={formData.area}
                  onChange={(e) => {
                    handleAreaChange(e.target.value);
                    setCurrentStep(2);
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                >
                  {AREAS.map((area) => (
                    <option key={area.codigo} value={area.codigo}>
                      {area.nombre} ({area.cupos} cupos)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Cupos disponibles:</strong> {selectedArea?.cupos} |
                  <strong> Formularios de acreditados:</strong>{" "}
                  {formData.acreditados.length}
                </p>
              </div>
            </FormSection>

            {/* Sección Acreditados */}
            <FormSection
              stepNumber={3}
              title="Datos de Acreditados"
              description={`Complete los datos de los ${formData.acreditados.length} acreditado(s)`}
            >
              <div className="space-y-6">
                {formData.acreditados.map((acreditado, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-700 text-lg">
                      Acreditado {index + 1} de {formData.acreditados.length}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={acreditado.nombre}
                        onChange={(e) => {
                          handleAcreditadoChange(index, "nombre", e.target.value);
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Primer Apellido"
                        value={acreditado.primer_apellido}
                        onChange={(e) => {
                          handleAcreditadoChange(
                            index,
                            "primer_apellido",
                            e.target.value
                          );
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Segundo Apellido"
                        value={acreditado.segundo_apellido}
                        onChange={(e) => {
                          handleAcreditadoChange(
                            index,
                            "segundo_apellido",
                            e.target.value
                          );
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                      />

                      <input
                        type="text"
                        placeholder="RUT (sin puntos, con guion: 12345678-9)"
                        value={acreditado.rut}
                        onChange={(e) => {
                          handleAcreditadoChange(index, "rut", e.target.value);
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <input
                        type="email"
                        placeholder="Email"
                        value={acreditado.email}
                        onChange={(e) => {
                          handleAcreditadoChange(index, "email", e.target.value);
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <select
                        value={acreditado.cargo}
                        onChange={(e) => {
                          handleAcreditadoChange(index, "cargo", e.target.value);
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      >
                        <option value="">Selecciona cargo</option>
                        {CARGOS.map((cargo) => (
                          <option key={cargo} value={cargo}>
                            {cargo}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Tipo de credencial (Ej: Carné UC, Acreditación Especial, etc)"
                        value={acreditado.tipo_credencial}
                        onChange={(e) => {
                          handleAcreditadoChange(
                            index,
                            "tipo_credencial",
                            e.target.value
                          );
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Número de credencial"
                        value={acreditado.numero_credencial}
                        onChange={(e) => {
                          handleAcreditadoChange(
                            index,
                            "numero_credencial",
                            e.target.value
                          );
                          setCurrentStep(3);
                        }}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white font-semibold rounded-xl hover:from-[#207cca] hover:to-[#7db9e8] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    Enviando...
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Confirmación */}
        <ConfirmationModal
          isOpen={showConfirmation}
          title="Confirmar solicitud de acreditación"
          message="¿Está seguro de que desea enviar esta solicitud?"
          details={[
            {
              "Responsable": `${formData.responsable_nombre} ${formData.responsable_primer_apellido}`,
            },
            {
              "Empresa": formData.empresa,
            },
            {
              "Área": selectedArea?.nombre || "No seleccionado",
            },
            {
              "Acreditados": formData.acreditados.length,
            },
          ]}
          isLoading={isSubmitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmation(false)}
          confirmText="Confirmar envío"
          cancelText="Cancelar"
        />

        {/* Toast de Éxito */}
        {successToast.show && (
          <SuccessToast
            title="¡Solicitud enviada!"
            message="Su solicitud de acreditación ha sido registrada correctamente."
            details={[
              `${successToast.acreditados_count} acreditado(s) registrado(s)`,
              `Empresa: ${formData.empresa}`,
              `Área: ${selectedArea?.nombre}`,
            ]}
            onClose={() => setSuccessToast({ show: false, acreditados_count: 0 })}
          />
        )}

        <footer className="py-6 text-center mt-8">
          <p className="text-sm text-white/60">
            Sistema de acreditación oficial • Registro rápido y seguro
          </p>
        </footer>
      </main>
    </div>
  );
}
