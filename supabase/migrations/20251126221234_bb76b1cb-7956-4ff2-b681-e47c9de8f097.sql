-- Drop existing constraint and add new one with all statuses
ALTER TABLE public.order_items DROP CONSTRAINT order_items_fulfillment_status_check;

ALTER TABLE public.order_items ADD CONSTRAINT order_items_fulfillment_status_check 
CHECK (fulfillment_status = ANY (ARRAY['pending'::text, 'ordered'::text, 'shipped'::text, 'delivered'::text, 'fulfilled'::text]));