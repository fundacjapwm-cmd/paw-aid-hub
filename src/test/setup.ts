import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// ============================================================================
// JSDOM POLYFILLS FOR RADIX UI / SHADCN / CMDK COMPONENTS
// ============================================================================

// 1. Mock ResizeObserver (required by cmdk/Radix) - MUST use stubGlobal
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// 2. Mock scrollIntoView (not available in jsdom)
window.HTMLElement.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// 3. Mock Pointer Capture API (required by Radix Select/Popover)
window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// 4. Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// 5. Mock getComputedStyle for animations
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element) => {
  const style = originalGetComputedStyle(elt);
  return {
    ...style,
    getPropertyValue: (prop: string) => {
      if (prop === 'animation-duration' || prop === 'transition-duration') {
        return '0s';
      }
      return style.getPropertyValue(prop);
    },
  } as CSSStyleDeclaration;
};

// 6. Mock matchMedia (required for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 7. Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 8. Mock requestAnimationFrame
window.requestAnimationFrame = (cb) => setTimeout(cb, 1000 / 60) as unknown as number;
window.cancelAnimationFrame = (id) => clearTimeout(id);

// ============================================================================
// COMPONENT MOCKS
// ============================================================================

// Mock Tooltip components (avoid TooltipProvider requirement in tests)
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  TooltipContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'tooltip-content' }, children),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// ============================================================================
// DEFAULT SUPABASE MOCK
// ============================================================================

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// ============================================================================
// TOAST MOCKS
// ============================================================================

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
  Toaster: () => null,
}));
