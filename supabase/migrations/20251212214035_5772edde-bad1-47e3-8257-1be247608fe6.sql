-- Update shipments table to support full workflow
-- Add new columns for tracking the full order lifecycle
ALTER TABLE public.shipments 
ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_value NUMERIC DEFAULT 0;

-- Update status default and allow new statuses
-- Status flow: collecting -> ordered -> shipped -> delivered -> confirmed
ALTER TABLE public.shipments 
ALTER COLUMN status SET DEFAULT 'collecting';

-- Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_producer_org ON public.shipments(producer_id, organization_id);

-- Add RLS policy for organizations to view shipments in all statuses
DROP POLICY IF EXISTS "Organizations can view their own shipments" ON public.shipments;
CREATE POLICY "Organizations can view their own shipments" 
ON public.shipments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = shipments.organization_id
    AND organization_users.user_id = auth.uid()
  )
);

-- Allow admins to insert shipments
DROP POLICY IF EXISTS "Admins can manage all shipments" ON public.shipments;
CREATE POLICY "Admins can manage all shipments"
ON public.shipments
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Organizations can update their shipments (for confirming delivery)
DROP POLICY IF EXISTS "Organizations can update their own shipments" ON public.shipments;
CREATE POLICY "Organizations can update their own shipments"
ON public.shipments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = shipments.organization_id
    AND organization_users.user_id = auth.uid()
  )
);