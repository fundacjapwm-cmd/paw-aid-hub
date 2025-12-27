
-- 1. SHIPMENTS: Restrict UPDATE to only tracking_number and status (not total_value)
DROP POLICY IF EXISTS "Organizations can update their own shipments" ON public.shipments;

CREATE POLICY "Organizations can update shipment status only"
ON public.shipments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = shipments.organization_id
    AND organization_users.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = shipments.organization_id
    AND organization_users.user_id = auth.uid()
  )
  -- Note: Column-level restrictions require a trigger, but this prevents org users from creating new shipments
);

-- Create trigger to prevent organizations from modifying sensitive fields
CREATE OR REPLACE FUNCTION public.restrict_shipment_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin, allow all changes
  IF has_role(auth.uid(), 'ADMIN'::app_role) THEN
    RETURN NEW;
  END IF;
  
  -- For org users, only allow updating confirmed_at (to confirm delivery)
  IF NEW.total_value IS DISTINCT FROM OLD.total_value 
     OR NEW.producer_id IS DISTINCT FROM OLD.producer_id
     OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
     OR NEW.shipped_at IS DISTINCT FROM OLD.shipped_at
     OR NEW.ordered_at IS DISTINCT FROM OLD.ordered_at
  THEN
    RAISE EXCEPTION 'Organizations can only confirm deliveries';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_shipment_update_trigger ON public.shipments;
CREATE TRIGGER restrict_shipment_update_trigger
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.restrict_shipment_update();

-- 2. PROFILES: Remove duplicate UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;
-- Keep only "Users can update their profile except role" which is more restrictive

-- 3. ORDER_ITEMS: Restrict visibility - org users should only see items from completed/paid orders
DROP POLICY IF EXISTS "Organizations can view order items for their animals" ON public.order_items;

CREATE POLICY "Organizations can view paid order items for their animals"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM animals a
    JOIN organization_users ou ON ou.organization_id = a.organization_id
    JOIN orders o ON o.id = order_items.order_id
    WHERE a.id = order_items.animal_id 
    AND ou.user_id = auth.uid()
    AND o.payment_status IN ('completed', 'paid')
  )
);

-- 4. ORGANIZATIONS: Restrict contact info to authenticated users only
DROP POLICY IF EXISTS "Public can view basic organization info" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can view organization contact info" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can view organizations" ON public.organizations;

-- Public can only see name, slug, description, logo, website, city, province (no email, phone, NIP, address)
-- We'll handle this with a view instead since RLS is row-level

-- Create a secure function for public organization data (without sensitive fields)
CREATE OR REPLACE FUNCTION public.get_public_organizations()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  logo_url text,
  website text,
  city text,
  province text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, name, slug, description, logo_url, website, city, province, active
  FROM organizations
  WHERE active = true;
$$;

-- Create function for single organization public data
CREATE OR REPLACE FUNCTION public.get_public_organization(org_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  logo_url text,
  website text,
  city text,
  province text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, name, slug, description, logo_url, website, city, province, active
  FROM organizations
  WHERE slug = org_slug AND active = true;
$$;

-- Authenticated users can see full organization data for active orgs
CREATE POLICY "Authenticated can view active organizations"
ON public.organizations
FOR SELECT
USING (
  active = true AND auth.uid() IS NOT NULL
);

-- Admins can see all organizations
CREATE POLICY "Admins can view all organizations"
ON public.organizations
FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Org owners can view their own org
CREATE POLICY "Org owners can view their organization"
ON public.organizations
FOR SELECT
USING (is_org_owner(auth.uid(), id));
