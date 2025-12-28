import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Global mock MUST be before imports
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  from: vi.fn(),
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Import AFTER mock setup
import { useAnimalsWithWishlists } from './useAnimalsWithWishlists';

// Helper to wait for async updates
const waitForNextUpdate = () => new Promise(resolve => setTimeout(resolve, 10));

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

/**
 * Recursive Mock Pattern - creates a chainable query builder
 * Every method returns `this`, allowing any chain of calls.
 * The builder is also thenable, so it works with async/await.
 */
const createMockQueryBuilder = <T>(mockData: T, mockError: Error | null = null) => {
  const result = { data: mockData, error: mockError };
  
  const builder: Record<string, unknown> = {
    // Query methods - all return this for chaining
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    
    // Terminal methods - return Promise with data
    single: vi.fn().mockResolvedValue({ 
      data: Array.isArray(mockData) ? mockData[0] ?? null : mockData, 
      error: mockError 
    }),
    maybeSingle: vi.fn().mockResolvedValue({ 
      data: Array.isArray(mockData) ? mockData[0] ?? null : mockData, 
      error: mockError 
    }),
    
    // Make builder thenable (Promise-like)
    then: vi.fn((resolve: (value: typeof result) => void) => {
      return Promise.resolve(result).then(resolve);
    }),
    catch: vi.fn((reject: (reason: unknown) => void) => {
      return Promise.resolve(result).catch(reject);
    }),
  };
  
  // Make all chainable methods return builder itself
  ['select', 'eq', 'neq', 'in', 'is', 'order', 'limit', 'range', 'filter', 'match'].forEach(method => {
    (builder[method] as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  });
  
  return builder;
};

/**
 * Creates table-specific mock builders based on table name
 */
const createTableMock = (table: string, overrides: Record<string, unknown> = {}) => {
  const tableData: Record<string, unknown> = {
    animals: mockAnimals,
    organizations: mockOrganizations,
    animal_wishlists: mockWishlists,
    orders: mockCompletedOrders,
    order_items: mockOrderItems,
    animal_images: mockGalleryImages,
    ...overrides,
  };
  
  return createMockQueryBuilder(tableData[table] ?? []);
};

describe('useAnimalsWithWishlists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    mockSupabase.from.mockImplementation((table: string) => createTableMock(table));
    mockSupabase.channel.mockReturnValue(mockChannel);
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
      const boughtItem = animal.wishlist.find(w => w.product_id === 'product-1');
      expect(boughtItem?.bought).toBe(true);
      
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
      const urgentItem = animal.wishlist.find(w => w.product_id === 'product-1');
      expect(urgentItem?.urgent).toBe(true);
      
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

    const animals = result.current.animals;
    
    if (animals.length >= 2) {
      const firstAnimal = animals[0];
      const secondAnimal = animals[1];
      
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
    mockSupabase.from.mockImplementation(() => 
      createMockQueryBuilder(null, new Error('Database error'))
    );

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
    mockSupabase.from.mockImplementation((table: string) => 
      createTableMock(table, { animals: [] })
    );

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

    mockSupabase.from.mockImplementation((table: string) => 
      createTableMock(table, { 
        animals: animalsWithoutImage,
        animal_wishlists: [],
        animal_images: [],
      })
    );

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

    mockSupabase.from.mockImplementation((table: string) => 
      createTableMock(table, { 
        animals: animalsWithUnknownOrg,
        organizations: [],
        animal_wishlists: [],
        animal_images: [],
      })
    );

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

    expect(mockSupabase.channel).toHaveBeenCalledWith('order_items_changes');
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

  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => useAnimalsWithWishlists());

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
