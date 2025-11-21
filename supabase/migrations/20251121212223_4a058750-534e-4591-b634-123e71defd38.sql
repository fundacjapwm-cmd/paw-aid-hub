
-- Add processed_at column to organization_leads
ALTER TABLE organization_leads 
ADD COLUMN processed_at timestamp with time zone;

-- Update existing processed leads to have a timestamp
UPDATE organization_leads 
SET processed_at = created_at 
WHERE status IN ('approved', 'rejected');
