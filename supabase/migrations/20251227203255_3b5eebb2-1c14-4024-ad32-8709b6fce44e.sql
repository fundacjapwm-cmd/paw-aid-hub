-- 1. DROP the public orders policy that exposes user_id
DROP POLICY IF EXISTS "Public can view completed orders for stats" ON public.orders;

-- 2. For organizations, we need to handle this differently since RLS is row-level, not column-level
-- We'll restrict the organization_users table to only org members and admins
DROP POLICY IF EXISTS "Authenticated can view org users" ON public.organization_users;

CREATE POLICY "Org members and admins can view org users"
ON public.organization_users
FOR SELECT
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) 
  OR EXISTS (
    SELECT 1 FROM public.organization_users ou 
    WHERE ou.organization_id = organization_users.organization_id 
    AND ou.user_id = auth.uid()
  )
);

-- 3. For profiles, restrict visibility to only own profile and admins
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- 4. Create a secure function for order stats (without exposing user_id)
CREATE OR REPLACE FUNCTION public.get_order_stats()
RETURNS TABLE (
  total_orders bigint,
  total_amount numeric,
  total_items bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_amount,
    COALESCE(SUM(oi.quantity), 0) as total_items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.payment_status = 'completed';
$$;