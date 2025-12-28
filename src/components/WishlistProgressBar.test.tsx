import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import WishlistProgressBar from './WishlistProgressBar';

const mockWishlistEmpty: any[] = [];

const mockWishlistNoBought = [
  { id: '1', name: 'Karma', price: 49.99, bought: false },
  { id: '2', name: 'Zabawka', price: 19.99, bought: false },
  { id: '3', name: 'Legowisko', price: 89.99, bought: false },
];

const mockWishlistPartialBought = [
  { id: '1', name: 'Karma', price: 49.99, bought: true },
  { id: '2', name: 'Zabawka', price: 19.99, bought: false },
  { id: '3', name: 'Legowisko', price: 89.99, bought: true },
];

const mockWishlistAllBought = [
  { id: '1', name: 'Karma', price: 49.99, bought: true },
  { id: '2', name: 'Zabawka', price: 19.99, bought: true },
  { id: '3', name: 'Legowisko', price: 89.99, bought: true },
];

describe('WishlistProgressBar', () => {
  describe('Progress Calculation', () => {
    it('should show 0% for empty wishlist', () => {
      render(<WishlistProgressBar wishlist={mockWishlistEmpty} />);
      expect(screen.getByText(/Brzuszek pełny na 0%/i)).toBeInTheDocument();
    });

    it('should show 0% when no items bought', () => {
      render(<WishlistProgressBar wishlist={mockWishlistNoBought} />);
      expect(screen.getByText(/Brzuszek pełny na 0%/i)).toBeInTheDocument();
    });

    it('should show correct percentage for partially bought items', () => {
      render(<WishlistProgressBar wishlist={mockWishlistPartialBought} />);
      // 2 out of 3 = 67%
      expect(screen.getByText(/Brzuszek pełny na 67%/i)).toBeInTheDocument();
    });

    it('should show 100% when all items bought', () => {
      render(<WishlistProgressBar wishlist={mockWishlistAllBought} />);
      expect(screen.getByText(/Brzuszek pełny na 100%/i)).toBeInTheDocument();
    });
  });

  describe('Item Count Display', () => {
    it('should show 0 z 0 for empty wishlist', () => {
      render(<WishlistProgressBar wishlist={mockWishlistEmpty} />);
      expect(screen.getByText(/0 z 0 produktów zakupionych/i)).toBeInTheDocument();
    });

    it('should show correct count for no bought items', () => {
      render(<WishlistProgressBar wishlist={mockWishlistNoBought} />);
      expect(screen.getByText(/0 z 3 produktów zakupionych/i)).toBeInTheDocument();
    });

    it('should show correct count for partially bought items', () => {
      render(<WishlistProgressBar wishlist={mockWishlistPartialBought} />);
      expect(screen.getByText(/2 z 3 produktów zakupionych/i)).toBeInTheDocument();
    });

    it('should show correct count for all bought items', () => {
      render(<WishlistProgressBar wishlist={mockWishlistAllBought} />);
      expect(screen.getByText(/3 z 3 produktów zakupionych/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have container with proper styling', () => {
      const { container } = render(<WishlistProgressBar wishlist={mockWishlistNoBought} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('rounded-2xl');
    });

    it('should have progress bar element', () => {
      const { container } = render(<WishlistProgressBar wishlist={mockWishlistPartialBought} />);
      const progressBar = container.querySelector('.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode without errors', () => {
      render(<WishlistProgressBar wishlist={mockWishlistPartialBought} compact={true} />);
      expect(screen.getByText(/Brzuszek pełny na 67%/i)).toBeInTheDocument();
    });
  });
});
