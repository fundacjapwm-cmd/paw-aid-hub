import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CheckoutEmptyCart } from './CheckoutEmptyCart';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutEmptyCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CheckoutEmptyCart />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render empty cart title', () => {
      renderComponent();
      
      expect(screen.getByText('Twój koszyk jest pusty')).toBeInTheDocument();
    });

    it('should render description text', () => {
      renderComponent();
      
      expect(screen.getByText('Dodaj produkty do koszyka, aby pomóc zwierzętom')).toBeInTheDocument();
    });

    it('should render shopping cart icon', () => {
      renderComponent();
      
      const icon = document.querySelector('.lucide-shopping-cart');
      expect(icon).toBeInTheDocument();
    });

    it('should render browse animals button', () => {
      renderComponent();
      
      expect(screen.getByRole('button', { name: 'Przeglądaj zwierzęta' })).toBeInTheDocument();
    });

    it('should render footer', () => {
      renderComponent();
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to home page when button is clicked', () => {
      renderComponent();
      
      const button = screen.getByRole('button', { name: 'Przeglądaj zwierzęta' });
      fireEvent.click(button);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Styling', () => {
    it('should center the card content', () => {
      renderComponent();
      
      const card = screen.getByText('Twój koszyk jest pusty').closest('.text-center');
      expect(card).toBeInTheDocument();
    });
  });
});
