import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render footer element', () => {
      renderFooter();
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should render logo', () => {
      renderFooter();
      
      // Logo component should be rendered
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should render description text', () => {
      renderFooter();
      
      expect(screen.getByText(/Platforma umożliwiająca wspieranie zwierząt/i)).toBeInTheDocument();
    });

    it('should render copyright notice', () => {
      renderFooter();
      
      expect(screen.getByText(/2024 Pączki w Maśle/i)).toBeInTheDocument();
      expect(screen.getByText(/Wszystkie prawa zastrzeżone/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Section', () => {
    it('should render "Nawigacja" heading', () => {
      renderFooter();
      
      expect(screen.getByText('Nawigacja')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderFooter();
      
      expect(screen.getByRole('link', { name: 'O nas' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Jak to działa?' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Organizacje' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Kontakt' })).toBeInTheDocument();
    });

    it('should have correct hrefs for navigation links', () => {
      renderFooter();
      
      expect(screen.getByRole('link', { name: 'O nas' })).toHaveAttribute('href', '/o-nas');
      expect(screen.getByRole('link', { name: 'Jak to działa?' })).toHaveAttribute('href', '/#jak-to-dziala');
      expect(screen.getByRole('link', { name: 'Organizacje' })).toHaveAttribute('href', '/organizacje');
      expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt');
    });
  });

  describe('Help Section', () => {
    it('should render "Pomoc" heading', () => {
      renderFooter();
      
      expect(screen.getByText('Pomoc')).toBeInTheDocument();
    });

    it('should render help links', () => {
      renderFooter();
      
      expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Regulamin' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Prywatność' })).toBeInTheDocument();
    });

    it('should have correct hrefs for help links', () => {
      renderFooter();
      
      expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq');
      expect(screen.getByRole('link', { name: 'Regulamin' })).toHaveAttribute('href', '/regulamin');
      expect(screen.getByRole('link', { name: 'Prywatność' })).toHaveAttribute('href', '/prywatnosc');
    });
  });

  describe('Accessibility', () => {
    it('should have proper footer landmark', () => {
      renderFooter();
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have all links accessible', () => {
      renderFooter();
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(7); // 4 navigation + 3 help links
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have proper heading structure', () => {
      renderFooter();
      
      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings.length).toBe(2); // "Nawigacja" and "Pomoc"
    });
  });

  describe('Styling', () => {
    it('should have proper background styling', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-foreground/5');
    });

    it('should have proper padding', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('py-12');
    });
  });

  describe('Grid Layout', () => {
    it('should use grid layout', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      const gridContainer = footer.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should be responsive with md breakpoint', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      const gridContainer = footer.querySelector('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-4');
    });
  });

  describe('Link Interactions', () => {
    it('should have hover styles on links', () => {
      renderFooter();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('hover:text-primary');
      });
    });

    it('should have transition styles on links', () => {
      renderFooter();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('transition-colors');
      });
    });
  });

  describe('Content Structure', () => {
    it('should have description in first column spanning 2 cols on md', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      const descriptionCol = footer.querySelector('.md\\:col-span-2');
      expect(descriptionCol).toBeInTheDocument();
    });

    it('should have border above copyright', () => {
      renderFooter();
      
      const footer = screen.getByRole('contentinfo');
      const copyrightSection = footer.querySelector('.border-t');
      expect(copyrightSection).toBeInTheDocument();
    });
  });
});

describe('Footer - SEO', () => {
  it('should have meaningful link text', () => {
    renderFooter();
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link.textContent).not.toBe('');
      expect(link.textContent?.toLowerCase()).not.toBe('click here');
      expect(link.textContent?.toLowerCase()).not.toBe('read more');
    });
  });

  it('should have descriptive section headings', () => {
    renderFooter();
    
    expect(screen.getByText('Nawigacja')).toBeInTheDocument();
    expect(screen.getByText('Pomoc')).toBeInTheDocument();
  });
});

describe('Footer - Legal Links', () => {
  it('should include privacy policy link', () => {
    renderFooter();
    
    const privacyLink = screen.getByRole('link', { name: 'Prywatność' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/prywatnosc');
  });

  it('should include terms link', () => {
    renderFooter();
    
    const termsLink = screen.getByRole('link', { name: 'Regulamin' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/regulamin');
  });
});
