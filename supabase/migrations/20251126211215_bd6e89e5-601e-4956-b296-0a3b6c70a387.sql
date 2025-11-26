-- Drop the old check constraint
ALTER TABLE organization_batch_orders DROP CONSTRAINT organization_batch_orders_status_check;

-- Add new check constraint with all needed statuses
ALTER TABLE organization_batch_orders ADD CONSTRAINT organization_batch_orders_status_check 
CHECK (status = ANY (ARRAY['collecting'::text, 'processing'::text, 'ordered'::text, 'shipped'::text, 'fulfilled'::text]));