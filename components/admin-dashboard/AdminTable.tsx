"use client";

import { useState } from "react";
import AdminRow from "./AdminRow";
import { Acreditacion } from "./AdminContext";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface AdminTableProps {
  filteredAcreditaciones: Acreditacion[];
  AREA_NAMES: Record<string, string>;
  ESTADO_COLORS: Record<string, string>;
  onOpenDetail: (acred: Acreditacion) => void;
  onConfirmEmail: (acred: Acreditacion, onConfirm: () => void) => void;
  onEmailError: (message: string) => void;
  selectedIds: number[];
  onSelectionChange: (id: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: "approve" | "reject" | "sendEmail" | "delete", ids: number[]) => void;
  onConfirmDelete: (message: string, onConfirm: () => void) => void;
  // Opcionales: permitir renderizar filtros compactos en la cabecera
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  estadoFilter?: string;
  setEstadoFilter?: (filter: string) => void;
  onRefresh?: () => void;
}

export default function AdminTable({
  filteredAcreditaciones,
  AREA_NAMES,
  ESTADO_COLORS,
  onOpenDetail,
  onConfirmEmail,
  onEmailError,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onBulkAction,
  onConfirmDelete,
  // opcionales
  searchTerm,
  setSearchTerm,
  estadoFilter,
  setEstadoFilter,
  onRefresh,
}: AdminTableProps) {
  const [confirmActionModal, setConfirmActionModal] = useState<{ isOpen: boolean; type: "aprobado" | "rechazado" | null; message: string; onConfirm: () => void }>({ isOpen: false, type: null, message: "", onConfirm: () => {} });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: "", onConfirm: () => {} });

  // Control de tamaño de fuente de la tabla
  const [fontScale, setFontScale] = useState<number>(100);

  const openConfirmModal = (type: "aprobado" | "rechazado", message: string, onConfirm: () => void) => {
    setConfirmActionModal({ isOpen: true, type, message, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmActionModal({ isOpen: false, type: null, message: "", onConfirm: () => {} });
  };

  const openConfirmDeleteModal = (message: string, onConfirm: () => void) => {
    onConfirmDelete(message, onConfirm);
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteModal({ isOpen: false, message: "", onConfirm: () => {} });
  };
  return (
    <div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mt-16">
      {/* Header de la Tabla */}
      <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Lista de Acreditaciones</h2>
            {/* Filtros compactos en la cabecera (si el parent pasa las props) */}
            {setSearchTerm && setEstadoFilter && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  aria-label="filtro-buscar"
                  placeholder="Buscar (nombre, email, RUT...)"
                  value={searchTerm || ''}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <select
                  aria-label="filtro-estado"
                  value={estadoFilter || ''}
                  onChange={(e) => setEstadoFilter?.(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option className="text-black" value="">Todos</option>
                  <option className="text-black" value="pendiente">Pendiente</option>
                  <option className="text-black" value="aprobado">Aprobado</option>
                  <option className="text-black" value="rechazado">Rechazado</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRefresh?.()}
                    className="px-4 py-2 rounded-lg bg-white text-[#1e5799] font-semibold hover:opacity-90"
                    aria-label="actualizar-filtros"
                  >
                    Actualizar
                  </button>
                  <div className="flex items-center ml-auto bg-white/10 px-2 py-1 rounded-md text-white">
                    <button
                      onClick={() => setFontScale(s => Math.max(80, s - 10))}
                      aria-label="disminuir-tamano"
                      className="px-2 py-1 hover:bg-white/10 rounded-md"
                      title="Disminuir tamaño de letra"
                    >
                      −
                    </button>
                    <span className="px-2 text-sm text-white font-semibold" aria-hidden>{fontScale}%</span>
                    <button
                      onClick={() => setFontScale(s => Math.min(140, s + 10))}
                      aria-label="aumentar-tamano"
                      className="px-2 py-1 hover:bg-white/10 rounded-md"
                      title="Aumentar tamaño de letra"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Contador */}
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
              {filteredAcreditaciones.length} resultado{filteredAcreditaciones.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>


      </div>

      <div className="overflow-x-auto">
        {/* wrapper que aplica el escalado visual para que even los elementos con `text-sm/text-xs` se vean afectados */}
        <div
          data-testid="table-scale-wrapper"
          style={{
            transform: `scale(${fontScale / 100})`,
            transformOrigin: '0 0',
            width: `${100 / (fontScale / 100)}%`,
          }}
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div className="flex-col items-center justify-center">
                   <span className="flex justify-center text-xs font-bold text-gray-700 uppercase tracking-wider">Selec Todos</span>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredAcreditaciones.length && filteredAcreditaciones.length > 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#1e5799] border-gray-300 rounded focus:ring-[#1e5799] focus:ring-2"
                    title="Seleccionar todos"
                  />
                 
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RUT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Área</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credencial</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Zona</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Ver Detalles</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          {selectedIds.length > 0 && (
            <thead className="bg-blue-50 border-b border-gray-200">
              <tr>
                <td colSpan={11} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedIds.length} elemento{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onBulkAction('approve', selectedIds)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        Aprobar Seleccionados
                      </button>
                      <button
                        onClick={() => onBulkAction('reject', selectedIds)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        Rechazar Seleccionados
                      </button>
                      <button
                        onClick={() => onBulkAction('sendEmail', selectedIds)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        Enviar Email
                      </button>
                      <button
                        onClick={() => openConfirmDeleteModal(
                          `¿Estás seguro de que quieres eliminar ${selectedIds.length} acreditación${selectedIds.length !== 1 ? 'es' : ''} seleccionada${selectedIds.length !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`,
                          () => onBulkAction('delete', selectedIds)
                        )}
                        className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        Eliminar Seleccionados
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200">
            {filteredAcreditaciones.map((acred, idx) => (
              <AdminRow
                key={acred.id}
                acreditacion={acred}
                index={idx}
                AREA_NAMES={AREA_NAMES}
                ESTADO_COLORS={ESTADO_COLORS}
                onOpenDetail={onOpenDetail}
                onConfirmAction={openConfirmModal}
                onConfirmEmail={onConfirmEmail}
                onEmailError={onEmailError}
                isSelected={selectedIds.includes(acred.id)}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredAcreditaciones.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No hay acreditaciones que coincidan con los filtros
        </div>
      )}
      </div>
      <ConfirmationModal
        isOpen={confirmActionModal.isOpen}
        title={confirmActionModal.type === "aprobado" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
        message={confirmActionModal.message}
        onConfirm={() => {
          confirmActionModal.onConfirm();
          closeConfirmModal();
        }}
        onCancel={closeConfirmModal}
      />
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        title="Confirmar Eliminación Masiva"
        message={confirmDeleteModal.message}
        onConfirm={() => {
          confirmDeleteModal.onConfirm();
          closeConfirmDeleteModal();
        }}
        onCancel={closeConfirmDeleteModal}
      />
    </div>
  </div>
  );
}