-- Drop existing INSERT policy on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a more permissive INSERT policy that allows:
-- 1. Guest orders (user_id is NULL - no auth required)
-- 2. Authenticated orders (user_id matches the logged in user)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow guest orders (user_id must be NULL)
  user_id IS NULL
  OR 
  -- Allow authenticated users to create orders for themselves
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);