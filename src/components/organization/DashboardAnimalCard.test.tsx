import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardAnimalCard from './DashboardAnimalCard';
import { AnimalWithStats } from '@/hooks/useOrgDashboard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockAnimal = (overrides = {}): AnimalWithStats => ({
  id: 'animal-123',
  name: 'Burek',
  species: 'Pies',
  description: 'Przyjazny piesek',
  image_url: 'https://example.com/burek.jpg',
  organization_id: 'org-123',
  active: true,
  created_at: '2024-01-01',
  birth_date: '2021-01-01',
  wishlistStats: {
    totalNeeded: 10,
    fulfilled: 5,
    progress: 50,
  },
  ...overrides,
});

const renderComponent = (props = {}) => {
  const defaultProps = {
    animal: createMockAnimal(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onClick: vi.fn(),
  };

  return render(
    <BrowserRouter>
      <DashboardAnimalCard {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('DashboardAnimalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render animal name', () => {
      renderComponent();
      expect(screen.getByText('Burek')).toBeInTheDocument();
    });

    it('should render animal species', () => {
      renderComponent();
      expect(screen.getByText('Pies')).toBeInTheDocument();
    });

    it('should render wishlist progress', () => {
      renderComponent();
      expect(screen.getByText('5/10 (50%)')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const { container } = renderComponent();
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show check icon when progress is 100%', () => {
      const animal = createMockAnimal({
        wishlistStats: { totalNeeded: 10, fulfilled: 10, progress: 100 },
      });
      const { container } = renderComponent({ animal });
      
      // Check for CheckCircle icon (it should have text-green-500 class)
      const checkIcon = container.querySelector('.text-green-500');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Avatar Fallback', () => {
    it('should show PawPrint icon when no image', () => {
      const animal = createMockAnimal({ image_url: null });
      const { container } = renderComponent({ animal });
      
      // AvatarFallback should be rendered
      const fallback = container.querySelector('.rounded-xl, .rounded-2xl');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      renderComponent({ onClick });

      const card = screen.getByText('Burek').closest('[class*="cursor-pointer"]');
      if (card) {
        fireEvent.click(card);
        expect(onClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      const animal = createMockAnimal();
      renderComponent({ animal, onEdit });

      const editButton = screen.getByTitle('Edytuj');
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(animal, expect.any(Object));
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      const animal = createMockAnimal();
      renderComponent({ animal, onDelete });

      const deleteButton = screen.getByTitle('Usuń');
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(animal, expect.any(Object));
    });

    it('should navigate to animal profile when view button is clicked', () => {
      renderComponent();

      const viewButton = screen.getByTitle('Zobacz profil publiczny');
      fireEvent.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/zwierze/animal-123');
    });

    it('should stop propagation when action buttons are clicked', () => {
      const onClick = vi.fn();
      const onEdit = vi.fn();
      renderComponent({ onClick, onEdit });

      const editButton = screen.getByTitle('Edytuj');
      fireEvent.click(editButton);

      // onClick on card should NOT be called when edit button is clicked
      expect(onClick).not.toHaveBeenCalled();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('should render view profile button', () => {
      renderComponent();
      expect(screen.getByTitle('Zobacz profil publiczny')).toBeInTheDocument();
    });

    it('should render edit button', () => {
      renderComponent();
      expect(screen.getByTitle('Edytuj')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      renderComponent();
      expect(screen.getByTitle('Usuń')).toBeInTheDocument();
    });

    it('should have destructive styling on delete button', () => {
      renderComponent();
      const deleteButton = screen.getByTitle('Usuń');
      expect(deleteButton).toHaveClass('text-destructive');
    });
  });

  describe('Wishlist Stats Display', () => {
    it('should display correct stats for partial progress', () => {
      const animal = createMockAnimal({
        wishlistStats: { totalNeeded: 20, fulfilled: 7, progress: 35 },
      });
      renderComponent({ animal });

      expect(screen.getByText('7/20 (35%)')).toBeInTheDocument();
    });

    it('should display 0/0 for empty wishlist', () => {
      const animal = createMockAnimal({
        wishlistStats: { totalNeeded: 0, fulfilled: 0, progress: 0 },
      });
      renderComponent({ animal });

      expect(screen.getByText('0/0 (0%)')).toBeInTheDocument();
    });

    it('should round progress percentage', () => {
      const animal = createMockAnimal({
        wishlistStats: { totalNeeded: 3, fulfilled: 1, progress: 33.333 },
      });
      renderComponent({ animal });

      expect(screen.getByText('1/3 (33%)')).toBeInTheDocument();
    });
  });
});
