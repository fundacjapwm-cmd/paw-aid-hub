import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  describe('Rendering', () => {
    it('should render logo image', () => {
      render(<Logo />);
      const logo = screen.getByRole('img');
      expect(logo).toBeInTheDocument();
    });

    it('should have correct alt text', () => {
      render(<Logo />);
      const logo = screen.getByAltText('Pączki w Maśle');
      expect(logo).toBeInTheDocument();
    });

    it('should have correct src', () => {
      render(<Logo />);
      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('src', '/logo.svg');
    });
  });

  describe('Styling', () => {
    it('should have default classes', () => {
      render(<Logo />);
      const logo = screen.getByRole('img');
      expect(logo).toHaveClass('h-auto');
      expect(logo).toHaveClass('w-auto');
    });

    it('should accept custom className', () => {
      render(<Logo className="custom-class h-10" />);
      const logo = screen.getByRole('img');
      expect(logo).toHaveClass('custom-class');
      expect(logo).toHaveClass('h-10');
    });
  });

  describe('Accessibility', () => {
    it('should have proper img role', () => {
      render(<Logo />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should have non-empty alt text', () => {
      render(<Logo />);
      const logo = screen.getByRole('img');
      expect(logo.getAttribute('alt')).not.toBe('');
    });
  });
});
