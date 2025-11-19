-- Fix infinite recursion in organization_users RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Org owners and admins can manage org users" ON public.organization_users;

-- Create simplified policy that avoids recursion
-- Admins can manage all
CREATE POLICY "Admins can manage org users"
ON public.organization_users
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Organization owners can manage their org users (direct check without recursion)
CREATE POLICY "Org owners can manage their org users"
ON public.organization_users
FOR ALL
USING (
  is_owner = true AND user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.organization_users ou2
    WHERE ou2.organization_id = organization_users.organization_id
    AND ou2.user_id = auth.uid()
    AND ou2.is_owner = true
  )
);