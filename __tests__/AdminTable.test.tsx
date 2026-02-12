import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTable from '../components/admin-dashboard/AdminTable';
import { Acreditacion, AdminProvider, AREA_NAMES, ESTADO_COLORS } from '../components/admin-dashboard/AdminContext';

// Mock de Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null,
        })),
      })),
      delete: jest.fn(() => ({
        in: jest.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}));

// Mock de fetch para emails
global.fetch = jest.fn();

// Mock Admin Context
const mockAdminContext = {
  acreditaciones: [],
  filteredAcreditaciones: [],
  zonas: [],
  AREA_NAMES,
  ESTADO_COLORS,
  searchTerm: '',
  setSearchTerm: jest.fn(),
  estadoFilter: '',
  setEstadoFilter: jest.fn(),
  message: null,
  setMessage: jest.fn(),
  selectedAcreditacion: null,
  setSelectedAcreditacion: jest.fn(),
  isModalOpen: false,
  setIsModalOpen: jest.fn(),
  isProcessing: false,
  setIsProcessing: jest.fn(),
  confirmDeleteModal: { isOpen: false, message: '', onConfirm: null },
  setConfirmDeleteModal: jest.fn(),
  fetchAcreditaciones: jest.fn(),
  openDetail: jest.fn(),
  handleAsignZona: jest.fn(),
  assignZonaDirect: jest.fn(),
  updateEstado: jest.fn(),
  updateEstadoDirect: jest.fn(),
  sendApprovalEmail: jest.fn(),
  sendRejectionEmail: jest.fn(),
};

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AdminProvider value={mockAdminContext}>{children}</AdminProvider>
);

describe('AdminTable Bulk Actions', () => {
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
      status: 'pendiente',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      nombre: 'María',
      primer_apellido: 'López',
      segundo_apellido: '',
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

  const mockProps = {
    filteredAcreditaciones: mockAcreditaciones,
    AREA_NAMES: { prensa: 'Prensa' },
    ESTADO_COLORS: { pendiente: 'bg-yellow-100' },
    onOpenDetail: jest.fn(),
    onConfirmEmail: jest.fn(),
    onEmailError: jest.fn(),
    selectedIds: [],
    onSelectionChange: jest.fn(),
    onSelectAll: jest.fn(),
    onBulkAction: jest.fn(),
    onConfirmDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('should show bulk actions bar when items are selected', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[1]} />
      </TestWrapper>
    );

    expect(screen.getByText('1 elemento seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Aprobar Seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Rechazar Seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Enviar Email')).toBeInTheDocument();
    expect(screen.getByText('Eliminar Seleccionados')).toBeInTheDocument();
  });

  it('should not show bulk actions bar when no items are selected', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[]} />
      </TestWrapper>
    );

    expect(screen.queryByText('Aprobar Seleccionados')).not.toBeInTheDocument();
  });

  it('should show correct count for multiple selected items', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[1, 2]} />
      </TestWrapper>
    );

    expect(screen.getByText('2 elementos seleccionados')).toBeInTheDocument();
  });

  it('should call onBulkAction with approve when approve button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[1]} />
      </TestWrapper>
    );

    await user.click(screen.getByText('Aprobar Seleccionados'));

    expect(mockProps.onBulkAction).toHaveBeenCalledWith('approve', [1]);
  });

  it('should call onBulkAction with reject when reject button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[1]} />
      </TestWrapper>
    );

    await user.click(screen.getByText('Rechazar Seleccionados'));

    expect(mockProps.onBulkAction).toHaveBeenCalledWith('reject', [1]);
  });

  it('should call onConfirmDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AdminTable {...mockProps} selectedIds={[1]} />
      </TestWrapper>
    );

    await user.click(screen.getByText('Eliminar Seleccionados'));

    expect(mockProps.onConfirmDelete).toHaveBeenCalledWith(
      '¿Estás seguro de que quieres eliminar 1 acreditación seleccionada? Esta acción no se puede deshacer.',
      expect.any(Function)
    );
  });

  it('should show select all checkbox', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} />
      </TestWrapper>
    );

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /seleccionar todos/i });
    expect(selectAllCheckbox).toBeInTheDocument();
  });

  it('should call onSelectAll when select all checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AdminTable {...mockProps} />
      </TestWrapper>
    );

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /seleccionar todos/i });
    await user.click(selectAllCheckbox);

    expect(mockProps.onSelectAll).toHaveBeenCalledWith(true);
  });

  it('should show table headers correctly', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Selec Todos')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('RUT')).toBeInTheDocument();
    expect(screen.getByText('Empresa')).toBeInTheDocument();
    expect(screen.getByText('Área')).toBeInTheDocument();
    expect(screen.getByText('Cargo')).toBeInTheDocument();
    expect(screen.getByText('Credencial')).toBeInTheDocument();
    expect(screen.getByText('Zona')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getAllByText('Ver Detalles')).toHaveLength(3); // header + 2 buttons
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('should render correct number of rows', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} />
      </TestWrapper>
    );

    // Should render 2 rows plus header
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // header + 2 data rows
  });

  it('shows compact filters in header when parent passes props', () => {
    render(
      <TestWrapper>
        <AdminTable {...mockProps} searchTerm="" setSearchTerm={jest.fn()} estadoFilter="" setEstadoFilter={jest.fn()} onRefresh={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('filtro-buscar')).toBeInTheDocument();
    expect(screen.getByLabelText('filtro-estado')).toBeInTheDocument();
    expect(screen.getByLabelText('actualizar-filtros')).toBeInTheDocument();
  });

  it('font size controls adjust table font-size', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AdminTable {...mockProps} searchTerm="" setSearchTerm={jest.fn()} estadoFilter="" setEstadoFilter={jest.fn()} onRefresh={jest.fn()} />
      </TestWrapper>
    );

    const wrapper = screen.getByTestId('table-scale-wrapper');
    const increase = screen.getAllByLabelText('aumentar-tamano')[0];
    const decrease = screen.getAllByLabelText('disminuir-tamano')[0];

    // initial scale should be 1 (100%)
    expect(wrapper).toHaveStyle({ transform: 'scale(1)' });

    await user.click(increase);
    expect(wrapper).toHaveStyle({ transform: 'scale(1.1)' });

    await user.click(decrease);
    expect(wrapper).toHaveStyle({ transform: 'scale(1)' });
  });
});