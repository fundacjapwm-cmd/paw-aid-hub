-- Create error_logs table for real-time error monitoring
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT,
  url TEXT,
  user_id UUID,
  user_agent TEXT,
  metadata JSONB,
  severity TEXT NOT NULL DEFAULT 'error',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view error logs
CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Only admins can update error logs (mark as resolved)
CREATE POLICY "Admins can update error logs" 
ON public.error_logs 
FOR UPDATE 
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Anyone can insert error logs (for anonymous error reporting)
CREATE POLICY "Anyone can insert error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);

-- Enable realtime for error_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;