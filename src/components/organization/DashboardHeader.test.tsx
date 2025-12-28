import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';

const mockOrganization = {
  id: 'org-123',
  name: 'Schronisko Psi Raj',
  description: 'Pomagamy zwierzętom od 2010 roku',
  city: 'Warszawa',
  province: 'Mazowieckie',
  contact_email: 'kontakt@psiraj.pl',
  contact_phone: '+48 123 456 789',
  website: 'https://psiraj.pl',
  nip: '1234567890',
  logo_url: 'https://example.com/logo.png',
};

const renderComponent = (props = {}) => {
  const defaultProps = {
    organization: mockOrganization,
    uploadingLogo: false,
    onLogoSelect: vi.fn(),
    onEditClick: vi.fn(),
  };

  return render(
    <BrowserRouter>
      <DashboardHeader {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('DashboardHeader', () => {
  describe('Rendering', () => {
    it('should return null when organization is not provided', () => {
      const { container } = renderComponent({ organization: null });
      expect(container.firstChild).toBeNull();
    });

    it('should render organization name', () => {
      renderComponent();
      expect(screen.getByText('Schronisko Psi Raj')).toBeInTheDocument();
    });

    it('should render organization description', () => {
      renderComponent();
      expect(screen.getByText('Pomagamy zwierzętom od 2010 roku')).toBeInTheDocument();
    });

    it('should render location with city and province', () => {
      renderComponent();
      expect(screen.getByText('Warszawa, Mazowieckie')).toBeInTheDocument();
    });

    it('should render contact email', () => {
      renderComponent();
      expect(screen.getByText('kontakt@psiraj.pl')).toBeInTheDocument();
    });

    it('should render contact phone', () => {
      renderComponent();
      expect(screen.getByText('+48 123 456 789')).toBeInTheDocument();
    });

    it('should render website link', () => {
      renderComponent();
      const websiteLink = screen.getByText('psiraj.pl');
      expect(websiteLink).toHaveAttribute('href', 'https://psiraj.pl');
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });

    it('should render NIP', () => {
      renderComponent();
      expect(screen.getByText('NIP: 1234567890')).toBeInTheDocument();
    });
  });

  describe('Avatar/Logo', () => {
    it('should render avatar with organization initial as fallback', () => {
      renderComponent({ organization: { ...mockOrganization, logo_url: null } });
      expect(screen.getByText('S')).toBeInTheDocument(); // First letter of 'Schronisko'
    });

    it('should have logo upload input', () => {
      renderComponent();
      const input = document.getElementById('logo-upload-dashboard');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('should disable logo input when uploading', () => {
      renderComponent({ uploadingLogo: true });
      const input = document.getElementById('logo-upload-dashboard');
      expect(input).toBeDisabled();
    });

    it('should call onLogoSelect when file is selected', () => {
      const onLogoSelect = vi.fn();
      renderComponent({ onLogoSelect });

      const input = document.getElementById('logo-upload-dashboard') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [new File([], 'test.png')] } });

      expect(onLogoSelect).toHaveBeenCalled();
    });
  });

  describe('Edit Button', () => {
    it('should render edit button', () => {
      renderComponent();
      const editButton = screen.getByRole('button');
      expect(editButton).toBeInTheDocument();
    });

    it('should call onEditClick when edit button is clicked', () => {
      const onEditClick = vi.fn();
      renderComponent({ onEditClick });

      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);

      expect(onEditClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Onboarding', () => {
    it('should show onboarding tooltip when showOnboardingProfile is true', () => {
      renderComponent({ showOnboardingProfile: true });
      expect(screen.getByText('Uzupełnij dane organizacji!')).toBeInTheDocument();
    });

    it('should not show onboarding tooltip when showOnboardingProfile is false', () => {
      renderComponent({ showOnboardingProfile: false });
      expect(screen.queryByText('Uzupełnij dane organizacji!')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should not render city section when city is missing', () => {
      renderComponent({ organization: { ...mockOrganization, city: null } });
      expect(screen.queryByText('Warszawa')).not.toBeInTheDocument();
    });

    it('should not render email section when email is missing', () => {
      renderComponent({ organization: { ...mockOrganization, contact_email: null } });
      expect(screen.queryByText('kontakt@psiraj.pl')).not.toBeInTheDocument();
    });

    it('should not render phone section when phone is missing', () => {
      renderComponent({ organization: { ...mockOrganization, contact_phone: null } });
      expect(screen.queryByText('+48 123 456 789')).not.toBeInTheDocument();
    });

    it('should not render website section when website is missing', () => {
      renderComponent({ organization: { ...mockOrganization, website: null } });
      expect(screen.queryByText('psiraj.pl')).not.toBeInTheDocument();
    });

    it('should not render description when missing', () => {
      renderComponent({ organization: { ...mockOrganization, description: null } });
      expect(screen.queryByText('Pomagamy zwierzętom od 2010 roku')).not.toBeInTheDocument();
    });
  });
});
