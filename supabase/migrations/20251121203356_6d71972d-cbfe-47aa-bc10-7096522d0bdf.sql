-- Add status column to organization_leads
ALTER TABLE public.organization_leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected'));