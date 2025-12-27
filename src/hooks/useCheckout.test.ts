import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCheckout } from './useCheckout';

// Mock CartContext
const mockCart = [
  { productId: 'prod-1', animalId: 'animal-1', quantity: 2, price: 50, name: 'Karma', animalName: 'Burek' },
];
const mockClearCart = vi.fn();

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    cart: mockCart,
    cartTotal: 100,
    clearCart: mockClearCart,
  }),
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'order-1' }, error: null })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { redirectUri: 'https://payu.com/pay' }, error: null })),
    },
  },
}));

describe('useCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCheckout());
      
      expect(result.current.customerName).toBe('');
      expect(result.current.customerEmail).toBe('');
      expect(result.current.password).toBe('');
      expect(result.current.acceptTerms).toBe(false);
      expect(result.current.acceptPrivacy).toBe(false);
      expect(result.current.acceptDataProcessing).toBe(false);
      expect(result.current.newsletter).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.cartMinimized).toBe(false);
    });

    it('should expose cart data', () => {
      const { result } = renderHook(() => useCheckout());
      
      expect(result.current.cart).toEqual(mockCart);
      expect(result.current.cartTotal).toBe(100);
    });

    it('should calculate allConsentsChecked correctly when all are false', () => {
      const { result } = renderHook(() => useCheckout());
      
      expect(result.current.allConsentsChecked).toBe(false);
    });
  });

  describe('State setters', () => {
    it('should update customerName', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setCustomerName('Jan Kowalski');
      });
      
      expect(result.current.customerName).toBe('Jan Kowalski');
    });

    it('should update customerEmail', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setCustomerEmail('jan@example.com');
      });
      
      expect(result.current.customerEmail).toBe('jan@example.com');
    });

    it('should update password', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setPassword('secret123');
      });
      
      expect(result.current.password).toBe('secret123');
    });

    it('should update acceptTerms', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setAcceptTerms(true);
      });
      
      expect(result.current.acceptTerms).toBe(true);
    });

    it('should update acceptPrivacy', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setAcceptPrivacy(true);
      });
      
      expect(result.current.acceptPrivacy).toBe(true);
    });

    it('should update acceptDataProcessing', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setAcceptDataProcessing(true);
      });
      
      expect(result.current.acceptDataProcessing).toBe(true);
    });

    it('should update newsletter', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setNewsletter(true);
      });
      
      expect(result.current.newsletter).toBe(true);
    });

    it('should update cartMinimized', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setCartMinimized(true);
      });
      
      expect(result.current.cartMinimized).toBe(true);
    });
  });

  describe('handleSelectAll', () => {
    it('should set all consents to true when checked', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.handleSelectAll(true);
      });
      
      expect(result.current.acceptTerms).toBe(true);
      expect(result.current.acceptPrivacy).toBe(true);
      expect(result.current.acceptDataProcessing).toBe(true);
      expect(result.current.newsletter).toBe(true);
    });

    it('should set all consents to false when unchecked', () => {
      const { result } = renderHook(() => useCheckout());
      
      // First set all to true
      act(() => {
        result.current.handleSelectAll(true);
      });
      
      // Then uncheck
      act(() => {
        result.current.handleSelectAll(false);
      });
      
      expect(result.current.acceptTerms).toBe(false);
      expect(result.current.acceptPrivacy).toBe(false);
      expect(result.current.acceptDataProcessing).toBe(false);
      expect(result.current.newsletter).toBe(false);
    });

    it('should update allConsentsChecked to true when all are selected', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.handleSelectAll(true);
      });
      
      expect(result.current.allConsentsChecked).toBe(true);
    });
  });

  describe('allConsentsChecked calculation', () => {
    it('should be false when any consent is missing', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setAcceptTerms(true);
        result.current.setAcceptPrivacy(true);
        result.current.setAcceptDataProcessing(true);
        // newsletter is still false
      });
      
      expect(result.current.allConsentsChecked).toBe(false);
    });

    it('should be true only when all 4 consents are true', () => {
      const { result } = renderHook(() => useCheckout());
      
      act(() => {
        result.current.setAcceptTerms(true);
        result.current.setAcceptPrivacy(true);
        result.current.setAcceptDataProcessing(true);
        result.current.setNewsletter(true);
      });
      
      expect(result.current.allConsentsChecked).toBe(true);
    });
  });

  describe('Function availability', () => {
    it('should expose handleCheckout function', () => {
      const { result } = renderHook(() => useCheckout());
      
      expect(typeof result.current.handleCheckout).toBe('function');
    });

    it('should expose handleTestCheckout function', () => {
      const { result } = renderHook(() => useCheckout());
      
      expect(typeof result.current.handleTestCheckout).toBe('function');
    });
  });
});
