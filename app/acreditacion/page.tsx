"use client";

import React, { useState } from "react";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import DisclaimerModal from "@/components/acreditacion/Disclaimer";
import FormSection from "@/components/acreditacion/FormSection";
import ProgressIndicator from "@/components/common/ProgressIndicator";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SuccessToast from "@/components/common/SuccessToast";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Modal from "@/components/common/Modal";
import AcreditadoRow from "@/components/acreditacion/AcreditadoRow";
import { useAcreditacion } from "@/hooks/useAcreditacion";
import BotonVolver from "@/components/common/BotonesFlotantes/BotonVolver";

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
  const { areas, loading: areasLoading, error: areasError, cuposError, closeCuposError, submitAcreditacion } = useAcreditacion();
  
  // Debug: Log cuposError changes (remove in production)
  // React.useEffect(() => {
  //   console.log('🔍 cuposError state changed:', cuposError);
  //   if (cuposError === null) {
  //     console.log('🔄 cuposError reset to null');
  //   }
  // }, [cuposError]);
  const [formData, setFormData] = useState<FormData>({
    responsable_nombre: "",
    responsable_primer_apellido: "",
    responsable_segundo_apellido: "",
    responsable_email: "",
    responsable_telefono: "",
    empresa: "",
    area: "",
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

  const selectedArea = areas.find((a) => a.codigo === formData.area);

  const handleResponsableChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAreaChange = (value: string) => {
    const selectedArea = areas.find((a) => a.codigo === value);
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

  const handleRemoveAcreditado = (index: number) => {
    if (formData.acreditados.length > 1) {
      const newAcreditados = formData.acreditados.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        acreditados: newAcreditados,
      }));
    }
  };

  const handleAddAcreditado = () => {
    const maxCupos = selectedArea?.cupos || 1;
    if (formData.acreditados.length < maxCupos) {
      setFormData((prev) => ({
        ...prev,
        acreditados: [...prev.acreditados, createEmptyAcreditado()],
      }));
    }
  };

  const validateForm = () => {
    console.log('=== FORM VALIDATION ===');
    console.log('FormData:', formData);

    // Validaciones básicas
    if (!formData.responsable_nombre?.trim()) {
      console.log('VALIDATION FAILED: responsable_nombre is empty');
      return "Complete el nombre del responsable";
    }
    if (!formData.responsable_primer_apellido?.trim()) {
      console.log('VALIDATION FAILED: responsable_primer_apellido is empty');
      return "Complete el primer apellido del responsable";
    }
    if (!formData.responsable_email?.trim()) {
      console.log('VALIDATION FAILED: responsable_email is empty');
      return "Complete el email del responsable";
    }
    if (!formData.empresa?.trim()) {
      console.log('VALIDATION FAILED: empresa is empty');
      return "Complete el nombre de la empresa";
    }
    if (!formData.area?.trim()) {
      console.log('VALIDATION FAILED: area is empty');
      return "Seleccione un área";
    }

    // Validar acreditados
    for (let i = 0; i < formData.acreditados.length; i++) {
      const acreditado = formData.acreditados[i];
      if (!acreditado.nombre?.trim()) {
        console.log(`VALIDATION FAILED: acreditado ${i + 1} nombre is empty`);
        return `Complete el nombre del acreditado ${i + 1}`;
      }
      if (!acreditado.primer_apellido?.trim()) {
        console.log(`VALIDATION FAILED: acreditado ${i + 1} primer_apellido is empty`);
        return `Complete el primer apellido del acreditado ${i + 1}`;
      }
      if (!acreditado.email?.trim()) {
        console.log(`VALIDATION FAILED: acreditado ${i + 1} email is empty`);
        return `Complete el email del acreditado ${i + 1}`;
      }
      if (!acreditado.cargo?.trim()) {
        console.log(`VALIDATION FAILED: acreditado ${i + 1} cargo is empty`);
        return `Seleccione el cargo del acreditado ${i + 1}`;
      }
      if (!acreditado.tipo_credencial?.trim()) {
        console.log(`VALIDATION FAILED: acreditado ${i + 1} tipo_credencial is empty`);
        return `Complete el tipo de credencial del acreditado ${i + 1}`;
      }
    }

    console.log('VALIDATION PASSED');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== FORM SUBMIT ATTEMPT ===');
    console.log('Current formData state:', formData);
    console.log('showDisclaimer:', showDisclaimer);

    const validationError = validateForm();
    if (validationError) {
      console.log('Validation failed:', validationError);
      setSubmissionStatus({ type: "error", message: validationError });
      return;
    }

    console.log('Validation passed, showing confirmation');
    setShowConfirmation(true);
  };

  const resetForm = () => {
    setFormData({
      responsable_nombre: "",
      responsable_primer_apellido: "",
      responsable_segundo_apellido: "",
      responsable_email: "",
      responsable_telefono: "",
      empresa: "",
      area: "",
      acreditados: [createEmptyAcreditado()],
    });
    setSubmissionStatus({ type: null, message: "" });
    setCurrentStep(1);
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    console.log('=== CONFIRM SUBMIT ===');
    console.log('Current formData:', formData);

    try {
      const result = await submitAcreditacion(formData);
      
      if (result.success) {
        setSuccessToast({ show: true, acreditados_count: formData.acreditados.length });
        setSubmissionStatus({ type: "success", message: "Acreditación enviada exitosamente" });

        // Reset form after successful submission
        setTimeout(() => {
          resetForm();
          setSuccessToast({ show: false, acreditados_count: 0 });
        }, 3000); // Give time to see the success message
      } else if (result.cuposError) {
        // Modal is already shown by the hook, no need to do anything else
        console.log('Cupos error modal shown');
      }

    } catch (error) {
      console.error('Submit error:', error);
      setSubmissionStatus({ type: "error", message: "Error al enviar la acreditación" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (areasLoading) {
    return <LoadingSpinner message="Cargando áreas..." />;
  }

  if (areasError) {
    return <div className="text-center text-red-500">Error: {areasError}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e5799] to-[#7db9e8] py-8">
      {isSubmitting && <LoadingSpinner message="Enviando acreditación..." />}

      <BotonVolver />
      <IconoFlotanteAdmin />
      <BotonFlotante />

      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-8">
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
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={3}
            stepLabels={["Responsable", "Institución", "Acreditados"]}
          />

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
                  handleResponsableChange("responsable_primer_apellido", e.target.value);
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
                  handleResponsableChange("responsable_segundo_apellido", e.target.value);
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
                  handleResponsableChange("responsable_telefono", e.target.value);
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
                <option value="">Seleccionar Área</option>
                {areas.map((area) => (
                  <option key={area.codigo} value={area.codigo}>
                    {area.nombre} ({area.cupos} cupos)
                  </option>
                ))}
              </select>
            </div>

            {selectedArea && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Área seleccionada: {selectedArea.nombre} | Cupos disponibles: {selectedArea.cupos}
                </p>
              </div>
            )}
          </FormSection>

          {/* Sección Acreditados */}
          <FormSection
            stepNumber={3}
            title="Datos de Acreditados"
            description={`Complete los datos de los ${formData.acreditados.length} acreditado(s)`}
          >
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Acreditaciones a registrar: {formData.acreditados.length} de {selectedArea?.cupos || 0} disponibles.
              </p>
            </div>
            {formData.acreditados.length < (selectedArea?.cupos || 0) && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleAddAcreditado}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e5799] text-white rounded-lg hover:bg-[#207cca] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar cupo
                </button>
              </div>
            )}
            <div className="space-y-6">
              {formData.acreditados.map((acreditado, index) => (
                <AcreditadoRow
                  key={index}
                  acreditado={acreditado}
                  index={index}
                  total={formData.acreditados.length}
                  onChange={handleAcreditadoChange}
                  onRemove={handleRemoveAcreditado}
                  canRemove={formData.acreditados.length > 1}
                />
              ))}
            </div>
          </FormSection>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-4 bg-[#1e5799] hover:bg-[#207cca] text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Enviar Acreditación
            </button>
          </div>
        </form>
      </div>

      <DisclaimerModal
        isVisible={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirmation(false)}
        title="Confirmar Envío"
        message={`¿Desea enviar la acreditación para ${formData.acreditados.length} persona(s)?`}
      />

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

      {cuposError?.show && (
        <Modal
          isOpen={cuposError.show}
          type="error"
          title="Cupos Agotados"
          message={`No hay cupos disponibles para la empresa "${cuposError.empresa}" en el área "${cuposError.area}".
          
Cupos máximos: ${cuposError.maximo}
Ya acreditados: ${cuposError.existentes}
Intentó registrar: ${cuposError.solicitados}
Total resultante: ${cuposError.existentes + cuposError.solicitados} (excede el límite)`}
          buttons={[
            {
              label: "Entendido",
              onClick: closeCuposError,
              variant: "primary",
            },
          ]}
          onClose={closeCuposError}
        />
      )}
    </div>
  );
}
