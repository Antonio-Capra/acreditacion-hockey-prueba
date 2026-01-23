"use client";

import { createContext, useContext, ReactNode } from "react";

export interface Acreditacion {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
  area: string;
  empresa: string;
  zona_id?: number;
  status: "pendiente" | "aprobado" | "rechazado";
  motivo_rechazo?: string;
  responsable_nombre?: string;
  responsable_primer_apellido?: string;
  responsable_segundo_apellido?: string;
  responsable_rut?: string;
  responsable_email?: string;
  responsable_telefono?: string;
  created_at: string;
}

export interface Zona {
  id: number;
  nombre: string;
}

export interface Acreditado {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

export interface User {
  id: string;
  email?: string;
  role?: string;
}

// Mapeo de códigos de área a nombres
export const AREA_NAMES: Record<string, string> = {
  "A": "Radiales con caseta",
  "B": "Radiales sin caseta",
  "C": "TV Nacionales",
  "D": "Sitios Web",
  "E": "Medios Escritos",
  "F": "Agencias",
  "G": "Reportero gráfico cancha",
};

export const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  aprobado: "bg-green-100 text-green-800 border-green-300",
  rechazado: "bg-red-100 text-red-800 border-red-300",
};

interface AdminContextType {
  acreditaciones: Acreditacion[];
  filteredAcreditaciones: Acreditacion[];
  zonas: Zona[];
  AREA_NAMES: typeof AREA_NAMES;
  ESTADO_COLORS: typeof ESTADO_COLORS;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  estadoFilter: string;
  setEstadoFilter: (filter: string) => void;
  message: { type: "success" | "error"; text: string } | null;
  setMessage: (message: { type: "success" | "error"; text: string } | null) => void;
  selectedAcreditacion: Acreditacion | null;
  setSelectedAcreditacion: (acred: Acreditacion | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  confirmDeleteModal: boolean;
  setConfirmDeleteModal: (open: boolean) => void;
  fetchAcreditaciones: () => void;
  openDetail: (acred: Acreditacion) => void;
  handleAsignZona: (zonaId: number) => void;
  assignZonaDirect: (acred: Acreditacion, zonaId: number | null) => void;
  updateEstado: (newEstado: "pendiente" | "aprobado" | "rechazado") => void;
  updateEstadoDirect: (acred: Acreditacion, newEstado: "pendiente" | "aprobado" | "rechazado") => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children, value }: { children: ReactNode; value: AdminContextType }) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}