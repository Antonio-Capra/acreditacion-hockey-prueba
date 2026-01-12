'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';

interface AcreditacionMasivaProps {
  onSuccess?: () => void;
}

const AcreditacionMasiva: React.FC<AcreditacionMasivaProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ insertados: number; totalLineas: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/bulk-accreditation/template');
      if (!response.ok) throw new Error('Error al descargar template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_acreditacion.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar template:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/bulk-accreditation', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({ insertados: data.insertados, totalLineas: data.totalLineas });
        setShowSuccessModal(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(false);
        setTimeout(() => {
          setShowForm(false);
          setShowSuccessModal(false);
          onSuccess?.();
        }, 5000);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e8b543] to-[#d7834f] text-white font-semibold rounded-xl hover:from-[#d7834f] hover:via-[#b5301f] hover:to-[#b5301f] transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Acreditación masiva</span>
      </button>
    );
  }

  // Modal de éxito
  if (showSuccessModal) {
    return (
      <Modal
        isOpen={showSuccessModal}
        type="success"
        title="¡Éxito!"
        message="El archivo se ha subido correctamente"
        autoClose={5000}
        onClose={() => {
          setShowForm(false);
          setShowSuccessModal(false);
          onSuccess?.();
        }}
      >
        <div className="w-full space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Acreditaciones insertadas</p>
            <p className="text-2xl font-bold text-green-600">{successData?.insertados}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total de líneas procesadas</p>
            <p className="text-2xl font-bold text-blue-600">{successData?.totalLineas}</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div className="animate-slide-down bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-8 shadow-2xl max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Acreditación masiva</h3>
          <button
            onClick={() => {
              setShowForm(false);
              setFile(null);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sección de descarga de template */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in-up transition-all">
          <p className="text-sm text-gray-700 mb-3">
            Descarga el template CSV, rellénalo con tus datos y luego sube el archivo aquí.
          </p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar template</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#a10d79] hover:bg-purple-50/30 transition-all duration-300">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <svg className={`w-8 h-8 transition-all duration-300 ${file ? 'text-[#a10d79] scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Selecciona un archivo CSV o Excel'}
              </span>
              <span className="text-xs text-gray-500">o arrastra el archivo aquí</span>
            </label>
          </div>

          {isLoading && (
            <div className="animate-fade-in-up flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-[#a10d79] rounded-full animate-spin-custom mb-3"></div>
              <p className="text-sm font-medium text-gray-700">Procesando archivo...</p>
              <p className="text-xs text-gray-500 mt-1">Por favor espera</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#a10d79] to-[#7518ef] text-white font-semibold rounded-lg hover:from-[#7518ef] hover:to-[#a10d79] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom"></div>
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Subir archivo</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Campos requeridos: nombre, apellido, correo, area. Campos opcionales: rut, empresa.
        </p>
      </div>
    );
};

export default AcreditacionMasiva;
