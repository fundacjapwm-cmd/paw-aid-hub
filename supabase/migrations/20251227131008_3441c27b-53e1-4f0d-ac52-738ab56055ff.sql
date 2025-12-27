-- Add terms acceptance tracking to organizations table
ALTER TABLE public.organizations
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN terms_accepted_by UUID DEFAULT NULL;