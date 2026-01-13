-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate as permissive policy (default) so admins can actually manage roles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));