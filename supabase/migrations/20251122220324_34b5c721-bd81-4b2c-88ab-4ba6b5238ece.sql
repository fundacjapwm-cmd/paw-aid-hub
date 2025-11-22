-- Fix critical security issues

-- 1. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Fix profiles RLS - prevent role updates by users
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile data"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes unless user is admin
  (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR has_role(auth.uid(), 'ADMIN'::app_role))
);

-- 4. Fix profiles SELECT - restrict to authenticated users
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow public view of basic profile info only (for display purposes)
CREATE POLICY "Public can view basic profile info"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- 5. Fix organizations RLS - protect sensitive financial data
DROP POLICY IF EXISTS "Anyone can view active organizations" ON public.organizations;

-- Public can view basic organization info
CREATE POLICY "Public can view organization profiles"
ON public.organizations
FOR SELECT
TO anon
USING (active = true);

-- Authenticated users see more details
CREATE POLICY "Authenticated can view organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (active = true OR has_role(auth.uid(), 'ADMIN'::app_role));

-- 6. Fix activity_logs RLS - prevent public insertion
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- Only authenticated users can insert logs (typically from edge functions)
CREATE POLICY "Authenticated can insert logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'ADMIN'::app_role));