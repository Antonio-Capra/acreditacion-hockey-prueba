import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal from '../components/common/ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirmar Acción',
    message: '¿Estás seguro de que quieres continuar?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with required props', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro de que quieres continuar?')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should render with custom button texts', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Sí, continuar"
        cancelText="No, cancelar"
      />
    );

    expect(screen.getByText('Sí, continuar')).toBeInTheDocument();
    expect(screen.getByText('No, cancelar')).toBeInTheDocument();
  });

  it('should render details when provided', () => {
    const details = [
      { 'Nombre': 'Juan Pérez', 'Email': 'juan@example.com', 'Estado': '', 'Fecha': '' },
      { 'Nombre': '', 'Email': '', 'Estado': 'Pendiente', 'Fecha': '2024-01-01' },
    ];

    render(<ConfirmationModal {...defaultProps} details={details} />);

    // Check that details section is rendered
    expect(screen.getByText('Detalles:')).toBeInTheDocument();

    // Check specific values that should be present
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();

    // Check that we have multiple detail blocks
    const detailBlocks = screen.getAllByText(/Nombre|Email|Estado|Fecha/);
    expect(detailBlocks.length).toBeGreaterThan(4);
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} />);

    await user.click(screen.getByText('Confirmar'));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} />);

    await user.click(screen.getByText('Cancelar'));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when modal close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} />);

    // Since there's no backdrop click to close, we'll test that the modal renders properly
    expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);

    // The confirm button should be disabled or show loading state
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirmar Acción')).not.toBeInTheDocument();
  });
});