'use client';

import React from 'react';

export type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm' | 'loading';

interface ModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  buttons?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  onClose?: () => void;
  autoClose?: number; // ms para cerrar automáticamente
}

const getStyles = (type: ModalType) => {
  const styles = {
    success: {
      iconBg: 'from-green-400 to-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      buttonBg: 'from-green-500 to-green-600',
      buttonHover: 'hover:from-green-600 hover:to-green-700',
    },
    error: {
      iconBg: 'from-red-400 to-red-600',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      buttonBg: 'from-red-500 to-red-600',
      buttonHover: 'hover:from-red-600 hover:to-red-700',
    },
    info: {
      iconBg: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      buttonBg: 'from-blue-500 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-700',
    },
    warning: {
      iconBg: 'from-yellow-400 to-yellow-600',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      buttonBg: 'from-yellow-500 to-yellow-600',
      buttonHover: 'hover:from-yellow-600 hover:to-yellow-700',
    },
    confirm: {
      iconBg: 'from-[#1e5799] to-[#2989d8]',
      borderColor: 'border-[#1e5799]/20',
      bgColor: 'bg-[#eff6ff]',
      textColor: 'text-[#1e5799]',
      buttonBg: 'from-[#1e5799] to-[#2989d8]',
      buttonHover: 'hover:from-[#2989d8] hover:to-[#3c9de5]',
    },
    loading: {
      iconBg: 'from-blue-400 to-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      buttonBg: 'from-blue-500 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-700',
    },
  };
  return styles[type];
};

const getDefaultIcon = (type: ModalType) => {
  const icons = {
    success: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
      </svg>
    ),
    info: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    warning: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    confirm: (
      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
      </svg>
    ),
    loading: (
      <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
  };
  return icons[type];
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  type,
  title,
  message,
  icon,
  children,
  buttons,
  onClose,
  autoClose,
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  const styles = getStyles(type);
  const defaultIcon = icon || getDefaultIcon(type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
      <div className="animate-slide-down bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-4">
        <div className="flex flex-col items-center text-center">
          {/* Icono animado */}
          <div className={`w-20 h-20 bg-gradient-to-br ${styles.iconBg} rounded-full flex items-center justify-center mb-6 ${type !== 'loading' ? 'animate-pulse' : ''}`}>
            {defaultIcon}
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>

          {/* Mensaje */}
          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>

          {/* Contenido personalizado */}
          {children && <div className="w-full mb-6">{children}</div>}

          {/* Botones */}
          <div className="w-full space-y-3">
            {buttons && buttons.length > 0 ? (
              buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  disabled={type === 'loading'}
                  className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    button.variant === 'secondary'
                      ? 'bg-gray-300 hover:bg-gray-400 disabled:hover:bg-gray-300'
                      : button.variant === 'danger'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:hover:from-red-500 disabled:hover:to-red-600'
                      : `bg-gradient-to-r ${styles.buttonBg} ${styles.buttonHover} disabled:hover:${styles.buttonBg}`
                  }`}
                >
                  {button.label}
                </button>
              ))
            ) : (
              <button
                onClick={onClose}
                disabled={type === 'loading'}
                className={`w-full px-6 py-3 bg-gradient-to-r ${styles.buttonBg} ${styles.buttonHover} text-white font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
