-- Add purchase_price column to products table
ALTER TABLE public.products 
ADD COLUMN purchase_price numeric;

-- Add comment to clarify the price column is the selling price
COMMENT ON COLUMN public.products.price IS 'Cena sprzedaży (selling price)';
COMMENT ON COLUMN public.products.purchase_price IS 'Cena zakupu u producenta (purchase price from producer)';