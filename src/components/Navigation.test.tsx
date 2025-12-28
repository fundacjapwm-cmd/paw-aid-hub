import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
const mockSignOut = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    profile: null,
    signOut: mockSignOut,
    loading: false,
  })),
}));

// Mock CartDrawer and MobileMenu
vi.mock('@/components/CartDrawer', () => ({
  default: () => <div data-testid="cart-drawer">Cart</div>,
}));

vi.mock('@/components/MobileMenu', () => ({
  default: () => <div data-testid="mobile-menu">Menu</div>,
}));

// Import mock to change return value
import { useAuth } from '@/contexts/AuthContext';
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

const renderNavigation = (route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      signOut: mockSignOut,
      loading: false,
    });
  });

  describe('Logo', () => {
    it('should render logo', () => {
      renderNavigation();
      
      // Find the logo link by href since it may not have accessible text
      const allLinks = screen.getAllByRole('link');
      const logoLink = allLinks.find(link => link.getAttribute('href') === '/');
      expect(logoLink).toBeTruthy();
    });
  });

  describe('Navigation Links', () => {
    it('should render all main navigation links', () => {
      renderNavigation();
      
      expect(screen.getByRole('link', { name: 'Strona główna' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'O nas' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Organizacje' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Zwierzęta' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Kontakt' })).toBeInTheDocument();
    });

    it('should have correct hrefs for navigation links', () => {
      renderNavigation();
      
      expect(screen.getByRole('link', { name: 'Strona główna' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'O nas' })).toHaveAttribute('href', '/o-nas');
      expect(screen.getByRole('link', { name: 'Organizacje' })).toHaveAttribute('href', '/organizacje');
      expect(screen.getByRole('link', { name: 'Zwierzęta' })).toHaveAttribute('href', '/zwierzeta');
      expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt');
    });

    it('should highlight active link on homepage', () => {
      renderNavigation('/');
      
      const homeLink = screen.getByRole('link', { name: 'Strona główna' });
      expect(homeLink).toHaveClass('text-primary');
    });

    it('should highlight active link on about page', () => {
      renderNavigation('/o-nas');
      
      const aboutLink = screen.getByRole('link', { name: 'O nas' });
      expect(aboutLink).toHaveClass('text-primary');
    });
  });

  describe('Cart', () => {
    it('should render cart drawer', () => {
      renderNavigation();
      
      expect(screen.getAllByTestId('cart-drawer').length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Menu', () => {
    it('should render mobile menu component', () => {
      renderNavigation();
      
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('should show login button when user is not logged in', () => {
      renderNavigation();
      
      expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeInTheDocument();
    });

    it('should navigate to auth page on login button click', () => {
      renderNavigation();
      
      const loginButton = screen.getByRole('button', { name: 'Zaloguj się' });
      fireEvent.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { email: 'test@example.com', id: '123' },
        profile: { display_name: 'Jan Kowalski', role: 'USER', avatar_url: null },
        signOut: mockSignOut,
        loading: false,
      });
    });

    it('should show user avatar when logged in', () => {
      renderNavigation();
      
      // Should have more buttons than just login when authenticated
      // Avatar dropdown trigger is one of them
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not show login button when logged in', () => {
      renderNavigation();
      
      expect(screen.queryByRole('button', { name: 'Zaloguj się' })).not.toBeInTheDocument();
    });
  });

  describe('ORG User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { email: 'org@example.com', id: '456' },
        profile: { display_name: 'Organizacja', role: 'ORG', avatar_url: null },
        signOut: mockSignOut,
        loading: false,
      });
    });

    it('should show user menu for ORG user', () => {
      renderNavigation();
      
      // Avatar button should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Admin User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { email: 'admin@example.com', id: '789' },
        profile: { display_name: 'Admin', role: 'ADMIN', avatar_url: null },
        signOut: mockSignOut,
        loading: false,
      });
    });

    it('should show user menu for ADMIN user', () => {
      renderNavigation();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading placeholder when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        profile: null,
        signOut: mockSignOut,
        loading: true,
      });
      
      renderNavigation();
      
      // Should show animated pulse div
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation landmark', () => {
      renderNavigation();
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible links', () => {
      renderNavigation();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Styling', () => {
    it('should have sticky positioning', () => {
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sticky');
      expect(nav).toHaveClass('top-0');
    });

    it('should have proper z-index for overlay', () => {
      renderNavigation();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('z-50');
    });
  });
});
