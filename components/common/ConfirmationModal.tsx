'use client';

import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: { [key: string]: string | number }[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  details,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      type="confirm"
      title={title}
      message={message}
      buttons={[
        {
          label: cancelText,
          onClick: onCancel,
          variant: "secondary",
        },
        {
          label: confirmText,
          onClick: onConfirm,
          variant: "primary",
        },
      ]}
      onClose={onCancel}
    >
      {details && details.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-800 text-sm">Detalles:</h4>
          {details.map((detail, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg border">
              {Object.entries(detail).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">{key}:</span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Procesando...</span>
        </div>
      )}
    </Modal>
  );
}