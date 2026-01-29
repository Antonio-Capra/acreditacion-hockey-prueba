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
}: AdminTableProps) {
  const [confirmActionModal, setConfirmActionModal] = useState<{ isOpen: boolean; type: "aprobado" | "rechazado" | null; message: string; onConfirm: () => void }>({ isOpen: false, type: null, message: "", onConfirm: () => {} });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: "", onConfirm: () => {} });

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
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mt-16">
      {/* Header de la Tabla */}
      <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center justify-between">
          <span>Lista de Acreditaciones</span>
          <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
            {filteredAcreditaciones.length} resultado{filteredAcreditaciones.length !== 1 ? 's' : ''}
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
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
    </>
  );
}