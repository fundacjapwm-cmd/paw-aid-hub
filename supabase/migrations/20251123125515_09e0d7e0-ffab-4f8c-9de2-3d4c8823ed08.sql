-- Fix infinite recursion in user_roles policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate the policy using the has_role function instead of querying user_roles directly
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'ADMIN'::app_role)
);