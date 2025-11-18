import { z } from 'zod';

// Polish NIP validation - 10 digits
const nipRegex = /^\d{10}$/;

// Polish phone number validation - various formats accepted
const phoneRegex = /^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

export const producerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Nazwa firmy jest wymagana" })
    .max(200, { message: "Nazwa firmy nie może przekraczać 200 znaków" }),
  
  nip: z.string()
    .trim()
    .regex(nipRegex, { message: "NIP musi zawierać dokładnie 10 cyfr" })
    .optional()
    .or(z.literal('')),
  
  contact_email: z.string()
    .trim()
    .email({ message: "Nieprawidłowy format adresu email" })
    .max(255, { message: "Email nie może przekraczać 255 znaków" })
    .optional()
    .or(z.literal('')),
  
  contact_phone: z.string()
    .trim()
    .regex(phoneRegex, { message: "Nieprawidłowy format numeru telefonu (oczekiwany: +48 123 456 789 lub 123456789)" })
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .trim()
    .max(1000, { message: "Opis nie może przekraczać 1000 znaków" })
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .trim()
    .max(2000, { message: "Notatki nie mogą przekraczać 2000 znaków" })
    .optional()
    .or(z.literal('')),
  
  logo_url: z.string().optional().or(z.literal('')),
  
  active: z.boolean()
});

export type ProducerFormData = z.infer<typeof producerSchema>;
