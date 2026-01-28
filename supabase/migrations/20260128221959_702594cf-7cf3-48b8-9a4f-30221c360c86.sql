-- Replace species column with two boolean columns for more flexibility
ALTER TABLE public.products 
ADD COLUMN for_dogs boolean DEFAULT true,
ADD COLUMN for_cats boolean DEFAULT true;

-- Migrate existing data
UPDATE public.products 
SET for_dogs = CASE WHEN species = 'Kot' THEN false ELSE true END,
    for_cats = CASE WHEN species = 'Pies' THEN false ELSE true END
WHERE species IS NOT NULL;

-- Drop old column and constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_species_check;
ALTER TABLE public.products DROP COLUMN IF EXISTS species;

-- Add comments
COMMENT ON COLUMN public.products.for_dogs IS 'Czy produkt jest dla psów';
COMMENT ON COLUMN public.products.for_cats IS 'Czy produkt jest dla kotów';