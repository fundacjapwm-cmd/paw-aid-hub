-- Create organization_images table for gallery photos
CREATE TABLE public.organization_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view organization images
CREATE POLICY "Anyone can view organization images"
  ON public.organization_images
  FOR SELECT
  USING (true);

-- Org owners and admins can manage organization images
CREATE POLICY "Org owners and admins can manage organization images"
  ON public.organization_images
  FOR ALL
  USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR
    is_org_owner(auth.uid(), organization_id)
  );

-- Create index for faster queries
CREATE INDEX idx_organization_images_org_id ON public.organization_images(organization_id);
CREATE INDEX idx_organization_images_display_order ON public.organization_images(display_order);