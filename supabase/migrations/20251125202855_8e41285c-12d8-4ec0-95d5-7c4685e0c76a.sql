-- Remove unit and weight_volume columns from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS unit;
ALTER TABLE public.products DROP COLUMN IF EXISTS weight_volume;