-- Allow public read access for statistics purposes (only essential fields for calculating purchased items)
CREATE POLICY "Public can view completed orders for stats"
ON public.orders
FOR SELECT
USING (payment_status = 'completed');