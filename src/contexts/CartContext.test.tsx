import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, CartItem } from './CartContext';
import React, { ReactNode } from 'react';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: null, profile: null, signOut: vi.fn() }),
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
beforeEach(() => {
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockLocalStorage[key] || null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    mockLocalStorage[key] = value;
  });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
    delete mockLocalStorage[key];
  });
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  describe('addToCart', () => {
    it('should add a new item to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 1, true);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].productId).toBe('prod-1');
      expect(result.current.cart[0].quantity).toBe(1);
    });

    it('should increase quantity when adding existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 2, true);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(3);
    });

    it('should add same product for different animals as separate items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-2',
          animalName: 'Animal 2',
        }, 1, true);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].animalId).toBe('animal-1');
      expect(result.current.cart[1].animalId).toBe('animal-2');
    });

    it('should respect maxQuantity limit', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          maxQuantity: 5,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 3, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          maxQuantity: 5,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 5, true);
      });

      // Should not exceed maxQuantity
      expect(result.current.cart[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart by productId and animalId', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 1, true);
      });

      expect(result.current.cart).toHaveLength(1);

      act(() => {
        result.current.removeFromCart('prod-1', 'animal-1');
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should only remove item for specific animal', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-2',
          animalName: 'Animal 2',
        }, 1, true);
      });

      act(() => {
        result.current.removeFromCart('prod-1', 'animal-1');
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].animalId).toBe('animal-2');
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for specific item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 1, true);
      });

      act(() => {
        result.current.updateQuantity('prod-1', 5, 'animal-1');
      });

      expect(result.current.cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 2, true);
      });

      act(() => {
        result.current.updateQuantity('prod-1', 0, 'animal-1');
      });

      expect(result.current.cart).toHaveLength(0);
    });

    it('should respect maxQuantity when updating', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Test Product',
          price: 10.00,
          maxQuantity: 3,
          animalId: 'animal-1',
          animalName: 'Test Animal',
        }, 1, true);
      });

      act(() => {
        result.current.updateQuantity('prod-1', 10, 'animal-1');
      });

      expect(result.current.cart[0].quantity).toBe(3);
    });
  });

  describe('removeAllForAnimal', () => {
    it('should remove all items for specific animal', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Product 1',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-2',
          productName: 'Product 2',
          price: 20.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-3',
          productName: 'Product 3',
          price: 15.00,
          animalId: 'animal-2',
          animalName: 'Animal 2',
        }, 1, true);
      });

      act(() => {
        result.current.removeAllForAnimal('animal-1', 'Animal 1');
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].animalId).toBe('animal-2');
    });
  });

  describe('addAllForAnimal', () => {
    it('should add multiple items at once', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const items = [
        { productId: 'prod-1', productName: 'Product 1', price: 10.00, maxQuantity: 2, animalId: 'animal-1', animalName: 'Test Animal' },
        { productId: 'prod-2', productName: 'Product 2', price: 20.00, maxQuantity: 3, animalId: 'animal-1', animalName: 'Test Animal' },
      ];

      act(() => {
        result.current.addAllForAnimal(items, 'Test Animal');
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].quantity).toBe(2); // maxQuantity
      expect(result.current.cart[1].quantity).toBe(3); // maxQuantity
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Product 1',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 1, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-2',
          productName: 'Product 2',
          price: 20.00,
          animalId: 'animal-2',
          animalName: 'Animal 2',
        }, 1, true);
      });

      expect(result.current.cart).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('cartTotal and cartCount', () => {
    it('should calculate correct total and count', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          productId: 'prod-1',
          productName: 'Product 1',
          price: 10.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 2, true);
      });

      act(() => {
        result.current.addToCart({
          productId: 'prod-2',
          productName: 'Product 2',
          price: 25.00,
          animalId: 'animal-1',
          animalName: 'Animal 1',
        }, 3, true);
      });

      // Total: (10 * 2) + (25 * 3) = 20 + 75 = 95
      expect(result.current.cartTotal).toBe(95);
      // Count: 2 + 3 = 5
      expect(result.current.cartCount).toBe(5);
    });
  });

  describe('isAnimalFullyAdded and markAnimalAsAdded', () => {
    it('should track added animals', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isAnimalFullyAdded('animal-1')).toBe(false);

      act(() => {
        result.current.markAnimalAsAdded('animal-1');
      });

      expect(result.current.isAnimalFullyAdded('animal-1')).toBe(true);
      expect(result.current.isAnimalFullyAdded('animal-2')).toBe(false);
    });
  });
});
