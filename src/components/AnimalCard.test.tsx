import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock all external dependencies FIRST
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    profile: { id: 'test-user', display_name: 'Test User', role: 'USER', avatar_url: null },
    loading: false,
    signOut: vi.fn(),
    isAdmin: false,
    isOrg: false,
    isUser: true,
  }),
}));

// Mock CartContext to avoid AuthContext dependency chain
const mockAddToCart = vi.fn();
const mockAddAllForAnimal = vi.fn();
const mockMarkAnimalAsAdded = vi.fn();

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    cart: [],
    cartTotal: 0,
    cartCount: 0,
    addToCart: mockAddToCart,
    removeFromCart: vi.fn(),
    removeAllForAnimal: vi.fn(),
    removeAllForOrganization: vi.fn(),
    clearCart: vi.fn(),
    updateQuantity: vi.fn(),
    addAllForAnimal: mockAddAllForAnimal,
    completePurchase: vi.fn(),
    isAnimalFullyAdded: () => false,
    markAnimalAsAdded: mockMarkAnimalAsAdded,
    isLoading: false,
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    })),
  },
}));

// NOW import components after all mocks
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnimalCard from './AnimalCard';

const mockAnimal = {
  id: '1',
  name: 'Burek',
  age: '3 lata',
  species: 'Pies',
  location: 'Warszawa',
  organization: 'Schronisko Warszawa',
  organizationSlug: 'schronisko-warszawa',
  description: 'Przyjazny pies szukający domu',
  image: '/images/dog-1.jpg',
  wishlist: [
    { id: '101', name: 'Karma dla psa', price: 49.99, quantity: 2, product_id: 'prod-101' },
    { id: '102', name: 'Zabawka', price: 19.99, quantity: 1, product_id: 'prod-102' },
  ],
};

const mockAnimalWithBirthDate = { ...mockAnimal, birth_date: '2021-06-15' };
const mockAnimalNoWishlist = { ...mockAnimal, wishlist: [] };

const renderAnimalCard = (animal = mockAnimal, fromOrganizationProfile = false) => {
  return render(
    <BrowserRouter>
      <AnimalCard animal={animal} fromOrganizationProfile={fromOrganizationProfile} />
    </BrowserRouter>
  );
};

describe('AnimalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render animal name', () => {
      renderAnimalCard();
      expect(screen.getByText('Burek')).toBeInTheDocument();
    });

    it('should render animal age', () => {
      renderAnimalCard();
      expect(screen.getByText('3 lata')).toBeInTheDocument();
    });

    it('should render animal location', () => {
      renderAnimalCard();
      expect(screen.getByText('Warszawa')).toBeInTheDocument();
    });

    it('should render organization name as a button', () => {
      renderAnimalCard();
      expect(screen.getByRole('button', { name: 'Schronisko Warszawa' })).toBeInTheDocument();
    });

    it('should render animal image with proper alt text', () => {
      renderAnimalCard();
      const img = screen.getByAltText('Burek - pies szukający domu');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/images/dog-1.jpg');
    });

    it('should render wishlist items when present', () => {
      renderAnimalCard();
      expect(screen.getByText('Lista życzeń:')).toBeInTheDocument();
      expect(screen.getByText('Karma dla psa')).toBeInTheDocument();
      expect(screen.getByText('Zabawka')).toBeInTheDocument();
    });

    it('should not render wishlist section when empty', () => {
      renderAnimalCard(mockAnimalNoWishlist);
      expect(screen.queryByText('Lista życzeń:')).not.toBeInTheDocument();
    });

    it('should calculate age from birth_date if provided', () => {
      renderAnimalCard(mockAnimalWithBirthDate);
      const ageElement = screen.queryByText(/lat|miesi/i);
      expect(ageElement).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should navigate to animal profile on card click', () => {
      renderAnimalCard();
      const card = screen.getByText('Burek').closest('.group');
      if (card) {
        fireEvent.click(card);
        expect(mockNavigate).toHaveBeenCalledWith('/zwierze/1', expect.anything());
      }
    });

    it('should navigate with organization context when fromOrganizationProfile is true', () => {
      renderAnimalCard(mockAnimal, true);
      const card = screen.getByText('Burek').closest('.group');
      if (card) {
        fireEvent.click(card);
        expect(mockNavigate).toHaveBeenCalledWith('/zwierze/1', {
          state: {
            fromOrganizationProfile: true,
            organizationName: 'Schronisko Warszawa',
            organizationSlug: 'schronisko-warszawa',
          },
        });
      }
    });

    it('should navigate to organization page on organization click', () => {
      renderAnimalCard();
      const orgButton = screen.getByRole('button', { name: 'Schronisko Warszawa' });
      fireEvent.click(orgButton);
      expect(mockNavigate).toHaveBeenCalledWith('/organizacje/schronisko-warszawa');
    });

    it('should render buy all button with total price', () => {
      renderAnimalCard();
      const buyAllButton = screen.getByRole('button', { name: /Dodaj wszystko/i });
      expect(buyAllButton).toBeInTheDocument();
      expect(buyAllButton).toHaveTextContent('119.97');
    });
  });

  describe('Wishlist calculations', () => {
    it('should calculate correct total wishlist cost', () => {
      renderAnimalCard();
      expect(screen.getByText(/119\.97/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible image alt text', () => {
      renderAnimalCard();
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });

    it('should have clickable organization button', () => {
      renderAnimalCard();
      const orgButton = screen.getByRole('button', { name: 'Schronisko Warszawa' });
      expect(orgButton).toBeEnabled();
    });
  });
});

describe('AnimalCard - Edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle animal without organizationSlug', () => {
    const animalWithoutSlug = { ...mockAnimal, organizationSlug: undefined };
    renderAnimalCard(animalWithoutSlug);
    const orgButton = screen.getByRole('button', { name: 'Schronisko Warszawa' });
    fireEvent.click(orgButton);
    expect(mockNavigate).toHaveBeenCalledWith('/organizacje/schronisko-warszawa');
  });

  it('should handle wishlist items with product_id same as id', () => {
    const animalWithIdOnlyWishlist = {
      ...mockAnimal,
      wishlist: [{ id: '201', name: 'Produkt z product_id', price: 29.99, quantity: 1, product_id: '201' }],
    };
    renderAnimalCard(animalWithIdOnlyWishlist);
    expect(screen.getByText('Produkt z product_id')).toBeInTheDocument();
  });

  it('should handle bought items in wishlist', () => {
    const animalWithBoughtItems = {
      ...mockAnimal,
      wishlist: [
        { id: '301', name: 'Kupiony produkt', price: 39.99, quantity: 1, product_id: 'prod-301', bought: true },
        { id: '302', name: 'Dostępny produkt', price: 29.99, quantity: 1, product_id: 'prod-302', bought: false },
      ],
    };
    renderAnimalCard(animalWithBoughtItems);
    expect(screen.getByText('Kupiony produkt')).toBeInTheDocument();
    expect(screen.getByText('Dostępny produkt')).toBeInTheDocument();
  });

  it('should show "Wszystko kupione!" when all items are bought', () => {
    const animalAllBought = {
      ...mockAnimal,
      wishlist: [
        { id: '401', name: 'Kupiony 1', price: 19.99, quantity: 1, product_id: 'prod-401', bought: true },
        { id: '402', name: 'Kupiony 2', price: 29.99, quantity: 1, product_id: 'prod-402', bought: true },
      ],
    };
    renderAnimalCard(animalAllBought);
    expect(screen.getByText('Wszystko kupione!')).toBeInTheDocument();
  });
});
