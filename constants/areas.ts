// Constantes de áreas
export const AREAS = [
  "Producción",
  "Voluntarios",
  "Auspiciadores",
  "Proveedores",
  "Fan Fest",
  "Prensa",
] as const;

// Mapa: valor guardado -> texto que se muestra en el select
export const ZONA_LABEL: Record<string, string> = {
  "Zona 1": "Zona 1.Venue",
  "Zona 2": "Zona 2.FOP",
  "Zona 3": "Zona 3.LOC",
  "Zona 4": "Zona 4.VIP",
  "Zona 5": "Zona 5.Broadcast",
  "Zona 6": "Zona 6.Officials",
  "Zona 7": "Zona 7.Media",
  "Zona 8": "Zona 8.Volunteers",
  "Zona 9": "Todas las zonas",
};

// Definir el tipo Zona
export type Zona = keyof typeof ZONA_LABEL;

// Lista de valores internos (lo que se guarda en la BD)
export const ZONAS: Zona[] = Object.keys(ZONA_LABEL) as Zona[];
