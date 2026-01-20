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
