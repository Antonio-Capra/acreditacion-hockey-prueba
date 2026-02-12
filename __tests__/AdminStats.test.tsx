import { render, screen } from '@testing-library/react';
import AdminStats from '../components/admin-dashboard/AdminStats';

const zonas = [
  { id: 1, nombre: 'Cancha' },
  { id: 2, nombre: 'Prensa' },
  { id: 3, nombre: 'Staff' },
];

const mockAcreditaciones = [
  // Cancha (20)
  ...Array.from({ length: 20 }).map((_, i) => ({ id: 100 + i, status: 'aprobado', zona_id: 1 })),
  // Prensa (40)
  ...Array.from({ length: 40 }).map((_, i) => ({ id: 200 + i, status: 'aprobado', zona_id: 2 })),
  // Staff (10)
  ...Array.from({ length: 10 }).map((_, i) => ({ id: 300 + i, status: 'aprobado', zona_id: 3 })),
  // Rechazadas (5)
  ...Array.from({ length: 5 }).map((_, i) => ({ id: 400 + i, status: 'rechazado', zona_id: 2 })),
  // Pendientes (3)
  ...Array.from({ length: 3 }).map((_, i) => ({ id: 500 + i, status: 'pendiente' })),
];

describe('AdminStats', () => {
  it('muestra totales y desglose por zona para aprobadas', () => {
    render(<AdminStats acreditaciones={mockAcreditaciones as any} zonas={zonas} />);

    // Totales
    expect(screen.getByText('Total Acreditaciones')).toBeInTheDocument();
    expect(screen.getByText(String(mockAcreditaciones.length))).toBeInTheDocument();

    // Pendientes
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Aprobadas y desglose
    expect(screen.getByText('Aprobadas')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();

    // Desglose por zona (chips)
    expect(screen.getByText('Cancha 20')).toBeInTheDocument();
    expect(screen.getByText('Prensa 40')).toBeInTheDocument();
    expect(screen.getByText('Staff 10')).toBeInTheDocument();

    // Rechazadas
    expect(screen.getByText('Rechazadas')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});