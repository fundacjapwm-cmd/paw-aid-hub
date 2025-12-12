-- Drop the existing check constraint on status
ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_status_check;

-- Add new check constraint that includes all needed statuses
ALTER TABLE public.shipments ADD CONSTRAINT shipments_status_check 
CHECK (status IN ('collecting', 'ordered', 'shipped', 'delivered', 'confirmed'));