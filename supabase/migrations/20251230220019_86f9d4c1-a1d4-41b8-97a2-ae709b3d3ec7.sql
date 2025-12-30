-- Remove the policy that exposes all organization data to authenticated users
DROP POLICY IF EXISTS "Authenticated can view active organizations" ON public.organizations;

-- Add a policy for org members to view their organization (not just owners)
CREATE POLICY "Org members can view their organization"
ON public.organizations
FOR SELECT
USING (is_org_member(auth.uid(), id));