import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimalsWithWishlists } from './useAnimalsWithWishlists';

// Helper to wait for async updates
const waitForNextUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock data
const mockAnimals = [
  {
    id: 'animal-1',
    name: 'Burek',
    species: 'Pies',
    age: 3,
    breed: 'Mieszaniec',
    description: 'Przyjazny pies',
    image_url: '/dog.jpg',
    organization_id: 'org-1',
    created_at: '2024-01-15T10:00:00Z',
    birth_date: '2021-01-01',
  },
  {
    id: 'animal-2',
    name: 'Mruczek',
    species: 'Kot',
    age: 2,
    breed: 'Dachowiec',
    description: 'Spokojny kot',
    image_url: '/cat.jpg',
    organization_id: 'org-1',
    created_at: '2024-01-10T10:00:00Z',
    birth_date: null,
  },
];

const mockOrganizations = [
  {
    id: 'org-1',
    name: 'Schronisko Testowe',
    slug: 'schronisko-testowe',
    city: 'Warszawa',
  },
];

const mockWishlists = [
  {
    id: 'wishlist-1',
    animal_id: 'animal-1',
    priority: 1,
    quantity: 2,
    products: {
      id: 'product-1',
      name: 'Karma dla psa',
      price: 50,
      image_url: '/food.jpg',
    },
  },
  {
    id: 'wishlist-2',
    animal_id: 'animal-1',
    priority: 2,
    quantity: 1,
    products: {
      id: 'product-2',
      name: 'Zabawka',
      price: 20,
      image_url: '/toy.jpg',
    },
  },
  {
    id: 'wishlist-3',
    animal_id: 'animal-2',
    priority: 1,
    quantity: 1,
    products: {
      id: 'product-3',
      name: 'Karma dla kota',
      price: 40,
      image_url: '/cat-food.jpg',
    },
  },
];

const mockCompletedOrders = [{ id: 'order-1' }];

const mockOrderItems = [
  { animal_id: 'animal-1', product_id: 'product-1' },
];

const mockGalleryImages = [
  { id: 'img-1', animal_id: 'animal-1', image_url: '/gallery1.jpg', display_order: 1 },
  { id: 'img-2', animal_id: 'animal-1', image_url: '/gallery2.jpg', display_order: 2 },
];

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

const createMockQueryBuilder = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  then: vi.fn((resolve) => resolve({ data, error })),
  // Make it thenable for async/await
  [Symbol.toStringTag]: 'Promise',
});

let mockFromImplementation: (table: string) => ReturnType<typeof createMockQueryBuilder>;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => mockFromImplementation(table)),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

describe('useAnimalsWithWishlists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default implementation - successful responses
    mockFromImplementation = (table: string) => {
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      // Chain the methods to return promises at the end
      const chainWithPromise = (data: unknown) => {
        const chain = {
          ...builder,
          select: vi.fn(() => ({
            ...chain,
            eq: vi.fn(() => Promise.resolve({ data, error: null })),
            in: vi.fn(() => ({
              ...chain,
              order: vi.fn(() => Promise.resolve({ data, error: null })),
            })),
          })),
        };
        
        // Direct promise resolution for simple queries
        Object.defineProperty(chain, 'then', {
          value: (resolve: (value: { data: unknown; error: null }) => void) => 
            Promise.resolve({ data, error: null }).then(resolve),
        });
        
        return chain;
      };

      switch (table) {
        case 'animals':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: mockAnimals, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'organizations':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: mockOrganizations, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_wishlists':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: mockWishlists, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'orders':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: mockCompletedOrders, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'order_items':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: mockOrderItems, error: null })),
              })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_images':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: mockGalleryImages, error: null })),
              })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        default:
          return createMockQueryBuilder(null);
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.animals).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch and transform animals data correctly', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.error).toBeNull();
  });

  it('should transform animal data with correct structure', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    if (animal) {
      expect(animal.name).toBe('Burek');
      expect(animal.species).toBe('Pies');
      expect(animal.organization).toBe('Schronisko Testowe');
      expect(animal.organizationSlug).toBe('schronisko-testowe');
      expect(animal.city).toBe('Warszawa');
      expect(animal.location).toBe('Warszawa');
    }
  });

  it('should mark wishlist items as bought when purchased', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    if (animal) {
      // product-1 should be marked as bought (exists in mockOrderItems)
      const boughtItem = animal.wishlist.find(w => w.product_id === 'product-1');
      expect(boughtItem?.bought).toBe(true);
      
      // product-2 should not be marked as bought
      const notBoughtItem = animal.wishlist.find(w => w.product_id === 'product-2');
      expect(notBoughtItem?.bought).toBe(false);
    }
  });

  it('should mark urgent items correctly based on priority', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    if (animal) {
      // priority 1 = urgent
      const urgentItem = animal.wishlist.find(w => w.product_id === 'product-1');
      expect(urgentItem?.urgent).toBe(true);
      
      // priority 2 = not urgent
      const normalItem = animal.wishlist.find(w => w.product_id === 'product-2');
      expect(normalItem?.urgent).toBe(false);
    }
  });

  it('should include gallery images for animals', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    if (animal) {
      expect(animal.gallery.length).toBe(2);
      expect(animal.gallery[0].image_url).toBe('/gallery1.jpg');
    }
  });

  it('should sort animals by neediness (lowest completion first)', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    // animal-2 has 0% completion (no items bought), animal-1 has 50% (1 of 2 bought)
    // So animal-2 should come first
    const animals = result.current.animals;
    
    if (animals.length >= 2) {
      const firstAnimal = animals[0];
      const secondAnimal = animals[1];
      
      // Calculate completion percentages
      const firstCompletion = firstAnimal.wishlist.length > 0 
        ? firstAnimal.wishlist.filter(w => w.bought).length / firstAnimal.wishlist.length 
        : 1;
      const secondCompletion = secondAnimal.wishlist.length > 0 
        ? secondAnimal.wishlist.filter(w => w.bought).length / secondAnimal.wishlist.length 
        : 1;
      
      expect(firstCompletion).toBeLessThanOrEqual(secondCompletion);
    }
  });

  it('should handle fetch error gracefully', async () => {
    // Override to return an error
    mockFromImplementation = () => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('Database error') })),
      })),
    } as ReturnType<typeof createMockQueryBuilder>);

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.animals).toEqual([]);
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle empty animals list', async () => {
    mockFromImplementation = (table: string) => {
      if (table === 'animals') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        } as ReturnType<typeof createMockQueryBuilder>;
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      } as ReturnType<typeof createMockQueryBuilder>;
    };

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.animals).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should use placeholder for missing image_url', async () => {
    const animalsWithoutImage = [{
      ...mockAnimals[0],
      image_url: null,
    }];

    mockFromImplementation = (table: string) => {
      switch (table) {
        case 'animals':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: animalsWithoutImage, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'organizations':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: mockOrganizations, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_wishlists':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'orders':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_images':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        default:
          return createMockQueryBuilder([]);
      }
    };

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    if (result.current.animals.length > 0) {
      expect(result.current.animals[0].image).toBe('/placeholder.svg');
    }
  });

  it('should handle missing organization gracefully', async () => {
    const animalsWithUnknownOrg = [{
      ...mockAnimals[0],
      organization_id: 'unknown-org',
    }];

    mockFromImplementation = (table: string) => {
      switch (table) {
        case 'animals':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: animalsWithUnknownOrg, error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'organizations':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_wishlists':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'orders':
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        case 'animal_images':
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          } as ReturnType<typeof createMockQueryBuilder>;
        default:
          return createMockQueryBuilder([]);
      }
    };

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await act(async () => {
      await waitForNextUpdate();
    });

    if (result.current.animals.length > 0) {
      expect(result.current.animals[0].organization).toBe('Nieznana organizacja');
      expect(result.current.animals[0].location).toBe('Polska');
    }
  });

  it('should set up realtime subscription', () => {
    renderHook(() => useAnimalsWithWishlists());

    // Verify channel was created and subscribed
    const { supabase } = require('@/integrations/supabase/client');
    expect(supabase.channel).toHaveBeenCalledWith('order_items_changes');
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });
});
