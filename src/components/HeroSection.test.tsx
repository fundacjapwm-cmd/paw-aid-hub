import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock image imports
vi.mock('@/assets/hero-cat1.png', () => ({ default: '/mock-cat1.png' }));
vi.mock('@/assets/hero-catdog.png', () => ({ default: '/mock-catdog.png' }));
vi.mock('@/assets/hero-dog1.png', () => ({ default: '/mock-dog1.png' }));
vi.mock('@/assets/hero-dog2.png', () => ({ default: '/mock-dog2.png' }));

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from './HeroSection';

const renderHeroSection = () => {
  return render(
    <BrowserRouter>
      <HeroSection />
    </BrowserRouter>
  );
};

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render main heading', () => {
      renderHeroSection();
      expect(screen.getByText(/Odmień życie/i)).toBeInTheDocument();
      expect(screen.getByText(/bezdomniaczka/i)).toBeInTheDocument();
    });

    it('should render catchy tagline', () => {
      renderHeroSection();
      expect(screen.getByText(/kup mu smaczka!/i)).toBeInTheDocument();
    });

    it('should render description paragraph', () => {
      renderHeroSection();
      expect(screen.getByText(/Karma wraca!/i)).toBeInTheDocument();
      expect(screen.getByText(/Wspieraj zwierzęta i organizacje/i)).toBeInTheDocument();
    });

    it('should render CTA buttons', () => {
      renderHeroSection();
      expect(screen.getByRole('button', { name: /Wybierz zwierzaka/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Jak to działa\?/i })).toBeInTheDocument();
    });

    it('should have section element with proper classes', () => {
      renderHeroSection();
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('bg-hero');
    });
  });

  describe('Interactions', () => {
    it('should navigate to animals page on primary CTA click', () => {
      renderHeroSection();
      
      const ctaButton = screen.getByRole('button', { name: /Wybierz zwierzaka/i });
      fireEvent.click(ctaButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/zwierzeta');
    });

    it('should have anchor link to how-it-works section', () => {
      renderHeroSection();
      
      const howItWorksLink = screen.getByRole('link', { name: /Jak to działa\?/i });
      expect(howItWorksLink).toHaveAttribute('href', '#jak-to-dziala');
    });
  });

  describe('Styling', () => {
    it('should have proper button styling for primary CTA', () => {
      renderHeroSection();
      
      const primaryButton = screen.getByRole('button', { name: /Wybierz zwierzaka/i });
      expect(primaryButton).toHaveClass('bg-accent');
    });

    it('should have proper button styling for secondary CTA', () => {
      renderHeroSection();
      
      const secondaryButton = screen.getByRole('button', { name: /Jak to działa\?/i });
      expect(secondaryButton).toHaveClass('bg-secondary');
    });
  });

  describe('Accessibility', () => {
    it('should have h1 heading', () => {
      renderHeroSection();
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderHeroSection();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });
});
