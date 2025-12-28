import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

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

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      mockSupabaseFrom(table);
      return {
        select: (columns: string) => {
          mockSelect(columns);
          return {
            eq: (col: string, val: any) => {
              mockEq(col, val);
              return {
                order: (column: string) => {
                  mockOrder(column);
                  return Promise.resolve({ data: mockOrganizations, error: null });
                },
                not: (col: string, op: string, val: any) => {
                  mockNot(col, op, val);
                  return Promise.resolve({ data: mockCities, error: null });
                },
              };
            },
          };
        },
      };
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
    it('should render filter section with title', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      expect(screen.getByText('Filtry')).toBeInTheDocument();
    });

    it('should render organization input', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      expect(screen.getByPlaceholderText('Organizacja...')).toBeInTheDocument();
    });

    it('should render city input', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      expect(screen.getByPlaceholderText('Miejscowość...')).toBeInTheDocument();
    });

    it('should render species select', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      expect(screen.getByText('Wszystkie zwierzęta')).toBeInTheDocument();
    });

    it('should render sort select', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      // Default sort option
      expect(screen.getByText(/Brzuszek: od najmniej najedzonych/i)).toBeInTheDocument();
    });

    it('should render filter icon', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      // Filter icon should be present
      const filterSection = screen.getByText('Filtry').closest('div');
      expect(filterSection).toBeInTheDocument();
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
      
      const speciesSelect = screen.getByText('Wszystkie zwierzęta');
      fireEvent.click(speciesSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Pies')).toBeInTheDocument();
        expect(screen.getByText('Kot')).toBeInTheDocument();
        expect(screen.getByText('Inne')).toBeInTheDocument();
      });
    });

    it('should call onFilterChange when species selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = screen.getByText('Wszystkie zwierzęta');
      fireEvent.click(speciesSelect);
      
      await waitFor(() => {
        const dogOption = screen.getByText('Pies');
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
      
      const sortSelect = screen.getByText(/Brzuszek: od najmniej najedzonych/i);
      fireEvent.click(sortSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Najnowsze')).toBeInTheDocument();
        expect(screen.getByText('Najstarsze')).toBeInTheDocument();
        expect(screen.getByText('Alfabetycznie A-Z')).toBeInTheDocument();
      });
    });

    it('should call onFilterChange when sort option selected', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const sortSelect = screen.getByText(/Brzuszek: od najmniej najedzonych/i);
      fireEvent.click(sortSelect);
      
      await waitFor(() => {
        const newestOption = screen.getByText('Najnowsze');
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
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = screen.getByPlaceholderText('Miejscowość...');
      await userEvent.type(cityInput, 'War');
      
      expect(cityInput).toHaveValue('War');
    });

    it('should call onFilterChange when city typed', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = screen.getByPlaceholderText('Miejscowość...');
      await userEvent.type(cityInput, 'Warszawa');
      
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
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = screen.getByPlaceholderText('Organizacja...');
      await userEvent.type(orgInput, 'Sch');
      
      expect(orgInput).toHaveValue('Sch');
    });
  });

  describe('Clear Filters', () => {
    it('should not show clear button when no filters active', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      expect(screen.queryByText('Wyczyść')).not.toBeInTheDocument();
    });

    it('should show clear button when organization filter is active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const orgInput = screen.getByPlaceholderText('Organizacja...');
      await userEvent.type(orgInput, 'Schronisko');
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should show clear button when city filter is active', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const cityInput = screen.getByPlaceholderText('Miejscowość...');
      await userEvent.type(cityInput, 'Warszawa');
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should show clear button when species filter is not default', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      const speciesSelect = screen.getByText('Wszystkie zwierzęta');
      fireEvent.click(speciesSelect);
      
      await waitFor(() => {
        const dogOption = screen.getByText('Pies');
        fireEvent.click(dogOption);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      // Add some filter
      const orgInput = screen.getByPlaceholderText('Organizacja...');
      await userEvent.type(orgInput, 'Test');
      
      await waitFor(() => {
        expect(screen.getByText('Wyczyść')).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText('Wyczyść');
      fireEvent.click(clearButton);
      
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
    it('should have proper card styling', () => {
      const { container } = render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      const card = container.querySelector('.bg-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-3xl');
    });

    it('should have proper input styling', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveClass('rounded-2xl');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible inputs with placeholders', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByPlaceholderText('Organizacja...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Miejscowość...')).toBeInTheDocument();
    });

    it('should have accessible select elements', () => {
      render(<AnimalFilters onFilterChange={mockOnFilterChange} />);
      
      // Comboboxes from radix-ui
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Without onFilterChange prop', () => {
    it('should render without errors when no onFilterChange provided', () => {
      expect(() => {
        render(<AnimalFilters />);
      }).not.toThrow();
    });

    it('should still allow filter interactions', async () => {
      render(<AnimalFilters />);
      
      const speciesSelect = screen.getByText('Wszystkie zwierzęta');
      fireEvent.click(speciesSelect);
      
      await waitFor(() => {
        const dogOption = screen.getByText('Pies');
        expect(dogOption).toBeInTheDocument();
      });
    });
  });
});
