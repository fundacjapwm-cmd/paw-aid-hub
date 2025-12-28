import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';

describe('CheckoutOrderSummary', () => {
  const mockCart = [
    { productId: 'prod-1', productName: 'Karma dla psa', price: 50.00, quantity: 2, animalName: 'Burek' },
    { productId: 'prod-2', productName: 'Zabawka', price: 25.00, quantity: 1 },
  ];

  const defaultProps = {
    cart: mockCart,
    cartTotal: 125.00,
    cartMinimized: false,
    onToggleMinimize: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<CheckoutOrderSummary {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('should render card title and description', () => {
      renderComponent();
      
      expect(screen.getByText('Podsumowanie zamówienia')).toBeInTheDocument();
      expect(screen.getByText('Sprawdź wybrane produkty')).toBeInTheDocument();
    });

    it('should render all cart items when not minimized', () => {
      renderComponent();
      
      expect(screen.getByText('Karma dla psa')).toBeInTheDocument();
      expect(screen.getByText('Zabawka')).toBeInTheDocument();
    });

    it('should display product quantities', () => {
      renderComponent();
      
      expect(screen.getByText('Ilość: 2')).toBeInTheDocument();
      expect(screen.getByText('Ilość: 1')).toBeInTheDocument();
    });

    it('should display animal name when provided', () => {
      renderComponent();
      
      expect(screen.getByText('dla Burek')).toBeInTheDocument();
    });

    it('should not display animal name when not provided', () => {
      const cartWithoutAnimal = [
        { productId: 'prod-1', productName: 'Produkt testowy', price: 30.00, quantity: 1 },
      ];
      renderComponent({ cart: cartWithoutAnimal });
      
      expect(screen.queryByText(/dla /i)).not.toBeInTheDocument();
    });

    it('should display cart total', () => {
      renderComponent({ cartTotal: 250.50 });
      
      expect(screen.getByText('250.50 zł')).toBeInTheDocument();
    });

    it('should display "Suma całkowita" label', () => {
      renderComponent();
      
      expect(screen.getByText('Suma całkowita:')).toBeInTheDocument();
    });
  });

  describe('Price calculations', () => {
    it('should display correct item total (price * quantity)', () => {
      renderComponent();
      
      // 50.00 * 2 = 100.00
      expect(screen.getByText('100.00 zł')).toBeInTheDocument();
      // 25.00 * 1 = 25.00
      expect(screen.getByText('25.00 zł')).toBeInTheDocument();
    });

    it('should format prices with 2 decimal places', () => {
      const cartWithDecimal = [
        { productId: 'prod-1', productName: 'Produkt', price: 19.99, quantity: 3 },
      ];
      renderComponent({ cart: cartWithDecimal, cartTotal: 59.97 });
      
      expect(screen.getByText('59.97 zł')).toBeInTheDocument();
    });
  });

  describe('Minimize/Expand behavior', () => {
    it('should show "Zwiń" button when not minimized', () => {
      renderComponent({ cartMinimized: false });
      
      expect(screen.getByRole('button', { name: 'Zwiń' })).toBeInTheDocument();
    });

    it('should show "Rozwiń" button when minimized', () => {
      renderComponent({ cartMinimized: true });
      
      expect(screen.getByRole('button', { name: 'Rozwiń' })).toBeInTheDocument();
    });

    it('should call onToggleMinimize when header is clicked', () => {
      const onToggleMinimize = vi.fn();
      renderComponent({ onToggleMinimize });
      
      const header = screen.getByText('Podsumowanie zamówienia').closest('[class*="cursor-pointer"]');
      fireEvent.click(header!);
      
      expect(onToggleMinimize).toHaveBeenCalled();
    });

    it('should hide cart items when minimized', () => {
      renderComponent({ cartMinimized: true });
      
      expect(screen.queryByText('Karma dla psa')).not.toBeInTheDocument();
      expect(screen.queryByText('Zabawka')).not.toBeInTheDocument();
    });

    it('should still show total when minimized', () => {
      renderComponent({ cartMinimized: true, cartTotal: 125.00 });
      
      expect(screen.getByText('125.00 zł')).toBeInTheDocument();
      expect(screen.getByText('Suma całkowita:')).toBeInTheDocument();
    });

    it('should show cart items when expanded', () => {
      renderComponent({ cartMinimized: false });
      
      expect(screen.getByText('Karma dla psa')).toBeInTheDocument();
      expect(screen.getByText('Zabawka')).toBeInTheDocument();
    });
  });

  describe('Empty cart', () => {
    it('should render without errors when cart is empty', () => {
      renderComponent({ cart: [], cartTotal: 0 });
      
      expect(screen.getByText('Podsumowanie zamówienia')).toBeInTheDocument();
      expect(screen.getByText('0.00 zł')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable header for toggle', () => {
      renderComponent();
      
      const header = screen.getByText('Podsumowanie zamówienia').closest('[class*="cursor-pointer"]');
      expect(header).toBeInTheDocument();
    });

    it('should have button type on toggle button', () => {
      renderComponent();
      
      const button = screen.getByRole('button', { name: 'Zwiń' });
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
