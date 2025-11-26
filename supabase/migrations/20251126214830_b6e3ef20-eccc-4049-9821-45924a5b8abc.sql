
-- Add RLS policy for organizations to update order_items for their animals
CREATE POLICY "Organizations can update order items for their animals" 
ON public.order_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM animals a
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    WHERE a.id = order_items.animal_id 
    AND ou.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM animals a
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    WHERE a.id = order_items.animal_id 
    AND ou.user_id = auth.uid()
  )
);
