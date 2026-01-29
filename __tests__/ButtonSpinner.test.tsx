import { render } from '@testing-library/react';
import ButtonSpinner from '../components/common/ButtonSpinner';

describe('ButtonSpinner', () => {
  it('should render with default props', () => {
    const { container } = render(<ButtonSpinner />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin', 'text-white');
    expect(svg).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('should render with custom size', () => {
    const { container } = render(<ButtonSpinner size={24} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('should render with custom color', () => {
    const { container } = render(<ButtonSpinner colorClass="text-blue-500" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin', 'text-blue-500');
  });

  it('should render with custom className', () => {
    const { container } = render(<ButtonSpinner className="custom-class" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin', 'text-white', 'custom-class');
  });

  it('should have correct SVG structure', () => {
    const { container } = render(<ButtonSpinner />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');

    const circles = svg?.querySelectorAll('circle');
    expect(circles).toHaveLength(1);

    const paths = svg?.querySelectorAll('path');
    expect(paths).toHaveLength(1);
  });
});