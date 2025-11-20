-- Allow ORG users to upload animal images to product-images bucket
CREATE POLICY "Org users can upload animal images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'animals'
  AND has_role(auth.uid(), 'ORG'::app_role)
);

-- Allow ORG users to update their animal images
CREATE POLICY "Org users can update animal images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'animals'
  AND has_role(auth.uid(), 'ORG'::app_role)
);

-- Allow ORG users to delete their animal images
CREATE POLICY "Org users can delete animal images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'animals'
  AND has_role(auth.uid(), 'ORG'::app_role)
);