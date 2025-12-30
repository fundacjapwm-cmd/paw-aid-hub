-- Fix 1: organization_leads - table already has proper RLS based on context
-- The SELECT policy for admins already exists, so this finding may be outdated
-- Let's verify and ensure proper protection

-- Fix 2: login_history INSERT policy - make it more restrictive
-- Drop the overly permissive policy and create a proper one

DROP POLICY IF EXISTS "Service role can insert login history" ON public.login_history;

-- Create a more restrictive INSERT policy that only allows inserting records
-- where the user_id matches the authenticated user OR it's done by service role via edge function
-- Since edge functions use service role key internally, we allow authenticated inserts for own user_id
CREATE POLICY "Users can insert own login history" 
ON public.login_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);