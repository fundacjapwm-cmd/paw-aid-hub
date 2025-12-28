import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrganizationInfoCard } from './OrganizationInfoCard';
import { Organization } from '@/hooks/useOrganizationProfile';

const createMockOrganization = (overrides = {}): Organization => ({
  id: 'org-123',
  name: 'Schronisko Psi Raj',
  slug: 'psi-raj',
  description: 'Pomagamy zwierzętom',
  city: 'Warszawa',
  province: 'Mazowieckie',
  contact_email: 'kontakt@psiraj.pl',
  contact_phone: '+48 123 456 789',
  website: 'https://psiraj.pl',
  logo_url: 'https://example.com/logo.png',
  ...overrides,
});

const renderComponent = (props = {}) => {
  const defaultProps = {
    organization: createMockOrganization(),
    animalsCount: 15,
    isLoggedIn: false,
  };

  return render(<OrganizationInfoCard {...defaultProps} {...props} />);
};

describe('OrganizationInfoCard', () => {
  describe('Rendering', () => {
    it('should render card title', () => {
      renderComponent();
      expect(screen.getByText('Dane organizacji')).toBeInTheDocument();
    });

    it('should render location when city is provided', () => {
      renderComponent();
      expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
      expect(screen.getByText('Warszawa, Mazowieckie')).toBeInTheDocument();
    });

    it('should render only city when province is missing', () => {
      renderComponent({ organization: createMockOrganization({ province: null }) });
      expect(screen.getByText('Warszawa')).toBeInTheDocument();
    });

    it('should not render location section when city is missing', () => {
      renderComponent({ organization: createMockOrganization({ city: null }) });
      expect(screen.queryByText('Lokalizacja')).not.toBeInTheDocument();
    });

    it('should render animals count', () => {
      renderComponent({ animalsCount: 25 });
      expect(screen.getByText('Podopieczni')).toBeInTheDocument();
      expect(screen.getByText('25 zwierzaków')).toBeInTheDocument();
    });

    it('should render join date section', () => {
      renderComponent();
      expect(screen.getByText('Z nami od')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });
  });

  describe('Contact Info - Logged Out', () => {
    it('should not show phone when logged out', () => {
      renderComponent({ isLoggedIn: false });
      expect(screen.queryByText('Telefon')).not.toBeInTheDocument();
      expect(screen.queryByText('+48 123 456 789')).not.toBeInTheDocument();
    });

    it('should not show email when logged out', () => {
      renderComponent({ isLoggedIn: false });
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
      expect(screen.queryByText('kontakt@psiraj.pl')).not.toBeInTheDocument();
    });
  });

  describe('Contact Info - Logged In', () => {
    it('should show phone when logged in', () => {
      renderComponent({ isLoggedIn: true });
      expect(screen.getByText('Telefon')).toBeInTheDocument();
      expect(screen.getByText('+48 123 456 789')).toBeInTheDocument();
    });

    it('should show email when logged in', () => {
      renderComponent({ isLoggedIn: true });
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('kontakt@psiraj.pl')).toBeInTheDocument();
    });

    it('should render phone as link', () => {
      renderComponent({ isLoggedIn: true });
      const phoneLink = screen.getByText('+48 123 456 789');
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+48 123 456 789');
    });

    it('should render email as link', () => {
      renderComponent({ isLoggedIn: true });
      const emailLink = screen.getByText('kontakt@psiraj.pl');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:kontakt@psiraj.pl');
    });

    it('should not show phone section when phone is missing', () => {
      renderComponent({ 
        isLoggedIn: true, 
        organization: createMockOrganization({ contact_phone: null }) 
      });
      expect(screen.queryByText('Telefon')).not.toBeInTheDocument();
    });

    it('should not show email section when email is missing', () => {
      renderComponent({ 
        isLoggedIn: true, 
        organization: createMockOrganization({ contact_email: null }) 
      });
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderComponent();
      const heading = screen.getByText('Dane organizacji');
      expect(heading.tagName).toBe('H3');
    });
  });
});
