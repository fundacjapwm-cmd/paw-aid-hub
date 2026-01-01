-- Drop and recreate the function with address and postal_code fields
DROP FUNCTION IF EXISTS public.get_public_organizations();

CREATE FUNCTION public.get_public_organizations()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  logo_url text,
  website text,
  city text,
  province text,
  address text,
  postal_code text,
  active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, name, slug, description, logo_url, website, city, province, address, postal_code, active
  FROM organizations
  WHERE active = true;
$$;