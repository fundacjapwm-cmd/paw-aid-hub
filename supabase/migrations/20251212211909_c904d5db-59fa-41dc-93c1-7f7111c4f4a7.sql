-- Drop existing INSERT policy on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a PERMISSIVE INSERT policy (default behavior)
-- This explicitly allows guest orders and authenticated user orders
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (
  -- Allow guest orders (user_id must be NULL)
  user_id IS NULL
  OR 
  -- Allow authenticated users to create orders for themselves
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);