import { Acreditacion } from '../components/admin-dashboard';

// Mock data for testing
const mockAcreditaciones: Acreditacion[] = [
  {
    id: 1,
    nombre: 'Juan',
    primer_apellido: 'Pérez',
    segundo_apellido: 'González',
    rut: '12345678-9',
    email: 'juan@example.com',
    cargo: 'Periodista',
    tipo_credencial: 'Prensa',
    numero_credencial: '001',
    area: 'prensa',
    empresa: 'El Mercurio',
    zona_id: 1,
    status: 'aprobado',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    nombre: 'María',
    primer_apellido: 'López',
    segundo_apellido: 'Álvarez',
    rut: '87654321-K',
    email: 'maria@example.com',
    cargo: 'Fotógrafa',
    tipo_credencial: 'Prensa',
    numero_credencial: '002',
    area: 'prensa',
    empresa: 'La Tercera',
    zona_id: 2,
    status: 'pendiente',
    created_at: '2024-01-02T00:00:00Z',
  },
];

const mockZonas = [
  { id: 1, nombre: 'Zona A' },
  { id: 2, nombre: 'Zona B' },
];

const AREA_NAMES: Record<string, string> = {
  prensa: 'Prensa',
  television: 'Televisión',
};

// Función para normalizar texto (copiada del componente)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

describe('Admin Filtering Logic', () => {
  describe('normalizeText', () => {
    it('should normalize text to lowercase and remove accents', () => {
      expect(normalizeText('Álvarez')).toBe('alvarez');
      expect(normalizeText('Pérez')).toBe('perez');
      expect(normalizeText('MIXED')).toBe('mixed');
      expect(normalizeText('')).toBe('');
    });
  });

  describe('search filtering', () => {
    const filterAcreditaciones = (acreditaciones: Acreditacion[], searchTerm: string, zonas: typeof mockZonas) => {
      if (!searchTerm) return acreditaciones;

      const normalizedSearchTerm = normalizeText(searchTerm);

      return acreditaciones.filter(a => {
        const fullName = normalizeText(`${a.nombre} ${a.primer_apellido} ${a.segundo_apellido || ""}`);
        const areaName = normalizeText(AREA_NAMES[a.area] || a.area);
        const zonaName = normalizeText(zonas.find(z => z.id === a.zona_id)?.nombre || "Sin asignar");

        return (
          fullName.includes(normalizedSearchTerm) ||
          normalizeText(a.email).includes(normalizedSearchTerm) ||
          a.rut.includes(searchTerm) ||
          normalizeText(a.empresa).includes(normalizedSearchTerm) ||
          areaName.includes(normalizedSearchTerm) ||
          normalizeText(a.cargo).includes(normalizedSearchTerm) ||
          normalizeText(a.tipo_credencial).includes(normalizedSearchTerm) ||
          (a.numero_credencial && normalizeText(a.numero_credencial).includes(normalizedSearchTerm)) ||
          zonaName.includes(normalizedSearchTerm)
        );
      });
    };

    it('should filter by name', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'Juan', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Juan');
    });

    it('should filter by name with accents', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'alvarez', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('María');
    });

    it('should filter by email', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'juan@example', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('juan@example.com');
    });

    it('should filter by RUT', () => {
      const result = filterAcreditaciones(mockAcreditaciones, '12345678-9', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].rut).toBe('12345678-9');
    });

    it('should filter by empresa', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'mercurio', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].empresa).toBe('El Mercurio');
    });

    it('should filter by cargo', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'periodista', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].cargo).toBe('Periodista');
    });

    it('should filter by zona', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'zona a', mockZonas);
      expect(result).toHaveLength(1);
      expect(result[0].zona_id).toBe(1);
    });

    it('should return all when search term is empty', () => {
      const result = filterAcreditaciones(mockAcreditaciones, '', mockZonas);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const result = filterAcreditaciones(mockAcreditaciones, 'nonexistent', mockZonas);
      expect(result).toHaveLength(0);
    });
  });

  describe('status filtering', () => {
    it('should filter by status', () => {
      const filtered = mockAcreditaciones.filter(a => a.status === 'aprobado');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('aprobado');

      const pending = mockAcreditaciones.filter(a => a.status === 'pendiente');
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pendiente');
    });
  });
});