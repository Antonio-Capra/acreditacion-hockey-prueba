"use client";

import React, { useState } from "react";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import DisclaimerModal from "@/components/acreditacion/Disclaimer";
import FormSection from "@/components/acreditacion/FormSection";
import ProgressIndicator from "@/components/common/ProgressIndicator";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Modal from "@/components/common/Modal";
import AcreditadoRow from "@/components/acreditacion/AcreditadoRow";
import { useAcreditacion } from "@/hooks/useAcreditacion";
import BotonVolver from "@/components/common/BotonesFlotantes/BotonVolver";
import { validateRUT, validateEmail } from "@/lib/validation";

// Lista de canales predefinidos (actualizar con los nombres reales)
const CANALES = [
  "ESPN Chile",
  "DNews Internacional",
  "DSport (DirecTV)",
  "Photosport",
  "EFE",
  "Redgol",
  "La Hora",
  "Publimetro",
  "TVN",
  "Mega",
  "Canal 13",
  "Chilevisión",
  "ADN",
  "Cooperativa",
  "Agricultura",
  "BioBio",
  "Mediabanco",
  "Frencuancia Cruzada",
  "La Tercera",
  "El Mercurio",
  "LUN",
  "La Segunda",
  "Agencia JyE",
  "Campeonato Chileno",
  "Dwos",
  "La Cuarta",
  "Pasión de Hincha",
  "RadioSport",
  "Liga Sport",
  "Imagen Virtual",
  "Radio del Lago",
  "Minuto 90",
  "As Chile",
  "En Cancha",
  "Mundo Cracks",
  "Xpress",
  "Sabes Deportes",
  "DLT",
  "Balong",
  "CNN Chile",
  "Sifup",
  "Espacio Cruzado",
  "Graficapress",
  "SepuTV",
  "Señal Deportiva",
  "Agencia UNO",
  "Rumbo Deportivo",
  "En el Camarín",
  "Radio Portales",
  "Todo es Cancha",
  "Picados TV",
  "Touch TV",
  "Radio Santiago",
  "EMOL",
  "El Mercurio Valparaíso",
  "Tribuna Andes",
  "Al Aire Libre punto CL.",
  "Otros"
];

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
  responsable_rut: string;
  responsable_email: string;
  responsable_telefono: string;
  empresa: string;
  empresa_personalizada: string;
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
  const { areas, loading: areasLoading, cuposError, closeCuposError, submitAcreditacion, error: areasError } = useAcreditacion();

  const ACCREDITATION_CLOSED = true;
  const ACCREDITATION_CLOSED_MESSAGE = "Lamentablemente ya no estas en tiempo de acreditarte. El plazo de acreditacion ha finalizado.";
  
  const [formData, setFormData] = useState<FormData>({
    responsable_nombre: "",
    responsable_primer_apellido: "",
    responsable_segundo_apellido: "",
    responsable_rut: "",
    responsable_email: "",
    responsable_telefono: "",
    empresa: "",
    empresa_personalizada: "",
    area: "",
    acreditados: [createEmptyAcreditado()],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    acreditados_count: number;
  }>({ show: false, acreditados_count: 0 });
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [currentStep, setCurrentStep] = useState(1);
  const [responsableErrors, setResponsableErrors] = useState<{[key: string]: string}>({});

  const selectedArea = areas.find((a) => a.codigo === formData.area);

  const getEmpresaDisplay = () => {
    if (formData.empresa === "Otros") {
      return formData.empresa_personalizada;
    }
    return formData.empresa;
  };

  // Calcular el paso actual basado en el progreso del formulario
  React.useEffect(() => {
    let step = 1;
    
    // Si hay empresa seleccionada (y si es Otros, personalizada), estamos en paso 2
    const empresaValida = formData.empresa && (formData.empresa !== "Otros" || formData.empresa_personalizada?.trim());
    if (empresaValida) {
      step = 2;
    }
    
    // Si hay área seleccionada, estamos en paso 3
    if (empresaValida && formData.area) {
      step = 3;
    }
    
    setCurrentStep(step);
  }, [formData]);

  const handleResponsableChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validar campos específicos
    if (field === 'responsable_rut') {
      const newErrors = { ...responsableErrors };
      if (value && !validateRUT(value)) {
        newErrors.responsable_rut = 'RUT inválido';
      } else {
        delete newErrors.responsable_rut;
      }
      setResponsableErrors(newErrors);
    }

    if (field === 'responsable_email') {
      const newErrors = { ...responsableErrors };
      if (value && !validateEmail(value)) {
        newErrors.responsable_email = 'Email inválido';
      } else {
        delete newErrors.responsable_email;
      }
      setResponsableErrors(newErrors);
    }
  };

  const handleEmpresaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      empresa: value,
      empresa_personalizada: value === "Otros" ? prev.empresa_personalizada : "",
    }));
  };

  const handleEmpresaPersonalizadaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      empresa_personalizada: value,
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
    // Validaciones básicas
    if (!formData.responsable_nombre?.trim()) {
      return "Complete el nombre del responsable";
    }
    if (!formData.responsable_primer_apellido?.trim()) {
      return "Complete el primer apellido del responsable";
    }
    if (!formData.responsable_rut?.trim()) {
      return "Complete el RUT del responsable";
    }
    if (!validateRUT(formData.responsable_rut)) {
      return "El RUT del responsable es inválido";
    }
    if (!formData.responsable_email?.trim()) {
      return "Complete el email del responsable";
    }
    if (!validateEmail(formData.responsable_email)) {
      return "El email del responsable es inválido";
    }
    if (!formData.empresa?.trim()) {
      return "Seleccione un medio/empresa";
    }
    if (formData.empresa === "Otros" && !formData.empresa_personalizada?.trim()) {
      return "Complete el nombre del medio/empresa";
    }
    if (!formData.area?.trim()) {
      return "Seleccione un área";
    }

    // Validar acreditados
    for (let i = 0; i < formData.acreditados.length; i++) {
      const acreditado = formData.acreditados[i];
      if (!acreditado.nombre?.trim()) {
        return `Complete el nombre del acreditado ${i + 1}`;
      }
      if (!acreditado.primer_apellido?.trim()) {
        return `Complete el primer apellido del acreditado ${i + 1}`;
      }
      if (!acreditado.rut?.trim()) {
        return `Complete el RUT del acreditado ${i + 1}`;
      }
      if (!validateRUT(acreditado.rut)) {
        return `El RUT del acreditado ${i + 1} es inválido`;
      }
      if (!acreditado.email?.trim()) {
        return `Complete el email del acreditado ${i + 1}`;
      }
      if (!validateEmail(acreditado.email)) {
        return `El email del acreditado ${i + 1} es inválido`;
      }
      if (!acreditado.cargo?.trim()) {
        return `Seleccione el cargo del acreditado ${i + 1}`;
      }
      if (!acreditado.tipo_credencial?.trim()) {
        return `Complete el tipo de credencial del acreditado ${i + 1}`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmissionStatus({ type: "error", message: validationError });
      return;
    }

    setShowConfirmation(true);
  };

  const resetForm = () => {
    setFormData({
      responsable_nombre: "",
      responsable_primer_apellido: "",
      responsable_segundo_apellido: "",
      responsable_rut: "",
      responsable_email: "",
      responsable_telefono: "",
      empresa: "",
      empresa_personalizada: "",
      area: "",
      acreditados: [createEmptyAcreditado()],
    });
    setSubmissionStatus({ type: null, message: "" });
    setCurrentStep(1);
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ show: false, acreditados_count: 0 });
    resetForm();
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      const formDataToSend = { ...formData };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (formDataToSend as any).empresa_personalizada;
      if (formData.empresa === "Otros") {
        formDataToSend.empresa = `Otros: ${formData.empresa_personalizada}`;
      }

      const result = await submitAcreditacion(formDataToSend);
      
      if (result.success) {
        setSuccessModal({ show: true, acreditados_count: formData.acreditados.length });
        setSubmissionStatus({ type: "success", message: "Acreditación enviada exitosamente" });
      } else if (result.cuposError) {
        // Modal is already shown by the hook, no need to do anything else
      }

    } catch (err) {
      let msg = "Error al enviar la acreditación";
      if (err instanceof Error && err.message.includes("23505")) {
        msg = "Ya existe una acreditación para este RUT, empresa y área en este evento.";
      }
      setSubmissionStatus({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (areasLoading) {
    return <LoadingSpinner message="Cargando..." />;
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            Acreditación Prensa
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            Universidad Católica vs Deportes Concepción - Domingo 8 de Febrero 2026, Claro Arena
          </p>
        </header>

        {ACCREDITATION_CLOSED && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 sm:p-8 shadow-2xl">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-5 text-center text-lg font-semibold">
              {ACCREDITATION_CLOSED_MESSAGE}
            </div>
          </div>
        )}

        {!ACCREDITATION_CLOSED && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-6 sm:p-8 shadow-2xl space-y-8"
          >
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={3}
              stepLabels={["Responsable", "Cupos", "Acreditados"]}
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
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
              />
              <div>
                <input
                  type="text"
                  placeholder="RUT (sin puntos, con guion. Ej: 11111111-1)"
                  value={formData.responsable_rut}
                  pattern="^[0-9]{7,8}-[0-9kK]{1}$"
                  title="RUT sin puntos, con guion. Ej: 11111111-1"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\./g, "");
                    value = value.replace(/[^0-9kK\-]/g, "");
                    handleResponsableChange("responsable_rut", value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                    responsableErrors.responsable_rut
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-[#1e5799]"
                  }`}
                  required
                />
                {responsableErrors.responsable_rut && (
                  <p className="text-red-500 text-sm mt-1">{responsableErrors.responsable_rut}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.responsable_email}
                  onChange={(e) => {
                    handleResponsableChange("responsable_email", e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                    responsableErrors.responsable_email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-[#1e5799]"
                  }`}
                  required
                />
                {responsableErrors.responsable_email && (
                  <p className="text-red-500 text-sm mt-1">{responsableErrors.responsable_email}</p>
                )}
              </div>
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.responsable_telefono}
                onChange={(e) => {
                  handleResponsableChange("responsable_telefono", e.target.value);
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
              />
              <select
                value={formData.empresa}
                onChange={(e) => handleEmpresaChange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                required
              >
                <option value="">Seleccionar Medio/Empresa</option>
                {CANALES.map((canal) => (
                  <option key={canal} value={canal}>
                    {canal}
                  </option>
                ))}
              </select>
              {formData.empresa === "Otros" && (
                <input
                  type="text"
                  placeholder="Nombre del Medio/Empresa"
                  value={formData.empresa_personalizada}
                  onChange={(e) => handleEmpresaPersonalizadaChange(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
              )}
              </div>
            </FormSection>

          {/* Sección Cupos por área del medio */}
          <FormSection
            stepNumber={2}
            title="Seleccione la categoría a la que corresponde su medio"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <select
                value={formData.area}
                onChange={(e) => {
                  handleAreaChange(e.target.value);
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                required
              >
                <option value="" >Seleccionar Área</option>
                {areas.map((area) => (
                  <option key={area.codigo} value={area.codigo}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>
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
        )}
      </div>

      {!ACCREDITATION_CLOSED && (
        <>
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

          <Modal
            isOpen={successModal.show}
            type="success"
            title="¡Solicitud enviada exitosamente!"
            message="Su solicitud de acreditación ha sido registrada correctamente."
            buttons={[
              {
                label: "Aceptar",
                onClick: handleSuccessModalClose,
                variant: "primary",
              },
            ]}
            onClose={handleSuccessModalClose}
          >
            <div className="mt-4 space-y-3 text-lg md:text-xl text-gray-800">
              <p className="text-red-700 font-bold text-lg md:text-xl">
                La solicitud de acreditación no garantiza la obtención de la misma. La resolución será informada vía correo electrónico.
              </p>
              <p><span className="font-semibold">Empresa:</span> {getEmpresaDisplay()}</p>
              <p><span className="font-semibold">Área:</span> {selectedArea?.nombre}</p>
              <p><span className="font-semibold">Acreditados registrados:</span> {successModal.acreditados_count}</p>
            </div>
          </Modal>

          {cuposError?.show && (
            <Modal
              isOpen={cuposError.show}
              type="error"
              title="Cupos Agotados"
              message={`No hay cupos disponibles.\n\nEmpresa: ${cuposError.empresa}\nÁrea: ${cuposError.area}\nCupos máximos: ${cuposError.maximo}\nYa acreditados: ${cuposError.existentes}\nIntentó registrar: ${cuposError.solicitados}\nTotal resultante: ${cuposError.existentes + cuposError.solicitados} (excede el límite)`}
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
        </>
      )}
    </div>
  );
}
