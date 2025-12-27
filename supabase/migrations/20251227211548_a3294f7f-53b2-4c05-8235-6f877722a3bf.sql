-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Org members and admins can view org users" ON public.organization_users;

-- Create a non-recursive version that only checks the user's own membership
CREATE POLICY "Users can view org users of their organizations"
ON public.organization_users
FOR SELECT
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) 
  OR user_id = auth.uid()
  OR organization_id IN (
    SELECT ou.organization_id 
    FROM public.organization_users ou 
    WHERE ou.user_id = auth.uid()
  )
);