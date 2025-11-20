-- Fix RLS policies for animals table - separate INSERT policy
DROP POLICY IF EXISTS "Org users and admins can manage animals" ON public.animals;

-- Create separate policies for better control
CREATE POLICY "Admins can do everything with animals"
ON public.animals
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Org users can insert animals"
ON public.animals
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM organization_users ou
    WHERE ou.organization_id = organization_id
    AND ou.user_id = auth.uid()
  )
);

CREATE POLICY "Org users can update their animals"
ON public.animals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM organization_users ou
    WHERE ou.organization_id = animals.organization_id
    AND ou.user_id = auth.uid()
  )
);

CREATE POLICY "Org users can delete their animals"
ON public.animals
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM organization_users ou
    WHERE ou.organization_id = animals.organization_id
    AND ou.user_id = auth.uid()
  )
);

-- Create animal_images table for gallery
CREATE TABLE IF NOT EXISTS public.animal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on animal_images
ALTER TABLE public.animal_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for animal_images
CREATE POLICY "Anyone can view animal images"
ON public.animal_images
FOR SELECT
USING (true);

CREATE POLICY "Org users and admins can manage animal images"
ON public.animal_images
FOR ALL
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) OR
  EXISTS (
    SELECT 1
    FROM animals a
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    WHERE a.id = animal_images.animal_id
    AND ou.user_id = auth.uid()
  )
);