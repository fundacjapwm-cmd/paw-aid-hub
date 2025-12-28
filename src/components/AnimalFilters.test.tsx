import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { act } from '@testing-library/react';

// Mock Supabase client
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
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockNot = vi.fn();

// Recursive mock builder pattern
const createMockQueryBuilder = (data: unknown) => {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (value: { data: unknown; error: null }) => void) => {
      return Promise.resolve({ data, error: null }).then(resolve);
    }),
  };
  
  // Chain returns
  ['select', 'eq', 'neq', 'order', 'not', 'in'].forEach(method => {
    (builder[method] as ReturnType<typeof vi.fn>).mockImplementation((...args: unknown[]) => {
      if (method === 'select') mockSelect(args[0]);
      if (method === 'eq') mockEq(args[0], args[1]);
      if (method === 'order') mockOrder(args[0]);
      if (method === 'not') mockNot(args[0], args[1], args[2]);
      return builder;
    });
  });
  
  return builder;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      mockSupabaseFrom(table);
      if (table === 'organizations') {
        return createMockQueryBuilder(mockOrganizations);
      }
      return createMockQueryBuilder(mockCities);
    },
  },
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnimalFilters from './AnimalFilters';

describe('AnimalFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter section with title', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        expect(screen.getByText('Filtry')).toBeInTheDocument();
      });
    });

    it('should render organization input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Organizacja...')).toBeInTheDocument();
      });
    });

    it('should render city input', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Miejscowość...')).toBeInTheDocument();
      });
    });

    it('should render species select', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        expect(screen.getByText('Wszystkie zwierzęta')).toBeInTheDocument();
      });
    });

    it('should render sort select', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        expect(screen.getByText(/Brzuszek: od najmniej najedzonych/i)).toBeInTheDocument();
      });
    });

    it('should render filter icon', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      await waitFor(() => {
        const filterSection = screen.getByText('Filtry').closest('div');
        expect(filterSection).toBeInTheDocument();
      });
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
      
      await act(async () => {
        fireEvent.click(speciesSelect);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Pies')).toBeInTheDocument();
        expect(screen.getByText('Kot')).toBeInTheDocument();
        expect(screen.getByText('Inne')).toBeInTheDocument();
      });
    });

    it('should call onFilterChange when species selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      
      await act(async () => {
        fireEvent.click(speciesSelect);
      });
      
      const dogOption = await screen.findByText('Pies');
      
      await act(async () => {
        fireEvent.click(dogOption);
      });
      
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
      
      await act(async () => {
        fireEvent.click(sortSelect);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Najnowsze')).toBeInTheDocument();
        expect(screen.getByText('Najstarsze')).toBeInTheDocument();
        expect(screen.getByText('Alfabetycznie A-Z')).toBeInTheDocument();
      });
    });

    it('should call onFilterChange when sort option selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = await screen.findByText(/Brzuszek: od najmniej najedzonych/i);
      
      await act(async () => {
        fireEvent.click(sortSelect);
      });
      
      const newestOption = await screen.findByText('Najnowsze');
      
      await act(async () => {
        fireEvent.click(newestOption);
      });
      
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
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      
      await act(async () => {
        await user.type(cityInput, 'War');
      });
      
      expect(cityInput).toHaveValue('War');
    });

    it('should call onFilterChange when city typed', async () => {
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      
      await act(async () => {
        await user.type(cityInput, 'Warszawa');
      });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            city: expect.stringContaining('Warszawa'),
          })
        );
      });
    });
  });

  describe('Organization Filter', () => {
    it('should allow typing in organization input', async () => {
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      
      await act(async () => {
        await user.type(orgInput, 'Sch');
      });
      
      expect(orgInput).toHaveValue('Sch');
    });
  });

  describe('Clear Filters', () => {
    it('should not show clear button when no filters active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Wyczyść')).not.toBeInTheDocument();
      });
    });

    it('should show clear button when organization filter is active', async () => {
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      
      await act(async () => {
        await user.type(orgInput, 'Schronisko');
      });
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should show clear button when city filter is active', async () => {
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = await screen.findByPlaceholderText('Miejscowość...');
      
      await act(async () => {
        await user.type(cityInput, 'Warszawa');
      });
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should show clear button when species filter is not default', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = await screen.findByText('Wszystkie zwierzęta');
      
      await act(async () => {
        fireEvent.click(speciesSelect);
      });
      
      const dogOption = await screen.findByText('Pies');
      
      await act(async () => {
        fireEvent.click(dogOption);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = await screen.findByPlaceholderText('Organizacja...');
      
      await act(async () => {
        await user.type(orgInput, 'Test');
      });
      
      const clearButton = await screen.findByText('Wyczyść');
      
      await act(async () => {
        fireEvent.click(clearButton);
      });
      
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
      
      await waitFor(() => {
        const card = container.querySelector('.bg-card');
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass('rounded-3xl');
      });
    });

    it('should have proper input styling', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        inputs.forEach(input => {
          expect(input).toHaveClass('rounded-2xl');
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible inputs with placeholders', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Organizacja...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Miejscowość...')).toBeInTheDocument();
      });
    });

    it('should have accessible select elements', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      await waitFor(() => {
        const comboboxes = screen.getAllByRole('combobox');
        expect(comboboxes.length).toBeGreaterThan(0);
      });
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
      
      await act(async () => {
        fireEvent.click(speciesSelect);
      });
      
      await waitFor(() => {
        const dogOption = screen.getByText('Pies');
        expect(dogOption).toBeInTheDocument();
      });
    });
  });
});
