-- Add notes field to producers table for internal notes (e.g., contact person, discounts, etc.)
ALTER TABLE public.producers
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add NIP field to producers table (Polish tax ID)
ALTER TABLE public.producers
ADD COLUMN IF NOT EXISTS nip TEXT;