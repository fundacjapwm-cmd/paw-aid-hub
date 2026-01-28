-- Add net_price column to products table
ALTER TABLE public.products 
ADD COLUMN net_price numeric NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.net_price IS 'Cena netto produktu (bez VAT). Cena brutto = net_price * 1.23 dla 23% VAT';

-- Update existing products: calculate net_price from current price (assuming 23% VAT)
-- net_price = price / 1.23
UPDATE public.products 
SET net_price = ROUND(price / 1.23, 2) 
WHERE net_price IS NULL AND price IS NOT NULL;