import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fireEvent,
  renderWithProviders,
  screen,
  defaultMockAuthValue,
  loggedInMockAuthValue,
  adminMockAuthValue,
  orgMockAuthValue,
  setMockAuthValue,
} from '@/test/test-utils';
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

// Mock CartDrawer and MobileMenu
vi.mock('@/components/CartDrawer', () => ({
  default: () => <div data-testid="cart-drawer">Cart</div>,
}));

vi.mock('@/components/MobileMenu', () => ({
  default: () => <div data-testid="mobile-menu">Menu</div>,
}));

const renderNavigation = (route = '/') => {
  return renderWithProviders(<Navigation />, { route });
};

describe('Navigation', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthValue({
      ...defaultMockAuthValue,
      signOut: mockSignOut,
    });
  });

  describe('Logo', () => {
    it('should render logo', () => {
      renderNavigation();
      
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/');
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
    it('should show user avatar when logged in', () => {
      setMockAuthValue(loggedInMockAuthValue);
      renderNavigation();
      
      const avatar = screen.getByText('U');
      expect(avatar.closest('button')).toBeInTheDocument();
    });

    it('should not show login button when logged in', () => {
      setMockAuthValue(loggedInMockAuthValue);
      renderNavigation();
      
      expect(screen.queryByRole('button', { name: 'Zaloguj się' })).not.toBeInTheDocument();
    });
  });

  describe('ORG User', () => {
    it('should show user menu for ORG user', () => {
      setMockAuthValue(orgMockAuthValue);
      renderNavigation();
      
      const avatar = screen.getByText('O');
      expect(avatar.closest('button')).toBeInTheDocument();
    });
  });

  describe('Admin User', () => {
    it('should show user menu for ADMIN user', () => {
      setMockAuthValue(adminMockAuthValue);
      renderNavigation();
      
      const avatar = screen.getByText('A');
      expect(avatar.closest('button')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading placeholder when auth is loading', () => {
      setMockAuthValue({ ...defaultMockAuthValue, loading: true });
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
});
