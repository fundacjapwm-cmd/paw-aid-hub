-- Add policy for admins to view all login history
CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'::app_role));