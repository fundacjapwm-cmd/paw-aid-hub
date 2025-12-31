import { z } from 'zod';

// Polish postal code regex: XX-XXX format
const postalCodeRegex = /^\d{2}-\d{3}$/;

export const profileSchema = z.object({
  display_name: z.string().trim().max(100, 'Nazwa wyświetlana za długa').optional().or(z.literal('')),
  first_name: z.string().trim().max(50, 'Imię za długie').optional().or(z.literal('')),
  last_name: z.string().trim().max(50, 'Nazwisko za długie').optional().or(z.literal('')),
  billing_address: z.string().trim().max(200, 'Adres za długi').optional().or(z.literal('')),
  billing_city: z.string().trim().max(100, 'Nazwa miasta za długa').optional().or(z.literal('')),
  billing_postal_code: z.string().trim()
    .refine(
      (val) => val === '' || postalCodeRegex.test(val),
      'Nieprawidłowy format kodu pocztowego (XX-XXX)'
    )
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const validatePostalCode = (value: string): string => {
  // Auto-format postal code: add dash after 2 digits
  const digits = value.replace(/\D/g, '').slice(0, 5);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return digits;
};
