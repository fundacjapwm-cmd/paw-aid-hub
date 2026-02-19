import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki').max(100, 'Imię i nazwisko za długie'),
  customerEmail: z.string().trim().email('Nieprawidłowy adres email').max(255, 'Email za długi'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków').max(72, 'Hasło za długie').optional().or(z.literal('')),
  acceptTerms: z.boolean().refine(val => val === true, 'Musisz zaakceptować regulamin'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Musisz zaakceptować politykę prywatności'),
  acceptDataProcessing: z.boolean().refine(val => val === true, 'Musisz wyrazić zgodę na przetwarzanie danych'),
  
  newsletter: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
