import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with complex children', () => {
      render(
        <Button>
          <span>Icon</span> Click me
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size class', () => {
      render(<Button size="small">Small Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--small');
    });

    it('applies medium size class by default', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--medium');
    });

    it('applies large size class', () => {
      render(<Button size="large">Large Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--large');
    });
  });

  describe('Color Variants', () => {
    it('applies primary color class by default', () => {
      render(<Button>Primary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--primary');
    });

    it('applies secondary color class', () => {
      render(<Button color="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button--secondary');
    });
  });

  describe('Type Attribute', () => {
    it('defaults to button type', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('applies submit type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies reset type', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('CSS Classes', () => {
    it('applies base ui-button class', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('combines all classes correctly', () => {
      render(
        <Button 
          size="large" 
          color="secondary" 
          className="custom-class extra-class"
        >
          Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'ui-button',
        'ui-button--large',
        'ui-button--secondary',
        'custom-class',
        'extra-class'
      );
    });

    it('handles empty className gracefully', () => {
      render(<Button className="">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui-button', 'ui-button--medium', 'ui-button--primary');
      expect(button.className).not.toContain('  '); // No double spaces
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when not provided', async () => {
      const user = userEvent.setup();
      
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      
      // Should not throw error
      await user.click(button);
      expect(button).toBeInTheDocument();
    });

    it('handles multiple clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('handles keyboard navigation', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('is focusable by default', () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has correct role', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports aria-label through children', () => {
      render(<Button>Save Document</Button>);
      expect(screen.getByRole('button', { name: 'Save Document' })).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('submits form when type is submit', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('resets form when type is reset', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      const button = screen.getByRole('button');
      
      // Change input value
      fireEvent.change(input, { target: { value: 'changed' } });
      expect(input.value).toBe('changed');
      
      // Reset form
      fireEvent.click(button);
      expect(input.value).toBe('test');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onClick gracefully', () => {
      render(<Button onClick={undefined}>Button</Button>);
      const button = screen.getByRole('button');
      
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('handles null children', () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('handles boolean children', () => {
      render(<Button>{false}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('handles number children', () => {
      render(<Button>{42}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('42');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      const initialClassName = button.className;
      
      // Re-render with same props
      rerender(<Button>Button</Button>);
      expect(button.className).toBe(initialClassName);
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<Button>Default Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with all props', () => {
      const { container } = render(
        <Button
          size="large"
          color="secondary"
          type="submit"
          className="custom-class"
          onClick={() => {}}
        >
          Full Props Button
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
