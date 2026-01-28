-- Add species column to products table for cat/dog categorization
ALTER TABLE public.products 
ADD COLUMN species text NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.species IS 'Nadkategoria: Pies lub Kot. NULL oznacza produkt uniwersalny.';

-- Add check constraint to ensure valid values
ALTER TABLE public.products 
ADD CONSTRAINT products_species_check 
CHECK (species IS NULL OR species IN ('Pies', 'Kot'));