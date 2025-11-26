-- Add RLS policy for organizations to view orders for their animals
CREATE POLICY "Organizations can view orders for their animals" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM order_items oi
    JOIN animals a ON a.id = oi.animal_id
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    WHERE oi.order_id = orders.id 
    AND ou.user_id = auth.uid()
  )
);