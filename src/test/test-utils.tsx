/**
 * Test utilities with pre-configured providers
 * 
 * This file provides a renderWithProviders function that wraps components
 * in all necessary context providers for testing, eliminating "Context Hell".
 */
import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Default mock values for AuthContext
export const defaultMockAuthValue = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  isAdmin: false,
  isOrg: false,
  isUser: false,
};

// Mutable auth value for tests that need to change auth state
let currentMockAuthValue = { ...defaultMockAuthValue };

// Function to set mock auth value (for tests that need to change auth state per-test)
export const setMockAuthValue = (value: typeof defaultMockAuthValue) => {
  currentMockAuthValue = value;
};

// Function to get current mock auth value
export const getMockAuthValue = () => currentMockAuthValue;

// Reset to default
export const resetMockAuthValue = () => {
  currentMockAuthValue = { ...defaultMockAuthValue };
};

// Mock for logged-in user
export const loggedInMockAuthValue = {
  user: { id: 'test-user', email: 'test@example.com' },
  session: { access_token: 'test-token', refresh_token: 'test-refresh' },
  profile: { 
    id: 'test-user', 
    display_name: 'User Test', 
    role: 'USER' as const, 
    avatar_url: null,
    must_change_password: false,
    created_at: null,
    updated_at: null,
  },
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  isAdmin: false,
  isOrg: false,
  isUser: true,
};

// Mock for admin user
export const adminMockAuthValue = {
  ...loggedInMockAuthValue,
  user: { id: 'admin-user', email: 'admin@example.com' },
  profile: { 
    ...loggedInMockAuthValue.profile,
    id: 'admin-user',
    display_name: 'Admin User', 
    role: 'ADMIN' as const 
  },
  isAdmin: true,
  isUser: false,
};

// Mock for org user
export const orgMockAuthValue = {
  ...loggedInMockAuthValue,
  user: { id: 'org-user', email: 'org@example.com' },
  profile: { 
    ...loggedInMockAuthValue.profile,
    id: 'org-user',
    display_name: 'Org User', 
    role: 'ORG' as const 
  },
  isOrg: true,
  isUser: false,
};

// Default mock values for CartContext
export const defaultMockCartValue = {
  cart: [],
  cartTotal: 0,
  cartCount: 0,
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  removeAllForAnimal: vi.fn(),
  removeAllForOrganization: vi.fn(),
  clearCart: vi.fn(),
  updateQuantity: vi.fn(),
  addAllForAnimal: vi.fn(),
  completePurchase: vi.fn().mockResolvedValue({ success: true }),
  isAnimalFullyAdded: () => false,
  markAnimalAsAdded: vi.fn(),
  isLoading: false,
};

// Context for overriding auth in tests
export const MockAuthContext = React.createContext(defaultMockAuthValue);
export const MockCartContext = React.createContext(defaultMockCartValue);

interface MockAuthProviderProps {
  children: ReactNode;
  value?: typeof defaultMockAuthValue;
}

interface MockCartProviderProps {
  children: ReactNode;
  value?: typeof defaultMockCartValue;
}

// Mock Auth Provider Component
export const MockAuthProvider = ({ 
  children, 
  value = defaultMockAuthValue 
}: MockAuthProviderProps) => {
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Mock Cart Provider Component
export const MockCartProvider = ({ 
  children, 
  value = defaultMockCartValue 
}: MockCartProviderProps) => {
  return (
    <MockCartContext.Provider value={value}>
      {children}
    </MockCartContext.Provider>
  );
};

interface AllTheProvidersProps {
  children: ReactNode;
  authValue?: typeof defaultMockAuthValue;
  cartValue?: typeof defaultMockCartValue;
  initialEntries?: string[];
}

// Combined provider wrapper
const AllTheProviders = ({ 
  children, 
  authValue = defaultMockAuthValue,
  cartValue = defaultMockCartValue,
  initialEntries = ['/'],
}: AllTheProvidersProps) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <MockAuthProvider value={authValue}>
        <MockCartProvider value={cartValue}>
          {children}
        </MockCartProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: typeof defaultMockAuthValue;
  cartValue?: typeof defaultMockCartValue;
  initialEntries?: string[];
  route?: string; // Shorthand for single route
}

/**
 * Custom render function that wraps component in all necessary providers
 * 
 * @example
 * // Basic usage
 * renderWithProviders(<MyComponent />);
 * 
 * // With logged-in user
 * renderWithProviders(<MyComponent />, { authValue: loggedInMockAuthValue });
 * 
 * // With custom cart
 * renderWithProviders(<MyComponent />, { 
 *   cartValue: { ...defaultMockCartValue, cartCount: 5 } 
 * });
 * 
 * // With specific route (shorthand)
 * renderWithProviders(<MyComponent />, { route: '/zwierzeta' });
 * 
 * // With specific routes (array)
 * renderWithProviders(<MyComponent />, { initialEntries: ['/zwierzeta', '/'] });
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    authValue,
    cartValue = defaultMockCartValue,
    initialEntries,
    route,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Use route shorthand if provided, otherwise use initialEntries or default to ['/']
  const entries = route ? [route] : (initialEntries ?? ['/']);
  // Use current mock auth value if not explicitly provided
  const authVal = authValue ?? getMockAuthValue();
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders 
      authValue={authVal} 
      cartValue={cartValue}
      initialEntries={entries}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
