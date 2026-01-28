-- Add product code and EAN columns (for internal use only)
ALTER TABLE public.products 
ADD COLUMN product_code text NULL,
ADD COLUMN ean text NULL;

-- Add comments
COMMENT ON COLUMN public.products.product_code IS 'Kod produktu (wewnętrzny)';
COMMENT ON COLUMN public.products.ean IS 'Kod kreskowy EAN';