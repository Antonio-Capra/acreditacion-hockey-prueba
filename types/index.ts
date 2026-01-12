// Tipos compartidos de la aplicación

export type TipoArea = "Producción" | "Voluntarios" | "Auspiciadores" | "Proveedores" | "Fan Fest" | "Prensa";

export type Zona = `Zona ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | null;

export type StatusAcreditacion = "pendiente" | "aprobado" | "rechazado";

export interface DatosBasicos {
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  empresa: string;
}

export interface Acreditacion extends DatosBasicos {
  id: number;
  area: TipoArea;
  status: StatusAcreditacion;
  created_at: string;
  zona: Zona;
}

export interface ModalState {
  isOpen: boolean;
  type: "success" | "error" | "info" | "warning" | "confirm";
  title: string;
  message: string;
}
