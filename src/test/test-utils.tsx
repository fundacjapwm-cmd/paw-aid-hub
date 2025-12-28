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

// Mock for logged-in user
export const loggedInMockAuthValue = {
  user: { id: 'test-user', email: 'test@example.com' },
  session: { access_token: 'test-token', refresh_token: 'test-refresh' },
  profile: { 
    id: 'test-user', 
    display_name: 'Test User', 
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
  profile: { 
    ...loggedInMockAuthValue.profile, 
    role: 'ADMIN' as const 
  },
  isAdmin: true,
  isUser: false,
};

// Mock for org user
export const orgMockAuthValue = {
  ...loggedInMockAuthValue,
  profile: { 
    ...loggedInMockAuthValue.profile, 
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
 * // With specific route
 * renderWithProviders(<MyComponent />, { initialEntries: ['/zwierzeta'] });
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    authValue = defaultMockAuthValue,
    cartValue = defaultMockCartValue,
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders 
      authValue={authValue} 
      cartValue={cartValue}
      initialEntries={initialEntries}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
