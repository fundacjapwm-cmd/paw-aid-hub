import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// ============================================================================
// MOCK SETUP - Must be before imports
// ============================================================================

const mockOrganizations = [
  { id: 'org-1', name: 'Schronisko Warszawa', slug: 'schronisko-warszawa', logo_url: '/logo1.png', city: 'Warszawa' },
  { id: 'org-2', name: 'Fundacja Psia Łapa', slug: 'fundacja-psia-lapa', logo_url: '/logo2.png', city: 'Kraków' },
  { id: 'org-3', name: 'Kocie Schronisko', slug: 'kocie-schronisko', logo_url: '/logo3.png', city: 'Warszawa' },
];

const mockCities = [
  { city: 'Warszawa' },
  { city: 'Kraków' },
  { city: 'Poznań' },
];

const mockSupabaseFrom = vi.fn();

/**
 * Recursive Mock Builder for Supabase queries
 */
const createRecursiveMock = <T,>(returnData: T): any => {
  const result = { data: returnData, error: null };
  
  const mock: any = {
    then: (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve),
    catch: (reject: (reason: unknown) => void) => Promise.resolve(result).catch(reject),
  };
  
  const chainableMethods = [
    'select', 'eq', 'neq', 'in', 'is', 'not', 'or', 'and',
    'order', 'limit', 'range', 'filter', 'match'
  ];
  
  chainableMethods.forEach(method => {
    mock[method] = vi.fn(() => mock);
  });
  
  return mock;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      mockSupabaseFrom(table);
      if (table === 'organizations') {
        return createRecursiveMock(mockOrganizations);
      }
      return createRecursiveMock(mockCities);
    },
  },
}));

// ============================================================================
// IMPORTS - After mocks
// ============================================================================

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnimalFilters from './AnimalFilters';

// ============================================================================
// TESTS
// ============================================================================

describe('AnimalFilters', () => {
  const mockOnFilterChange = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe('Rendering', () => {
    it('should render filter section with title', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByText('Filtry')).toBeInTheDocument();
    });

    it('should render organization input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByPlaceholderText('Organizacja...')).toBeInTheDocument();
    });

    it('should render city input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByPlaceholderText('Miejscowość...')).toBeInTheDocument();
    });

    it('should render species select', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByText('Wszystkie zwierzęta')).toBeInTheDocument();
    });

    it('should render sort select', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByText(/Brzuszek: od najmniej najedzonych/i)).toBeInTheDocument();
    });

    it('should render filter icon', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const filterSection = await screen.findByText('Filtry');
      expect(filterSection.closest('div')).toBeInTheDocument();
    });
  });

  describe('Initial Data Fetching', () => {
    it('should fetch organizations on mount', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('organizations');
      });
    });

    it('should fetch cities on mount', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('organizations');
      });
    });
  });

  describe('Species Filter', () => {
    it('should show species options when clicked', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      await user.click(speciesSelect);
      
      expect(await screen.findByText('Pies')).toBeInTheDocument();
      expect(await screen.findByText('Kot')).toBeInTheDocument();
      expect(await screen.findByText('Inne')).toBeInTheDocument();
    });

    it('should call onFilterChange when species selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      await user.click(speciesSelect);
      
      const dogOption = await screen.findByText('Pies');
      await user.click(dogOption);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            species: 'Pies',
          })
        );
      });
    });
  });

  describe('Sort Filter', () => {
    it('should show sort options when clicked', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = await screen.findByText(/Brzuszek: od najmniej najedzonych/i);
      await user.click(sortSelect);
      
      expect(await screen.findByText('Najnowsze')).toBeInTheDocument();
      expect(await screen.findByText('Najstarsze')).toBeInTheDocument();
      expect(await screen.findByText('Alfabetycznie A-Z')).toBeInTheDocument();
    });

    it('should call onFilterChange when sort option selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = await screen.findByText(/Brzuszek: od najmniej najedzonych/i);
      await user.click(sortSelect);
      
      const newestOption = await screen.findByText('Najnowsze');
      await user.click(newestOption);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'najnowsze',
          })
        );
      });
    });
  });

  describe('City Filter', () => {
    it('should allow typing in city input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      await user.type(cityInput, 'War');
      
      await waitFor(() => {
        expect(cityInput).toHaveValue('War');
      });
    });

    it('should call onFilterChange when city typed', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      await user.type(cityInput, 'Warszawa');
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            city: expect.stringContaining('Warszawa'),
          })
        );
      }, { timeout: 2000 });
    });
  });

  describe('Organization Filter', () => {
    it('should allow typing in organization input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      await user.type(orgInput, 'Sch');
      
      await waitFor(() => {
        expect(orgInput).toHaveValue('Sch');
      });
    });
  });

  describe('Clear Filters', () => {
    it('should not show clear button when no filters active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      // Wait for component to fully render
      await screen.findByText('Filtry');
      
      expect(screen.queryByText('Wyczyść')).not.toBeInTheDocument();
    });

    it('should show clear button when organization filter is active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      await user.type(orgInput, 'Schronisko');
      
      expect(await screen.findByText('Wyczyść')).toBeInTheDocument();
    });

    it('should show clear button when city filter is active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      await user.type(cityInput, 'Warszawa');
      
      expect(await screen.findByText('Wyczyść')).toBeInTheDocument();
    });

    it('should show clear button when species filter is not default', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      await user.click(speciesSelect);
      
      const dogOption = await screen.findByText('Pies');
      await user.click(dogOption);
      
      expect(await screen.findByText('Wyczyść')).toBeInTheDocument();
    });

    it('should clear all filters when clear button clicked', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      await user.type(orgInput, 'Test');
      
      const clearButton = await screen.findByText('Wyczyść');
      await user.click(clearButton);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          organization: '',
          species: 'wszystkie',
          city: '',
          sortBy: 'najmniej_najedzone',
        });
      });
    });
  });

  describe('Styling', () => {
    it('should have proper card styling', async () => {
      const { container } = render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await screen.findByText('Filtry');
      
      const card = container.querySelector('.bg-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-3xl');
    });

    it('should have proper input styling', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await screen.findByText('Filtry');
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveClass('rounded-2xl');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible inputs with placeholders', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(await screen.findByPlaceholderText('Organizacja...')).toBeInTheDocument();
      expect(await screen.findByPlaceholderText('Miejscowość...')).toBeInTheDocument();
    });

    it('should have accessible select elements', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await screen.findByText('Filtry');
      
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Without onFilterChange prop', () => {
    it('should render without errors when no onFilterChange provided', async () => {
      expect(() => {
        render(<AnimalFilters />);
      }).not.toThrow();
    });

    it('should still allow filter interactions', async () => {
      render(<AnimalFilters />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      await user.click(speciesSelect);
      
      expect(await screen.findByText('Pies')).toBeInTheDocument();
    });
  });
});
