-- Storage policies for organization profile and gallery images

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization owners can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Organization owners can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Organization owners can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Organization owners can delete gallery images" ON storage.objects;

-- Allow organization owners to upload logos
CREATE POLICY "Organization owners can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = auth.uid()
    AND is_owner = true
  )
);

-- Allow organization owners to upload gallery images
CREATE POLICY "Organization owners can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'organization-gallery'
  AND EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = auth.uid()
    AND is_owner = true
  )
);

-- Allow anyone to view logos (public access)
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'logos'
);

-- Allow anyone to view gallery images (public access)
CREATE POLICY "Anyone can view gallery images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'organization-gallery'
);

-- Allow organization owners to delete their logos
CREATE POLICY "Organization owners can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = auth.uid()
    AND is_owner = true
  )
);

-- Allow organization owners to delete their gallery images
CREATE POLICY "Organization owners can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'organization-gallery'
  AND EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = auth.uid()
    AND is_owner = true
  )
);