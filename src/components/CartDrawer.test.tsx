import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

const mockNavigate = vi.fn();
const mockRemoveFromCart = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockClearCart = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCartItems = [
  {
    productId: 'prod-1',
    productName: 'Karma dla psa',
    price: 49.99,
    quantity: 2,
    maxQuantity: 5,
    animalId: 'animal-1',
    animalName: 'Burek',
  },
  {
    productId: 'prod-2',
    productName: 'Zabawka',
    price: 19.99,
    quantity: 1,
    animalId: 'animal-1',
    animalName: 'Burek',
  },
];

let mockCart = [...mockCartItems];
let mockCartTotal = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
let mockCartCount = mockCart.reduce((sum, item) => sum + item.quantity, 0);

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    cart: mockCart,
    cartTotal: mockCartTotal,
    cartCount: mockCartCount,
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
  }),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartDrawer from './CartDrawer';

const renderCartDrawer = () => {
  return render(
    <BrowserRouter>
      <CartDrawer />
    </BrowserRouter>
  );
};

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCart = [...mockCartItems];
    mockCartTotal = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    mockCartCount = mockCart.reduce((sum, item) => sum + item.quantity, 0);
  });

  describe('Rendering', () => {
    it('should render cart icon button', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      expect(cartButton).toBeInTheDocument();
    });

    it('should show cart count badge when items in cart', () => {
      renderCartDrawer();
      expect(screen.getByText('3')).toBeInTheDocument(); // 2 + 1
    });

    it('should open drawer on click', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText('Koszyk')).toBeInTheDocument();
    });

    it('should display cart items when drawer is open', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText('Karma dla psa')).toBeInTheDocument();
      expect(screen.getByText('Zabawka')).toBeInTheDocument();
    });

    it('should group items by animal name', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText('Burek')).toBeInTheDocument();
    });

    it('should display cart total', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText(/119\.97/)).toBeInTheDocument();
    });

    it('should display item prices', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText('49.99 zł')).toBeInTheDocument();
      expect(screen.getByText('19.99 zł')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should have checkout button', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByRole('button', { name: /Przejdź do płatności/i })).toBeInTheDocument();
    });

    it('should have clear cart button', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByRole('button', { name: /Wyczyść koszyk/i })).toBeInTheDocument();
    });

    it('should call clearCart when clear button clicked', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      const clearButton = screen.getByRole('button', { name: /Wyczyść koszyk/i });
      fireEvent.click(clearButton);
      
      expect(mockClearCart).toHaveBeenCalled();
    });

    it('should display quantity controls', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // quantity of first item
      expect(screen.getByText('1')).toBeInTheDocument(); // quantity of second item
    });
  });

  describe('Empty cart', () => {
    beforeEach(() => {
      mockCart = [];
      mockCartTotal = 0;
      mockCartCount = 0;
    });

    it('should show empty cart message', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText(/Twój koszyk jest pusty/i)).toBeInTheDocument();
    });

    it('should show helpful empty state text', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      fireEvent.click(cartButton);
      
      expect(screen.getByText(/Dodaj produkty do koszyka/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible cart button', () => {
      renderCartDrawer();
      const cartButton = screen.getByRole('button');
      expect(cartButton).toBeEnabled();
    });
  });
});
