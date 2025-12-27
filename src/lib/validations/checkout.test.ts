import { describe, it, expect } from 'vitest';
import { checkoutSchema } from './checkout';

describe('checkoutSchema', () => {
  describe('customerName validation', () => {
    it('should accept valid name', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'J',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('minimum 2 znaki');
      }
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = checkoutSchema.safeParse({
        customerName: longName,
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('za długie');
      }
    });

    it('should trim whitespace from name', () => {
      const result = checkoutSchema.safeParse({
        customerName: '  Jan Kowalski  ',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customerName).toBe('Jan Kowalski');
      }
    });
  });

  describe('customerEmail validation', () => {
    it('should accept valid email', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'not-an-email',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Nieprawidłowy adres email');
      }
    });

    it('should reject email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: longEmail,
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('za długi');
      }
    });

    it('should trim whitespace from email', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: '  jan@example.com  ',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customerEmail).toBe('jan@example.com');
      }
    });
  });

  describe('password validation', () => {
    it('should accept empty password (guest checkout)', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept valid password (6+ characters)', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: 'secret123',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 6 characters (if provided)', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '12345',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('minimum 6 znaków');
      }
    });

    it('should reject password longer than 72 characters', () => {
      const longPassword = 'a'.repeat(73);
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: longPassword,
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('za długie');
      }
    });
  });

  describe('consent validation', () => {
    it('should require acceptTerms to be true', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: false,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('regulamin');
      }
    });

    it('should require acceptPrivacy to be true', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: false,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('prywatności');
      }
    });

    it('should require acceptDataProcessing to be true', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: false,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('przetwarzanie danych');
      }
    });

    it('should allow newsletter to be false', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should allow newsletter to be true', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: '',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: true,
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('complete form validation', () => {
    it('should accept valid complete form data', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'Jan Kowalski',
        customerEmail: 'jan@example.com',
        password: 'secret123',
        acceptTerms: true,
        acceptPrivacy: true,
        acceptDataProcessing: true,
        newsletter: true,
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          customerName: 'Jan Kowalski',
          customerEmail: 'jan@example.com',
          password: 'secret123',
          acceptTerms: true,
          acceptPrivacy: true,
          acceptDataProcessing: true,
          newsletter: true,
        });
      }
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      const result = checkoutSchema.safeParse({
        customerName: 'J',
        customerEmail: 'invalid',
        password: '123',
        acceptTerms: false,
        acceptPrivacy: false,
        acceptDataProcessing: false,
        newsletter: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(1);
      }
    });
  });
});
