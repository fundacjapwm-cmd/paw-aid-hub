-- Create producer_images table for image galleries
CREATE TABLE public.producer_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.producer_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view producer images
CREATE POLICY "Anyone can view producer images"
  ON public.producer_images
  FOR SELECT
  USING (true);

-- Admins can manage producer images
CREATE POLICY "Admins can manage producer images"
  ON public.producer_images
  FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Create index for faster queries
CREATE INDEX idx_producer_images_producer_id ON public.producer_images(producer_id);
CREATE INDEX idx_producer_images_order ON public.producer_images(producer_id, display_order);