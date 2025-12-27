-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true);

-- Allow anyone to view partner logos (public bucket)
CREATE POLICY "Anyone can view partner logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'partner-logos');

-- Only admins can upload partner logos
CREATE POLICY "Admins can upload partner logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'partner-logos' AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Only admins can update partner logos
CREATE POLICY "Admins can update partner logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'partner-logos' AND has_role(auth.uid(), 'ADMIN'::app_role));

-- Only admins can delete partner logos
CREATE POLICY "Admins can delete partner logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'partner-logos' AND has_role(auth.uid(), 'ADMIN'::app_role));