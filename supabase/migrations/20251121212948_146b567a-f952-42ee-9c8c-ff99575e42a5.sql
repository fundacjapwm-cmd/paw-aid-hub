
-- Add UPDATE policy for admins on organization_leads
CREATE POLICY "Admins can update leads"
ON organization_leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));
