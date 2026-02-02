
-- Add customer information columns to orders table
-- These store the donor's contact info even for guest checkouts
ALTER TABLE public.orders 
ADD COLUMN customer_name text,
ADD COLUMN customer_email text;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.customer_name IS 'Donor name from checkout form';
COMMENT ON COLUMN public.orders.customer_email IS 'Donor email from checkout form';
