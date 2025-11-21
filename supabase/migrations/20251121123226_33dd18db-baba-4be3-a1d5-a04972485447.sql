-- Dodajemy status realizacji do pozycji zamówienia
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS fulfillment_status text 
CHECK (fulfillment_status IN ('pending', 'ordered', 'shipped')) 
DEFAULT 'pending';

-- Indeks dla wydajności (będziemy często filtrować 'pending')
CREATE INDEX IF NOT EXISTS idx_order_items_fulfillment_status 
ON order_items(fulfillment_status);

-- Aktualizuj istniejące rekordy
UPDATE order_items 
SET fulfillment_status = 'pending' 
WHERE fulfillment_status IS NULL;