-- Add policy for organization owners to update their own organization
CREATE POLICY "Org owners can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (is_org_owner(auth.uid(), id));