-- Add RLS policy to allow anyone to count active organizations
CREATE POLICY "Anyone can view active organizations for stats"
ON public.organizations
FOR SELECT
USING (active = true);