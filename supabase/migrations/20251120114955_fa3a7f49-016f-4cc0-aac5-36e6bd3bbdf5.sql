-- Add bank_account_number to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- Add regon to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS regon TEXT;

-- Add postal_code to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Create product_requests table for organizations to request missing products
CREATE TABLE IF NOT EXISTS public.product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  producer_name TEXT,
  product_link TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on product_requests
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can create product requests
CREATE POLICY "Authenticated users can create product requests"
ON public.product_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own product requests"
ON public.product_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'ADMIN'::app_role));

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all product requests"
ON public.product_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Policy: Admins can update product requests
CREATE POLICY "Admins can update product requests"
ON public.product_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_product_requests_updated_at
BEFORE UPDATE ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();