import { useState } from "react";
import type { ModalState } from "@/types";

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const openModal = (
    type: ModalState["type"],
    title: string,
    message: string
  ) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  return { modalState, openModal, closeModal };
};
