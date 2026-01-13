import { useState } from "react";

type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm' | 'loading';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

export function useModalManager() {
  // Estado del modal de confirmación
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(async () => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estado del modal de resultado
  const [resultModal, setResultModal] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'error'>('success');
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  // Abrir modal de confirmación
  const openConfirm = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmModal(true);
  };

  // Cerrar modal de confirmación
  const closeConfirm = () => {
    setConfirmModal(false);
  };

  // Ejecutar acción confirmada
  const executeConfirmAction = async () => {
    setIsLoading(true);
    try {
      await confirmAction();
    } finally {
      setIsLoading(false);
      setConfirmModal(false);
    }
  };

  // Abrir modal de resultado
  const openResult = (type: 'success' | 'error', title: string, message: string) => {
    setResultType(type);
    setResultTitle(title);
    setResultMessage(message);
    setResultModal(true);
  };

  // Cerrar modal de resultado
  const closeResult = () => {
    setResultModal(false);
  };

  // Determinar tipo de modal (para estilos)
  const getConfirmModalType = (): ModalType => {
    if (isLoading) return "loading";
    if (confirmTitle.includes("Confirmar aprobación")) return "confirm";
    return "warning";
  };

  // Determinar botones del modal (si es zona no seleccionada, solo mostrar cancelar)
  const getConfirmModalButtons = (): Array<{ label: string; onClick: () => void; variant?: ButtonVariant }> | undefined => {
    if (isLoading) return undefined;

    if (confirmTitle.includes("Zona no seleccionada")) {
      return [
        {
          label: "Cancelar",
          onClick: closeConfirm,
          variant: "secondary",
        },
      ];
    }

    const isDanger = confirmTitle.includes("Eliminar");
    return [
      {
        label: confirmTitle.includes("Confirmar aprobación") ? "Confirmar" : confirmTitle.includes("eliminación") ? "Eliminar" : "Modificar Zona",
        onClick: executeConfirmAction,
        variant: isDanger ? "danger" : "primary",
      },
      {
        label: "Cancelar",
        onClick: closeConfirm,
        variant: "secondary",
      },
    ];
  };

  // Mensaje del modal de confirmación
  const getConfirmModalMessage = () => {
    if (isLoading) {
      if (confirmTitle.includes("Confirmar aprobación")) {
        return "Aprobando acreditación y enviando correo...";
      }
      return "Eliminando registro...";
    }
    return confirmMessage;
  };

  // Título del modal de confirmación
  const getConfirmModalTitle = () => {
    return isLoading ? "Procesando..." : confirmTitle;
  };

  return {
    // Estados
    confirmModal,
    resultModal,
    isLoading,
    resultType,

    // Estados de confirmación
    confirmTitle: getConfirmModalTitle(),
    confirmMessage: getConfirmModalMessage(),
    confirmModalType: getConfirmModalType(),
    confirmModalButtons: getConfirmModalButtons(),

    // Estados de resultado
    resultTitle,
    resultMessage,

    // Funciones
    openConfirm,
    closeConfirm,
    executeConfirmAction,
    openResult,
    closeResult,
  };
}
