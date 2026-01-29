import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Procesando..." />);

    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  it('should have spinner animation', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should be fixed positioned', () => {
    render(<LoadingSpinner />);

    const container = document.querySelector('.fixed');
    expect(container).toBeInTheDocument();
  });
});