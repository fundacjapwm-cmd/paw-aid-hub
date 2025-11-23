-- Add tracking number to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.orders.tracking_number IS 'Tracking number for shipment, added by admin when order is shipped';

-- Update fulfillment status check constraint if needed
-- The fulfillment_status in order_items can be: pending, fulfilled, shipped, problem