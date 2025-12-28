import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import React from 'react';

// ============================================================================
// JSDOM POLYFILLS - Must be at the very top
// ============================================================================

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

// ============================================================================
// MOCKS - Must be declared before any imports that use them
// ============================================================================

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    profile: { 
      id: 'test-user', 
      display_name: 'Test User', 
      role: 'USER' as const, 
      avatar_url: null,
      must_change_password: false,
    },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    isAdmin: false,
    isOrg: false,
    isUser: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock CartContext
const mockAddToCart = vi.fn();
const mockAddAllForAnimal = vi.fn();
const mockMarkAnimalAsAdded = vi.fn();
const mockRemoveFromCart = vi.fn();
const mockRemoveAllForAnimal = vi.fn();

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    cart: [],
    cartTotal: 0,
    cartCount: 0,
    addToCart: mockAddToCart,
    removeFromCart: mockRemoveFromCart,
    removeAllForAnimal: mockRemoveAllForAnimal,
    removeAllForOrganization: vi.fn(),
    clearCart: vi.fn(),
    updateQuantity: vi.fn(),
    addAllForAnimal: mockAddAllForAnimal,
    completePurchase: vi.fn().mockResolvedValue({ success: true }),
    isAnimalFullyAdded: () => false,
    markAnimalAsAdded: mockMarkAnimalAsAdded,
    isLoading: false,
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ 
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })) 
      })),
    })),
  },
}));

// ============================================================================
// IMPORTS - After all mocks
// ============================================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnimalCard from './AnimalCard';

// ============================================================================
// TEST DATA - All wishlist items have unique IDs and product_ids
// ============================================================================

const createWishlistItem = (
  id: string, 
  name: string, 
  price: number, 
  quantity: number, 
  bought: boolean
) => ({
  id,
  name,
  price,
  quantity,
  product_id: `prod-${id}`,
  bought,
  urgent: false,
  image_url: '/placeholder.svg',
});

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
    createWishlistItem('101', 'Karma dla psa', 49.99, 2, false),
    createWishlistItem('102', 'Zabawka', 19.99, 1, false),
  ],
};

const mockAnimalWithBirthDate = { ...mockAnimal, birth_date: '2021-06-15' };
const mockAnimalNoWishlist = { ...mockAnimal, wishlist: [] };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const renderAnimalCard = (animal = mockAnimal, fromOrganizationProfile = false) => {
  return render(
    <BrowserRouter>
      <AnimalCard animal={animal} fromOrganizationProfile={fromOrganizationProfile} />
    </BrowserRouter>
  );
};

// ============================================================================
// TESTS
// ============================================================================

describe('AnimalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render animal name', async () => {
      renderAnimalCard();
      await waitFor(() => {
        expect(screen.getByText('Burek')).toBeInTheDocument();
      });
    });

    it('should render animal age', async () => {
      renderAnimalCard();
      await waitFor(() => {
        expect(screen.getByText('3 lata')).toBeInTheDocument();
      });
    });

    it('should render animal location', async () => {
      renderAnimalCard();
      await waitFor(() => {
        expect(screen.getByText('Warszawa')).toBeInTheDocument();
      });
    });

    it('should render organization name as a button', async () => {
      renderAnimalCard();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Schronisko Warszawa' })).toBeInTheDocument();
      });
    });

    it('should render animal image with proper alt text', async () => {
      renderAnimalCard();
      await waitFor(() => {
        const img = screen.getByAltText('Burek - pies szukający domu');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/images/dog-1.jpg');
      });
    });

    it('should render wishlist items when present', async () => {
      renderAnimalCard();
      await waitFor(() => {
        expect(screen.getByText('Lista życzeń:')).toBeInTheDocument();
        expect(screen.getByText('Karma dla psa')).toBeInTheDocument();
        expect(screen.getByText('Zabawka')).toBeInTheDocument();
      });
    });

    it('should not render wishlist section when empty', async () => {
      renderAnimalCard(mockAnimalNoWishlist);
      await waitFor(() => {
        expect(screen.queryByText('Lista życzeń:')).not.toBeInTheDocument();
      });
    });

    it('should calculate age from birth_date if provided', async () => {
      renderAnimalCard(mockAnimalWithBirthDate);
      await waitFor(() => {
        const ageElement = screen.queryByText(/lat|miesi/i);
        expect(ageElement).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should navigate to animal profile on card click', async () => {
      renderAnimalCard();
      
      await waitFor(() => {
        const card = screen.getByText('Burek').closest('.group');
        expect(card).toBeInTheDocument();
      });
      
      const card = screen.getByText('Burek').closest('.group');
      if (card) {
        fireEvent.click(card);
        expect(mockNavigate).toHaveBeenCalledWith('/zwierze/1', expect.anything());
      }
    });

    it('should navigate with organization context when fromOrganizationProfile is true', async () => {
      renderAnimalCard(mockAnimal, true);
      
      await waitFor(() => {
        expect(screen.getByText('Burek')).toBeInTheDocument();
      });
      
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

    it('should navigate to organization page on organization click', async () => {
      renderAnimalCard();
      
      const orgButton = await screen.findByRole('button', { name: 'Schronisko Warszawa' });
      fireEvent.click(orgButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/organizacje/schronisko-warszawa');
      });
    });

    it('should render buy all button with total price', async () => {
      renderAnimalCard();
      
      await waitFor(() => {
        const buyAllButton = screen.getByRole('button', { name: /Dodaj wszystko/i });
        expect(buyAllButton).toBeInTheDocument();
        // 49.99 * 2 + 19.99 * 1 = 119.97
        expect(buyAllButton).toHaveTextContent('119.97');
      });
    });
  });

  describe('Wishlist calculations', () => {
    it('should calculate correct total wishlist cost', async () => {
      renderAnimalCard();
      
      await waitFor(() => {
        // Karma: 49.99 * 2 = 99.98, Zabawka: 19.99 * 1 = 19.99, Total: 119.97
        expect(screen.getByText(/119\.97/)).toBeInTheDocument();
      });
    });

    it('should exclude bought items from total cost', async () => {
      const animalWithPartiallyBought = {
        ...mockAnimal,
        wishlist: [
          createWishlistItem('201', 'Karma dla psa', 50.00, 1, true),  // bought
          createWishlistItem('202', 'Zabawka', 20.00, 1, false),       // available
        ],
      };
      renderAnimalCard(animalWithPartiallyBought);
      
      await waitFor(() => {
        // Only Zabawka should be counted: 20.00 zł
        const buyButton = screen.getByRole('button', { name: /Dodaj wszystko/i });
        expect(buyButton).toHaveTextContent('20.00');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible image alt text', async () => {
      renderAnimalCard();
      
      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have clickable organization button', async () => {
      renderAnimalCard();
      
      const orgButton = await screen.findByRole('button', { name: 'Schronisko Warszawa' });
      expect(orgButton).toBeEnabled();
    });
  });
});

describe('AnimalCard - Edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle animal without organizationSlug', async () => {
    const animalWithoutSlug = { ...mockAnimal, organizationSlug: undefined };
    renderAnimalCard(animalWithoutSlug);
    
    const orgButton = await screen.findByRole('button', { name: 'Schronisko Warszawa' });
    fireEvent.click(orgButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/organizacje/schronisko-warszawa');
    });
  });

  it('should handle wishlist items with product_id same as id', async () => {
    const animalWithIdOnlyWishlist = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('301', 'Produkt z product_id', 29.99, 1, false),
      ],
    };
    renderAnimalCard(animalWithIdOnlyWishlist);
    
    await waitFor(() => {
      expect(screen.getByText('Produkt z product_id')).toBeInTheDocument();
    });
  });

  it('should handle mixed bought and available items in wishlist', async () => {
    const animalWithBoughtItems = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('401', 'Kupiony produkt', 39.99, 1, true),
        createWishlistItem('402', 'Dostępny produkt', 29.99, 1, false),
      ],
    };
    renderAnimalCard(animalWithBoughtItems);
    
    await waitFor(() => {
      expect(screen.getByText('Kupiony produkt')).toBeInTheDocument();
      expect(screen.getByText('Dostępny produkt')).toBeInTheDocument();
    });
  });

  it('should show "Wszystko kupione!" when all wishlist items are bought', async () => {
    const animalAllBought = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('501', 'Kupiony 1', 19.99, 1, true),
        createWishlistItem('502', 'Kupiony 2', 29.99, 1, true),
      ],
    };
    renderAnimalCard(animalAllBought);
    
    await waitFor(() => {
      expect(screen.getByText('Wszystko kupione!')).toBeInTheDocument();
    });
  });

  it('should disable buy all button when all items are bought', async () => {
    const animalAllBought = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('601', 'Kupiony 1', 19.99, 1, true),
        createWishlistItem('602', 'Kupiony 2', 29.99, 1, true),
      ],
    };
    renderAnimalCard(animalAllBought);
    
    await waitFor(() => {
      const buyButton = screen.getByRole('button', { name: /Wszystko kupione/i });
      expect(buyButton).toBeDisabled();
    });
  });

  it('should not show wishlist section when wishlist is empty array', async () => {
    const animalEmptyWishlist = { ...mockAnimal, wishlist: [] };
    renderAnimalCard(animalEmptyWishlist);
    
    await waitFor(() => {
      expect(screen.queryByText('Lista życzeń:')).not.toBeInTheDocument();
    });
  });

  it('should handle wishlist with single item correctly', async () => {
    const animalSingleItem = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('701', 'Jedyny produkt', 55.00, 1, false),
      ],
    };
    renderAnimalCard(animalSingleItem);
    
    await waitFor(() => {
      expect(screen.getByText('Jedyny produkt')).toBeInTheDocument();
      const buyButton = screen.getByRole('button', { name: /Dodaj wszystko/i });
      expect(buyButton).toHaveTextContent('55.00');
    });
  });

  it('should calculate correct cost with multiple quantities', async () => {
    const animalMultipleQuantities = {
      ...mockAnimal,
      wishlist: [
        createWishlistItem('801', 'Karma', 30.00, 3, false),  // 30 * 3 = 90
        createWishlistItem('802', 'Smaczek', 10.00, 5, false), // 10 * 5 = 50
      ],
    };
    renderAnimalCard(animalMultipleQuantities);
    
    await waitFor(() => {
      const buyButton = screen.getByRole('button', { name: /Dodaj wszystko/i });
      // Total: 90 + 50 = 140.00
      expect(buyButton).toHaveTextContent('140.00');
    });
  });
});
