-- Add purchase_net_price column for net purchase price from producer
ALTER TABLE public.products 
ADD COLUMN purchase_net_price numeric NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.purchase_net_price IS 'Cena zakupu netto od producenta (bez VAT)';
COMMENT ON COLUMN public.products.purchase_price IS 'Cena zakupu brutto od producenta (z VAT)';