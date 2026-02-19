
-- Add portion sale fields to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_portion_sale boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_weight_kg numeric NULL,
  ADD COLUMN IF NOT EXISTS portion_size_kg numeric NULL,
  ADD COLUMN IF NOT EXISTS portion_price numeric NULL,
  ADD COLUMN IF NOT EXISTS portion_net_price numeric NULL,
  ADD COLUMN IF NOT EXISTS portion_purchase_price numeric NULL,
  ADD COLUMN IF NOT EXISTS portion_purchase_net_price numeric NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.is_portion_sale IS 'Whether this product can be sold in portions (e.g., per kg)';
COMMENT ON COLUMN public.products.total_weight_kg IS 'Total weight of the full package in kg';
COMMENT ON COLUMN public.products.portion_size_kg IS 'Size of one portion in kg (e.g., 1 for 1kg portions)';
COMMENT ON COLUMN public.products.portion_price IS 'Selling price (gross) per portion';
COMMENT ON COLUMN public.products.portion_net_price IS 'Selling price (net) per portion';
COMMENT ON COLUMN public.products.portion_purchase_price IS 'Purchase price (gross) per portion';
COMMENT ON COLUMN public.products.portion_purchase_net_price IS 'Purchase price (net) per portion';
