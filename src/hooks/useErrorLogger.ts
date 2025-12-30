import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface ErrorLogData {
  error_message: string;
  error_stack?: string;
  error_type?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export function useErrorLogger() {
  const { user } = useAuth();

  const logError = useCallback(async (data: ErrorLogData) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          error_message: data.error_message,
          error_stack: data.error_stack || null,
          error_type: data.error_type || null,
          url: data.url || window.location.href,
          user_id: user?.id || null,
          user_agent: navigator.userAgent,
          metadata: (data.metadata as Json) || null,
          severity: data.severity || 'error',
        });

      if (error) {
        console.error('Failed to log error:', error);
      }
    } catch (err) {
      console.error('Error logger failed:', err);
    }
  }, [user?.id]);

  return { logError };
}

// Standalone function for use outside React components
export async function logErrorToDatabase(data: ErrorLogData & { user_id?: string }) {
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        error_message: data.error_message,
        error_stack: data.error_stack || null,
        error_type: data.error_type || null,
        url: data.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
        user_id: data.user_id || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata: (data.metadata as Json) || null,
        severity: data.severity || 'error',
      });

    if (error) {
      console.error('Failed to log error:', error);
    }
  } catch (err) {
    console.error('Error logger failed:', err);
  }
}
