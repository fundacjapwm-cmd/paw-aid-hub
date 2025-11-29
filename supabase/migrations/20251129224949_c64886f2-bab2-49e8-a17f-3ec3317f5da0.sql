-- Tabela Dostaw (Paczka od Producenta do Organizacji)
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  producer_id uuid REFERENCES public.producers(id) ON DELETE SET NULL,
  status text CHECK (status IN ('shipped', 'delivered', 'confirmed')) DEFAULT 'shipped' NOT NULL,
  tracking_number text,
  shipped_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Dodaj relację w order_items (żeby wiedzieć, w której paczce jest dany przedmiot)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL;

-- Indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_shipments_organization_id ON public.shipments(organization_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_order_items_shipment_id ON public.order_items(shipment_id);

-- Włącz RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla shipments
CREATE POLICY "Organizations can view their own shipments" 
ON public.shipments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE organization_users.organization_id = shipments.organization_id 
    AND organization_users.user_id = auth.uid()
  )
);

CREATE POLICY "Organizations can update their own shipments" 
ON public.shipments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE organization_users.organization_id = shipments.organization_id 
    AND organization_users.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all shipments" 
ON public.shipments 
FOR ALL 
USING (public.has_role(auth.uid(), 'ADMIN'::app_role));