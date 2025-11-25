-- Allow guest orders (user_id can be null)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow guest order creation
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR  -- Guest checkout
  (auth.uid() = user_id)                        -- Authenticated checkout
);

-- Update view policy for guest orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() = user_id) OR                    -- Own orders
  has_role(auth.uid(), 'ADMIN'::app_role)      -- Admin can view all
);
