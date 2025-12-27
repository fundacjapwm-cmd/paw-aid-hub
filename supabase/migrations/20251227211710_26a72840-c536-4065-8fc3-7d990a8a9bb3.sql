-- Drop the policy that still might cause issues
DROP POLICY IF EXISTS "Users can view org users of their organizations" ON public.organization_users;

-- Create a security definer function to check organization membership without recursion
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_users
    WHERE user_id = _user_id 
    AND organization_id = _org_id
  )
$$;

-- Create a new non-recursive policy using the function
CREATE POLICY "Users can view org users of their organizations"
ON public.organization_users
FOR SELECT
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) 
  OR user_id = auth.uid()
  OR is_org_member(auth.uid(), organization_id)
);