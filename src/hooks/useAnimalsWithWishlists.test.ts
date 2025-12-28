import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ============================================================================
// MOCK SETUP - Must be before imports
// ============================================================================

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

/**
 * Recursive Mock Builder - universal chainable query builder
 * Every method returns the same builder object, allowing any chain of calls.
 * The builder is thenable, so it works with async/await.
 */
const createRecursiveMock = <T>(returnData: T, error: Error | null = null): any => {
  const result = { data: returnData, error };
  
  const mock: any = {
    // Make it thenable (Promise-like)
    then: (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve),
    catch: (reject: (reason: unknown) => void) => Promise.resolve(result).catch(reject),
    
    // Terminal methods
    single: vi.fn(() => Promise.resolve({ 
      data: Array.isArray(returnData) ? returnData[0] ?? null : returnData, 
      error 
    })),
    maybeSingle: vi.fn(() => Promise.resolve({ 
      data: Array.isArray(returnData) ? returnData[0] ?? null : returnData, 
      error 
    })),
  };
  
  // Chainable methods - all return the same mock
  const chainableMethods = [
    'select', 'eq', 'neq', 'in', 'is', 'not', 'or', 'and',
    'order', 'limit', 'range', 'filter', 'match', 'contains',
    'containedBy', 'gte', 'lte', 'gt', 'lt', 'like', 'ilike',
    'textSearch', 'insert', 'update', 'upsert', 'delete'
  ];
  
  chainableMethods.forEach(method => {
    mock[method] = vi.fn(() => mock);
  });
  
  return mock;
};

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
    active: true,
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
    active: true,
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

// Table data registry for mocking
let tableDataOverrides: Record<string, unknown> = {};

const getTableData = (table: string) => {
  const defaultData: Record<string, unknown> = {
    animals: mockAnimals,
    organizations: mockOrganizations,
    animal_wishlists: mockWishlists,
    orders: mockCompletedOrders,
    order_items: mockOrderItems,
    animal_images: mockGalleryImages,
  };
  
  return tableDataOverrides[table] ?? defaultData[table] ?? [];
};

const mockSupabase = {
  from: vi.fn((table: string) => createRecursiveMock(getTableData(table))),
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Import AFTER mock setup
import { useAnimalsWithWishlists } from './useAnimalsWithWishlists';

// ============================================================================
// TESTS
// ============================================================================

describe('useAnimalsWithWishlists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableDataOverrides = {};
    
    // Reset mock implementations
    mockSupabase.from.mockImplementation((table: string) => 
      createRecursiveMock(getTableData(table))
    );
    mockSupabase.channel.mockReturnValue(mockChannel);
    mockChannel.on.mockReturnValue(mockChannel);
    mockChannel.subscribe.mockReturnValue(mockChannel);
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('animals');
  });

  it('should transform animal data with correct structure', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    expect(animal).toBeDefined();
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    expect(animal).toBeDefined();
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    expect(animal).toBeDefined();
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const animal = result.current.animals.find(a => a.id === 'animal-1');
    
    expect(animal).toBeDefined();
    if (animal) {
      expect(animal.gallery.length).toBe(2);
      expect(animal.gallery[0].image_url).toBe('/gallery1.jpg');
    }
  });

  it('should sort animals by neediness (lowest completion first)', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const animals = result.current.animals;
    
    expect(animals.length).toBeGreaterThanOrEqual(2);
    
    // Verify sorting logic - animals with lower completion should come first
    const firstAnimal = animals[0];
    const secondAnimal = animals[1];
    
    const firstCompletion = firstAnimal.wishlist.length > 0 
      ? firstAnimal.wishlist.filter(w => w.bought).length / firstAnimal.wishlist.length 
      : 1;
    const secondCompletion = secondAnimal.wishlist.length > 0 
      ? secondAnimal.wishlist.filter(w => w.bought).length / secondAnimal.wishlist.length 
      : 1;
    
    expect(firstCompletion).toBeLessThanOrEqual(secondCompletion);
  });

  it('should handle fetch error gracefully', async () => {
    mockSupabase.from.mockImplementation(() => 
      createRecursiveMock(null, new Error('Database error'))
    );

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.animals).toEqual([]);
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle empty animals list', async () => {
    tableDataOverrides = { animals: [] };
    mockSupabase.from.mockImplementation((table: string) => 
      createRecursiveMock(getTableData(table))
    );

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.animals).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should use placeholder for missing image_url', async () => {
    tableDataOverrides = {
      animals: [{ ...mockAnimals[0], image_url: null }],
      animal_wishlists: [],
      animal_images: [],
    };
    mockSupabase.from.mockImplementation((table: string) => 
      createRecursiveMock(getTableData(table))
    );

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.animals.length).toBeGreaterThan(0);
    expect(result.current.animals[0].image).toBe('/placeholder.svg');
  });

  it('should handle missing organization gracefully', async () => {
    tableDataOverrides = {
      animals: [{ ...mockAnimals[0], organization_id: 'unknown-org' }],
      organizations: [],
      animal_wishlists: [],
      animal_images: [],
    };
    mockSupabase.from.mockImplementation((table: string) => 
      createRecursiveMock(getTableData(table))
    );

    const { result } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.animals.length).toBeGreaterThan(0);
    expect(result.current.animals[0].organization).toBe('Nieznana organizacja');
    expect(result.current.animals[0].location).toBe('Polska');
  });

  it('should set up realtime subscription', async () => {
    renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalledWith('order_items_changes');
    });
    
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'order_items',
      }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', async () => {
    const { unmount } = renderHook(() => useAnimalsWithWishlists());

    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalled();
    });

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
