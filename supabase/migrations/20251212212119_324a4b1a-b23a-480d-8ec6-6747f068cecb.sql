-- First, ensure RLS is enabled on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the INSERT policy with explicit anon role access
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create policy that explicitly allows anonymous users (anon role)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Allow guest orders where user_id is NULL
  (user_id IS NULL)
  OR 
  -- Allow authenticated users to create orders for themselves
  (user_id = auth.uid())
);