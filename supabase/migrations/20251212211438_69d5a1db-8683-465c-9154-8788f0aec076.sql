-- Drop existing INSERT policy on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create more robust INSERT policy
-- Allow:
-- 1. Orders with user_id = NULL (guest orders)
-- 2. Orders where user_id matches the authenticated user
-- This prevents impersonation (can't set user_id to someone else's ID)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  (user_id IS NULL) -- Guest orders (user_id not set)
  OR (user_id = auth.uid()) -- Authenticated orders (user_id must match)
);