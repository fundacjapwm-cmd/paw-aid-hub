-- Drop all existing policies for order_items
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update own pending order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can delete own pending order items" ON public.order_items;

-- Allow creating order items for any order (guest or authenticated)
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      (o.user_id IS NULL) OR              -- Guest order
      (o.user_id = auth.uid())            -- Own authenticated order
    )
  )
);

-- Users can view order items from their orders
CREATE POLICY "Users can view order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      (o.user_id = auth.uid()) OR         -- Own orders
      has_role(auth.uid(), 'ADMIN'::app_role)  -- Admin can view all
    )
  )
);

-- Users can update their own pending order items
CREATE POLICY "Update own pending order items"
ON public.order_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
);

-- Users can delete their own pending order items
CREATE POLICY "Delete own pending order items"
ON public.order_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
);
