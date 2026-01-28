import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CheckoutPaymentForm } from '@/components/checkout/CheckoutPaymentForm';

// Mock react-router-dom Link
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('CheckoutPaymentForm', () => {
  const defaultProps = {
    user: null,
    loading: false,
    cartTotal: 150.00,
    customerName: '',
    setCustomerName: vi.fn(),
    customerEmail: '',
    setCustomerEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    acceptTerms: false,
    setAcceptTerms: vi.fn(),
    acceptPrivacy: false,
    setAcceptPrivacy: vi.fn(),
    acceptDataProcessing: false,
    setAcceptDataProcessing: vi.fn(),
    newsletter: false,
    setNewsletter: vi.fn(),
    allConsentsChecked: false,
    onSelectAll: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    onTestSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <CheckoutPaymentForm {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      renderForm();
      
      expect(screen.getByLabelText(/Imię i nazwisko/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Dane do płatności/i)).toBeInTheDocument();
    });

    it('should show password field when user is not logged in', () => {
      renderForm({ user: null });
      
      expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument();
    });

    it('should hide password field when user is logged in', () => {
      renderForm({ user: { id: 'user-1', email: 'test@example.com' } });
      
      expect(screen.queryByLabelText(/Hasło/i)).not.toBeInTheDocument();
    });

    it('should disable email field when user is logged in', () => {
      renderForm({ user: { id: 'user-1', email: 'test@example.com' } });
      
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toBeDisabled();
    });

    it('should display cart total in submit button', () => {
      renderForm({ cartTotal: 250.50 });
      
      expect(screen.getByRole('button', { name: /Zapłać 250.50 zł/i })).toBeInTheDocument();
    });

    it('should show test button when onTestSubmit is provided', () => {
      renderForm();
      
      expect(screen.getByRole('button', { name: /Zapłać Test/i })).toBeInTheDocument();
    });

    it('should not show test button when onTestSubmit is not provided', () => {
      renderForm({ onTestSubmit: undefined });
      
      expect(screen.queryByRole('button', { name: /Zapłać Test/i })).not.toBeInTheDocument();
    });
  });

  describe('Checkboxes', () => {
    it('should render all consent checkboxes', () => {
      renderForm();
      
      expect(screen.getByLabelText(/Zaznacz wszystkie zgody/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/przetwarzanie moich danych/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/regulamin platformy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/politykę prywatności/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/newsletter/i)).toBeInTheDocument();
    });

    it('should call onSelectAll when "select all" is clicked', () => {
      const onSelectAll = vi.fn();
      renderForm({ onSelectAll });
      
      const selectAllCheckbox = screen.getByLabelText(/Zaznacz wszystkie zgody/i);
      fireEvent.click(selectAllCheckbox);
      
      expect(onSelectAll).toHaveBeenCalledWith(true);
    });

    it('should call setAcceptTerms when terms checkbox is clicked', () => {
      const setAcceptTerms = vi.fn();
      renderForm({ setAcceptTerms });
      
      const termsCheckbox = screen.getByLabelText(/regulamin platformy/i);
      fireEvent.click(termsCheckbox);
      
      expect(setAcceptTerms).toHaveBeenCalledWith(true);
    });

    it('should call setAcceptPrivacy when privacy checkbox is clicked', () => {
      const setAcceptPrivacy = vi.fn();
      renderForm({ setAcceptPrivacy });
      
      const privacyCheckbox = screen.getByLabelText(/politykę prywatności/i);
      fireEvent.click(privacyCheckbox);
      
      expect(setAcceptPrivacy).toHaveBeenCalledWith(true);
    });

    it('should call setAcceptDataProcessing when data processing checkbox is clicked', () => {
      const setAcceptDataProcessing = vi.fn();
      renderForm({ setAcceptDataProcessing });
      
      const dataCheckbox = screen.getByLabelText(/przetwarzanie moich danych/i);
      fireEvent.click(dataCheckbox);
      
      expect(setAcceptDataProcessing).toHaveBeenCalledWith(true);
    });

    it('should call setNewsletter when newsletter checkbox is clicked', () => {
      const setNewsletter = vi.fn();
      renderForm({ setNewsletter });
      
      const newsletterCheckbox = screen.getByLabelText(/newsletter/i);
      fireEvent.click(newsletterCheckbox);
      
      expect(setNewsletter).toHaveBeenCalledWith(true);
    });

    it('should show checkboxes as checked when props are true', () => {
      renderForm({
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: true,
        allConsentsChecked: true,
      });
      
      expect(screen.getByLabelText(/Zaznacz wszystkie zgody/i)).toBeChecked();
      expect(screen.getByLabelText(/regulamin platformy/i)).toBeChecked();
      expect(screen.getByLabelText(/politykę prywatności/i)).toBeChecked();
      expect(screen.getByLabelText(/przetwarzanie moich danych/i)).toBeChecked();
      expect(screen.getByLabelText(/newsletter/i)).toBeChecked();
    });
  });

  describe('Input handling', () => {
    it('should call setCustomerName when name input changes', () => {
      const setCustomerName = vi.fn();
      renderForm({ setCustomerName });
      
      const nameInput = screen.getByLabelText(/Imię i nazwisko/i);
      fireEvent.change(nameInput, { target: { value: 'Jan Kowalski' } });
      
      expect(setCustomerName).toHaveBeenCalledWith('Jan Kowalski');
    });

    it('should call setCustomerEmail when email input changes', () => {
      const setCustomerEmail = vi.fn();
      renderForm({ setCustomerEmail });
      
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'jan@example.com' } });
      
      expect(setCustomerEmail).toHaveBeenCalledWith('jan@example.com');
    });

    it('should call setPassword when password input changes', () => {
      const setPassword = vi.fn();
      renderForm({ setPassword, user: null });
      
      const passwordInput = screen.getByLabelText(/Hasło/i);
      fireEvent.change(passwordInput, { target: { value: 'secret123' } });
      
      expect(setPassword).toHaveBeenCalledWith('secret123');
    });

    it('should display current values in inputs', () => {
      renderForm({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: 'secret',
        user: null,
      });
      
      expect(screen.getByLabelText(/Imię i nazwisko/i)).toHaveValue('Jan Kowalski');
      expect(screen.getByLabelText(/Email/i)).toHaveValue('jan@example.com');
      expect(screen.getByLabelText(/Hasło/i)).toHaveValue('secret');
    });
  });

  describe('Form submission', () => {
    it('should call onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      renderForm({ 
        onSubmit,
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        allConsentsChecked: true,
      });
      
      const submitButton = screen.getByRole('button', { name: /Zapłać 150.00 zł/i });
      fireEvent.click(submitButton);
      
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should call onTestSubmit when test button is clicked', () => {
      const onTestSubmit = vi.fn();
      renderForm({ onTestSubmit });
      
      const testButton = screen.getByRole('button', { name: /Zapłać Test/i });
      fireEvent.click(testButton);
      
      expect(onTestSubmit).toHaveBeenCalled();
    });

    it('should disable submit button when loading', () => {
      renderForm({ loading: true });
      
      const submitButton = screen.getByRole('button', { name: /Przetwarzanie/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable test button when loading', () => {
      renderForm({ loading: true });
      
      const testButton = screen.getByRole('button', { name: /Zapłać Test/i });
      expect(testButton).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      renderForm({ 
        loading: true,
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        allConsentsChecked: true,
      });
      
      expect(screen.getByRole('button', { name: /Przetwarzanie/i })).toBeInTheDocument();
    });
  });

  describe('Input validation attributes', () => {
    it('should have required attribute on name input', () => {
      renderForm();
      
      const nameInput = screen.getByLabelText(/Imię i nazwisko/i);
      expect(nameInput).toHaveAttribute('required');
    });

    it('should have required attribute on email input', () => {
      renderForm();
      
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have maxLength on name input', () => {
      renderForm();
      
      const nameInput = screen.getByLabelText(/Imię i nazwisko/i);
      expect(nameInput).toHaveAttribute('maxLength', '100');
    });

    it('should have maxLength on email input', () => {
      renderForm();
      
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute('maxLength', '255');
    });

    it('should have maxLength on password input', () => {
      renderForm({ user: null });
      
      const passwordInput = screen.getByLabelText(/Hasło/i);
      expect(passwordInput).toHaveAttribute('maxLength', '72');
    });

    it('should have type email on email input', () => {
      renderForm();
      
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have type password on password input', () => {
      renderForm({ user: null });
      
      const passwordInput = screen.getByLabelText(/Hasło/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Links', () => {
    it('should have link to terms page', () => {
      renderForm();
      
      const termsLink = screen.getByText('regulamin platformy');
      expect(termsLink).toHaveAttribute('href', '/regulamin');
    });

    it('should have link to privacy policy page', () => {
      renderForm();
      
      const privacyLink = screen.getByText('politykę prywatności');
      expect(privacyLink).toHaveAttribute('href', '/prywatnosc');
    });
  });

  describe('HotPay info', () => {
    it('should display HotPay payment info', () => {
      renderForm();
      
      expect(screen.getByText(/Płatność zostanie przetworzona przez HotPay/i)).toBeInTheDocument();
      expect(screen.getByText(/Bezpieczna płatność zabezpieczona przez HotPay/i)).toBeInTheDocument();
    });
  });
});
