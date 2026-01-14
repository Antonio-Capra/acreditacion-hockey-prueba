"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BotonFlotante from "@/components/common/BotonesFlotantes/BotonFlotante";
import IconoFlotanteAdmin from "@/components/common/BotonesFlotantes/IconoFlotanteAdmin";
import { useRouter } from "next/navigation";

interface Acreditado {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface FormData {
  responsable_nombre: string;
  responsable_apellido: string;
  responsable_rut: string;
  responsable_email: string;
  responsable_telefono: string;
  medio: string;
  acreditados: Acreditado[];
}

const MEDIOS = [
  "Bío Bío",
  "Cooperativa",
  "ADN",
  "Agricultura",
  "Radiales sin caseta",
  "Medios Televisivos Nacionales",
  "Sitios Web",
  "Medios Escritos",
  "Agencias",
  "Otro",
];

const CARGOS = [
  "Periodista",
  "Relator",
  "Camarógrafo",
  "Técnico",
  "Productor",
  "Editor",
];

const TIPOS_CREDENCIAL = [
  "ANFP",
  "Reportero gráfico cancha",
  "Camarógrafo",
];

export default function PrensaAcreditacionPage() {
  const [formData, setFormData] = useState<FormData>({
    responsable_nombre: "",
    responsable_apellido: "",
    responsable_rut: "",
    responsable_email: "",
    responsable_telefono: "",
    medio: "",
    acreditados: [
      {
        nombre: "",
        apellido: "",
        rut: "",
        email: "",
        cargo: "",
        tipo_credencial: "",
        numero_credencial: "",
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/");
  };

  const handleResponsableChange = (
    field: keyof Omit<FormData, "acreditados" | "medio">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMedioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      medio: value,
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

  const addAcreditado = () => {
    setFormData((prev) => ({
      ...prev,
      acreditados: [
        ...prev.acreditados,
        {
          nombre: "",
          apellido: "",
          rut: "",
          email: "",
          cargo: "",
          tipo_credencial: "",
          numero_credencial: "",
        },
      ],
    }));
  };

  const removeAcreditado = (index: number) => {
    if (formData.acreditados.length > 1) {
      setFormData((prev) => ({
        ...prev,
        acreditados: prev.acreditados.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.responsable_nombre || !formData.responsable_email) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor completa los datos del responsable",
      });
      return;
    }

    if (!formData.medio) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor selecciona un medio",
      });
      return;
    }

    if (formData.acreditados.some((a) => !a.nombre || !a.apellido || !a.rut)) {
      setSubmissionStatus({
        type: "error",
        message: "Por favor completa todos los datos de los acreditados",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/acreditaciones/prensa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la solicitud");
      }

      setSubmissionStatus({
        type: "success",
        message: "Solicitud enviada correctamente",
      });

      // Limpiar formulario
      setFormData({
        responsable_nombre: "",
        responsable_apellido: "",
        responsable_rut: "",
        responsable_email: "",
        responsable_telefono: "",
        medio: "",
        acreditados: [
          {
            nombre: "",
            apellido: "",
            rut: "",
            email: "",
            cargo: "",
            tipo_credencial: "",
            numero_credencial: "",
          },
        ],
      });

      setTimeout(() => {
        setSubmissionStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      setSubmissionStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Error al procesar la solicitud",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1e5799] to-[#7db9e8] overflow-x-hidden max-w-full">
      {isNavigating && <LoadingSpinner message="Cargando..." />}

      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#FFFFFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/2 transform translate-x-1/2 w-96 h-96 bg-[#2989d8] rounded-full blur-3xl"></div>
      </div>

      <IconoFlotanteAdmin />
      <BotonFlotante />

      <main className="min-h-screen w-full max-w-full flex flex-col items-center px-4 py-8 relative overflow-hidden box-border">
        <Link
          href="/"
          onClick={handleBack}
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
        </Link>

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
            <div>
              <h2 className="text-xl font-bold text-[#1e5799] mb-4 flex items-center gap-2">
                <span className="bg-[#1e5799] text-white px-3 py-1 rounded-full text-sm">
                  1
                </span>
                Responsable del Medio
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.responsable_nombre}
                  onChange={(e) =>
                    handleResponsableChange("responsable_nombre", e.target.value)
                  }
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={formData.responsable_apellido}
                  onChange={(e) =>
                    handleResponsableChange("responsable_apellido", e.target.value)
                  }
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="RUT (ej: 12345678-9)"
                  value={formData.responsable_rut}
                  onChange={(e) =>
                    handleResponsableChange("responsable_rut", e.target.value)
                  }
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Correo"
                  value={formData.responsable_email}
                  onChange={(e) =>
                    handleResponsableChange("responsable_email", e.target.value)
                  }
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.responsable_telefono}
                  onChange={(e) =>
                    handleResponsableChange("responsable_telefono", e.target.value)
                  }
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                />

                <select
                  value={formData.medio}
                  onChange={(e) => handleMedioChange(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                  required
                >
                  <option value="">Selecciona un medio</option>
                  {MEDIOS.map((medio) => (
                    <option key={medio} value={medio}>
                      {medio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sección Acreditados */}
            <div>
              <h2 className="text-xl font-bold text-[#1e5799] mb-4 flex items-center gap-2">
                <span className="bg-[#1e5799] text-white px-3 py-1 rounded-full text-sm">
                  2
                </span>
                Acreditados ({formData.acreditados.length})
              </h2>

              <div className="space-y-6">
                {formData.acreditados.map((acreditado, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Acreditado {index + 1}
                      </h3>
                      {formData.acreditados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAcreditado(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={acreditado.nombre}
                        onChange={(e) =>
                          handleAcreditadoChange(index, "nombre", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Apellido"
                        value={acreditado.apellido}
                        onChange={(e) =>
                          handleAcreditadoChange(index, "apellido", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="RUT (sin puntos, con guion: 12345678-9)"
                        value={acreditado.rut}
                        onChange={(e) =>
                          handleAcreditadoChange(index, "rut", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <input
                        type="email"
                        placeholder="Email"
                        value={acreditado.email}
                        onChange={(e) =>
                          handleAcreditadoChange(index, "email", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      />

                      <select
                        value={acreditado.cargo}
                        onChange={(e) =>
                          handleAcreditadoChange(index, "cargo", e.target.value)
                        }
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

                      <select
                        value={acreditado.tipo_credencial}
                        onChange={(e) =>
                          handleAcreditadoChange(
                            index,
                            "tipo_credencial",
                            e.target.value
                          )
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                        required
                      >
                        <option value="">Tipo de credencial</option>
                        {TIPOS_CREDENCIAL.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Número de credencial"
                        value={acreditado.numero_credencial}
                        onChange={(e) =>
                          handleAcreditadoChange(
                            index,
                            "numero_credencial",
                            e.target.value
                          )
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1e5799] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAcreditado}
                className="mt-4 px-4 py-2 bg-[#2989d8] text-white rounded-lg hover:bg-[#1e5799] transition-colors text-sm font-medium"
              >
                + Agregar acreditado
              </button>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white font-semibold rounded-xl hover:from-[#207cca] hover:to-[#7db9e8] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </div>

        <footer className="py-6 text-center mt-8">
          <p className="text-sm text-white/60">
            Sistema de acreditación oficial • Registro rápido y seguro
          </p>
        </footer>
      </main>
    </div>
  );
}
