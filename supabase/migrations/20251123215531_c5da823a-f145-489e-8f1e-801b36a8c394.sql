-- Create table for batch orders (organization order batches)
CREATE TABLE IF NOT EXISTS public.organization_batch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'processing', 'fulfilled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  tracking_number TEXT,
  notes TEXT
);

-- Add index for faster queries
CREATE INDEX idx_batch_orders_org_status ON public.organization_batch_orders(organization_id, status);
CREATE INDEX idx_batch_orders_status ON public.organization_batch_orders(status);

-- Link orders to batch orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS batch_order_id UUID REFERENCES public.organization_batch_orders(id) ON DELETE SET NULL;

-- Create index for batch order lookups
CREATE INDEX IF NOT EXISTS idx_orders_batch ON public.orders(batch_order_id);

-- RLS policies for batch orders
ALTER TABLE public.organization_batch_orders ENABLE ROW LEVEL SECURITY;

-- Admins can manage all batch orders
CREATE POLICY "Admins can manage batch orders"
ON public.organization_batch_orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Organizations can view their batch orders
CREATE POLICY "Organizations can view their batch orders"
ON public.organization_batch_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE organization_id = organization_batch_orders.organization_id
    AND user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_batch_orders_updated_at
  BEFORE UPDATE ON public.organization_batch_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.organization_batch_orders IS 'Batch orders grouping multiple individual orders for an organization';
COMMENT ON COLUMN public.organization_batch_orders.status IS 'collecting: gathering orders, processing: sent to producer, fulfilled: received by organization';
COMMENT ON COLUMN public.orders.batch_order_id IS 'Links individual order to organization batch order';