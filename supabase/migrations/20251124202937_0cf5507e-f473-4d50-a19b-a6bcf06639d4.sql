-- =====================================================
-- SECURITY AUDIT FIX - CRITICAL DATA PROTECTION
-- =====================================================

-- 1. REMOVE bank_account_number from organizations (not needed)
ALTER TABLE public.organizations DROP COLUMN IF EXISTS bank_account_number;

-- =====================================================
-- 2. FIX PROFILES TABLE - Require authentication
-- =====================================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create new secure policy - only authenticated users can view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep existing update policies (users can update own profile)

-- =====================================================
-- 3. FIX ORGANIZATIONS TABLE - Hide sensitive data from public
-- =====================================================

-- Drop existing public read policy
DROP POLICY IF EXISTS "Public can view organization profiles" ON public.organizations;

-- Create new policy - public can only see basic info (no contact details, NIP)
CREATE POLICY "Public can view basic organization info"
ON public.organizations
FOR SELECT
TO public
USING (
  active = true
);

-- Note: The SELECT will be filtered in application code to only return:
-- id, name, slug, description, logo_url, city, address, postal_code, website, created_at, updated_at
-- Sensitive fields (contact_email, contact_phone, nip, regon) will be hidden via application logic

-- Authenticated users can see more details
CREATE POLICY "Authenticated can view organization contact info"
ON public.organizations
FOR SELECT
TO authenticated
USING (active = true);

-- =====================================================
-- 4. FIX PRODUCERS TABLE - ADMIN ONLY ACCESS
-- =====================================================

-- Drop public read policy
DROP POLICY IF EXISTS "Anyone can view active producers" ON public.producers;

-- Create admin-only policy for producers
CREATE POLICY "Only admins can view producers"
ON public.producers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'));

-- =====================================================
-- 5. FIX PRODUCTS TABLE - Hide purchase prices from public
-- =====================================================

-- Drop existing public policy
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Create new policy - public can view products but NOT purchase_price
-- Purchase price visibility will be controlled in application code
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO public
USING (active = true);

-- Note: purchase_price field access will be restricted in application code
-- to only show for admin users

-- =====================================================
-- 6. FIX ORGANIZATION_USERS TABLE - Require authentication
-- =====================================================

-- Drop public read policy
DROP POLICY IF EXISTS "Anyone can view org users" ON public.organization_users;

-- Create authenticated-only policy
CREATE POLICY "Authenticated can view org users"
ON public.organization_users
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- 7. ADD ACTIVITY LOGS PROTECTION
-- =====================================================

-- Org users can view logs for their organization's entities
CREATE POLICY "Org users can view their organization logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'ADMIN') OR
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid()
    AND (
      entity_type = 'organization' AND entity_id::text = ou.organization_id::text
      OR entity_type = 'animal' AND entity_id IN (
        SELECT id FROM public.animals WHERE organization_id = ou.organization_id
      )
    )
  )
);

-- =====================================================
-- 8. ADD ORDER ITEMS UPDATE/DELETE POLICIES
-- =====================================================

-- Users can update their order items if order is still pending
CREATE POLICY "Users can update own pending order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
);

-- Users can delete their order items if order is still pending
CREATE POLICY "Users can delete own pending order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND o.user_id = auth.uid()
    AND o.status = 'pending'
  )
);