-- Create organization_wishlists table
CREATE TABLE IF NOT EXISTS public.organization_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, product_id)
);

-- Enable RLS
ALTER TABLE public.organization_wishlists ENABLE ROW LEVEL SECURITY;

-- Anyone can view organization wishlists
CREATE POLICY "Anyone can view organization wishlists"
  ON public.organization_wishlists
  FOR SELECT
  USING (true);

-- Org users and admins can manage organization wishlists
CREATE POLICY "Org users and admins can manage organization wishlists"
  ON public.organization_wishlists
  FOR ALL
  USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR
    EXISTS (
      SELECT 1 FROM organization_users ou
      WHERE ou.organization_id = organization_wishlists.organization_id
      AND ou.user_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX idx_organization_wishlists_org_id ON public.organization_wishlists(organization_id);
CREATE INDEX idx_organization_wishlists_product_id ON public.organization_wishlists(product_id);