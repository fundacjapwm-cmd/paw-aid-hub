-- Add NIP field to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS nip text;

-- Add weight/volume field to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight_volume text;