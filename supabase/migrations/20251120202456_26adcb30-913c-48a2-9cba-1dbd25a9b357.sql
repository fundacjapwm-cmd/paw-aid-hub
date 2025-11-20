-- Drop and recreate the INSERT policy with explicit auth check
DROP POLICY IF EXISTS "Org users can insert animals" ON public.animals;

CREATE POLICY "Org users can insert animals"
ON public.animals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_users ou
    WHERE ou.user_id = auth.uid()
    AND ou.organization_id = animals.organization_id
  )
);