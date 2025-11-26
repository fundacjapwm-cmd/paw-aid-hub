
-- Drop the problematic policy
DROP POLICY IF EXISTS "Organizations can view orders for their animals" ON public.orders;

-- Create security definer function to check if user can access order
CREATE OR REPLACE FUNCTION public.user_can_view_order(_user_id uuid, _order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM order_items oi
    JOIN animals a ON a.id = oi.animal_id
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    WHERE oi.order_id = _order_id 
    AND ou.user_id = _user_id
  )
$$;

-- Create new policy using the function
CREATE POLICY "Organizations can view orders for their animals" 
ON public.orders 
FOR SELECT 
USING (
  public.user_can_view_order(auth.uid(), id)
);
