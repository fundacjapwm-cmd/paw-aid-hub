-- Create organization_leads table with GDPR consent fields
CREATE TABLE IF NOT EXISTS public.organization_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  nip TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_leads ENABLE ROW LEVEL SECURITY;

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.organization_leads
  FOR SELECT
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Anyone can insert leads (public form)
CREATE POLICY "Anyone can insert leads"
  ON public.organization_leads
  FOR INSERT
  WITH CHECK (true);