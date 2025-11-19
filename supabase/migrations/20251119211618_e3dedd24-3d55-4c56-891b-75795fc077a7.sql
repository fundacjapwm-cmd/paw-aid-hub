-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can manage org users" ON public.organization_users;
DROP POLICY IF EXISTS "Org owners can manage their org users" ON public.organization_users;

-- Create security definer function to check org ownership
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id uuid, _org_id uuid)
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
    AND is_owner = true
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can manage org users"
ON public.organization_users
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Org owners can manage their org users"
ON public.organization_users
FOR ALL
USING (
  user_id = auth.uid() 
  OR 
  public.is_org_owner(auth.uid(), organization_id)
);