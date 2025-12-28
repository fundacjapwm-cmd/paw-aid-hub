import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrgOnboarding } from './useOrgOnboarding';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const createMockOrg = (overrides = {}) => ({
  id: 'org-123',
  name: 'Test Org',
  description: null,
  city: null,
  address: null,
  ...overrides,
});

describe('useOrgOnboarding', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should be inactive when organization is null', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: null,
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.currentStep).toBe('complete');
    });

    it('should start with profile step when profile is incomplete', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg(),
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(true);
      expect(result.current.currentStep).toBe('profile');
    });

    it('should start with animal step when profile is complete but no animals', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test description',
            city: 'Warszawa',
            address: 'ul. Testowa 1',
          }),
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(true);
      expect(result.current.currentStep).toBe('animal');
    });

    it('should start with wishlist step when profile and animals exist but no wishlist', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test description',
            city: 'Warszawa',
            address: 'ul. Testowa 1',
          }),
          animalsCount: 1,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(true);
      expect(result.current.currentStep).toBe('wishlist');
    });

    it('should be complete when all steps are done', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test description',
            city: 'Warszawa',
            address: 'ul. Testowa 1',
          }),
          animalsCount: 1,
          hasWishlistItems: true,
        })
      );

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.currentStep).toBe('complete');
    });
  });

  describe('Dismissed State', () => {
    it('should be complete when previously dismissed', () => {
      localStorageMock.setItem('org_onboarding_dismissed_org-123', 'true');

      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg(), // Incomplete profile
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.currentStep).toBe('complete');
    });
  });

  describe('advanceStep', () => {
    it('should advance from profile to animal step', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg(),
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.currentStep).toBe('profile');

      act(() => {
        result.current.advanceStep();
      });

      expect(result.current.currentStep).toBe('animal');
      expect(result.current.isOnboardingActive).toBe(true);
    });

    it('should advance from animal to wishlist step with animal name', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test',
            city: 'Warszawa',
            address: 'ul. Test 1',
          }),
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.currentStep).toBe('animal');

      act(() => {
        result.current.advanceStep('Burek');
      });

      expect(result.current.currentStep).toBe('wishlist');
      expect(result.current.targetAnimalName).toBe('Burek');
    });

    it('should complete onboarding from wishlist step', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test',
            city: 'Warszawa',
            address: 'ul. Test 1',
          }),
          animalsCount: 1,
          hasWishlistItems: false,
        })
      );

      expect(result.current.currentStep).toBe('wishlist');

      act(() => {
        result.current.advanceStep();
      });

      expect(result.current.currentStep).toBe('complete');
      expect(result.current.isOnboardingActive).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'org_onboarding_dismissed_org-123',
        'true'
      );
    });
  });

  describe('dismissOnboarding', () => {
    it('should dismiss onboarding and save to localStorage', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg(),
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      expect(result.current.isOnboardingActive).toBe(true);

      act(() => {
        result.current.dismissOnboarding();
      });

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.currentStep).toBe('complete');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'org_onboarding_dismissed_org-123',
        'true'
      );
    });

    it('should handle dismiss when organization is null', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: null,
          animalsCount: 0,
          hasWishlistItems: false,
        })
      );

      act(() => {
        result.current.dismissOnboarding();
      });

      // Should not throw and should remain inactive
      expect(result.current.isOnboardingActive).toBe(false);
    });
  });

  describe('Profile Completeness Check', () => {
    it('should consider profile incomplete without description', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: null,
            city: 'Warszawa',
            address: 'ul. Test 1',
          }),
          animalsCount: 1,
          hasWishlistItems: true,
        })
      );

      expect(result.current.currentStep).toBe('profile');
    });

    it('should consider profile incomplete without city', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test',
            city: null,
            address: 'ul. Test 1',
          }),
          animalsCount: 1,
          hasWishlistItems: true,
        })
      );

      expect(result.current.currentStep).toBe('profile');
    });

    it('should consider profile incomplete without address', () => {
      const { result } = renderHook(() =>
        useOrgOnboarding({
          organization: createMockOrg({
            description: 'Test',
            city: 'Warszawa',
            address: null,
          }),
          animalsCount: 1,
          hasWishlistItems: true,
        })
      );

      expect(result.current.currentStep).toBe('profile');
    });
  });
});
