// Tipos compartidos de la aplicación

// ============================================
// ENUMS Y TIPOS BÁSICOS
// ============================================

export type StatusAcreditacion = "pendiente" | "aprobado" | "rechazado";

export type Cargo = 
  | "Periodista" 
  | "Reportero Gráfico Cancha"
  | "Camarógrafo"
  | "Relator"
  | "Comentarista"
  | "Técnico"
  | "Periodista Pupitre"
  | "Reportero Gráfico Tribuna";

export type TipoCredencial =
  | "Credencial Claro Arena"
  | "Credencial Cruzados"
  | "Cancha"
  | "Zona Deportiva"
  | "Prensa"
  | "Staff"
  | "VIP"
  | "Activación (exterior)";

export type ZonaAcreditacion =
  | "Claro Arena"
  | "Cruzados"
  | "Cancha"
  | "Zona Deportiva"
  | "Prensa"
  | "Staff"
  | "VIP"
  | "Activación (exterior)";

// ============================================
// EVENTO
// ============================================

export interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_cierre: string;
  created_at: string;
}

// ============================================
// CATEGORÍA DE MEDIOS
// ============================================

export interface CategoriaMedio {
  id: number;
  nombre: string;
  cupo_default: number;
  descripcion?: string;
  created_at: string;
}

// ============================================
// MEDIO
// ============================================

export interface Medio {
  id: number;
  evento_id: number;
  categoria_id: number;
  nombre: string;
  cupo_asignado: number;
  created_at: string;
  // Relaciones
  categoria?: CategoriaMedio;
}

// ============================================
// RESPONSABLE DEL MEDIO
// ============================================

export interface ResponsableMedio {
  id: number;
  evento_id: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  telefono?: string;
  medio_id?: number;
  created_at: string;
  // Relaciones
  medio?: Medio;
}

// ============================================
// ACREDITADO (PERSONA INDIVIDUAL)
// ============================================

export interface Acreditado {
  id: number;
  evento_id: number;
  responsable_id: number;
  medio_id: number;
  nombre: string;
  apellido: string;
  rut: string;
  cargo: Cargo;
  tipo_credencial: TipoCredencial;
  numero_credencial?: string;
  status: StatusAcreditacion;
  zona?: ZonaAcreditacion;
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  motivo_rechazo?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  responsable?: ResponsableMedio;
  medio?: Medio;
}

// ============================================
// ZONA DE ACREDITACIÓN
// ============================================

export interface ZonaDisponible {
  id: number;
  evento_id: number;
  nombre: string;
  capacidad?: number;
  created_at: string;
}

// ============================================
// FORMULARIOS (DTOs)
// ============================================

export interface FormularioAcreditacion {
  responsable: {
    nombre: string;
    apellido: string;
    rut: string;
    correo: string;
    telefono?: string;
  };
  acreditados: FormularioAcreditado[];
  evento_id: number;
  medio_id: number;
  aceptaTerminos: boolean;
}

export interface FormularioAcreditado {
  nombre: string;
  apellido: string;
  rut: string;
  cargo: Cargo;
  tipo_credencial: TipoCredencial;
  numero_credencial?: string;
}

// ============================================
// RESPUESTAS DE VALIDACIÓN
// ============================================

export interface ValidacionCupos {
  valido: boolean;
  disponibles: number;
  solicitados: number;
  mensaje: string;
}

export interface RespuestaAcreditacion {
  exitoso: boolean;
  mensaje: string;
  acreditados_creados?: number;
  responsable_id?: number;
}

// ============================================
// MODAL
// ============================================

export interface ModalState {
  isOpen: boolean;
  type: "success" | "error" | "info" | "warning" | "confirm";
  title: string;
  message: string;
}
