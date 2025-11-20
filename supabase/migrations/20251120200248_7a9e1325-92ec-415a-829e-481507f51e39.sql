-- Fix the INSERT policy for animals - the WITH CHECK had ambiguous column reference
DROP POLICY IF EXISTS "Org users can insert animals" ON public.animals;

CREATE POLICY "Org users can insert animals"
ON public.animals
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT ou.organization_id
    FROM organization_users ou
    WHERE ou.user_id = auth.uid()
  )
);