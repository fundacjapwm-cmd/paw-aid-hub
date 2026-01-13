import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserOrganization {
  id: string;
  organization_id: string;
  organization_name?: string;
  is_owner: boolean;
}

export function useUserOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<UserOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganization = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('organization_users')
      .select(`
        id,
        organization_id,
        is_owner,
        organizations (name)
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user organization:', error);
      setOrganization(null);
    } else if (data) {
      setOrganization({
        id: data.id,
        organization_id: data.organization_id!,
        organization_name: (data.organizations as any)?.name,
        is_owner: data.is_owner ?? false
      });
    } else {
      setOrganization(null);
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchOrganization();
  }, [fetchOrganization]);

  // Real-time subscription for organization_users changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`organization_users:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_users',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchOrganization();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrganization]);

  return {
    organization,
    hasOrganization: !!organization,
    isOwner: organization?.is_owner ?? false,
    loading,
    refetch: fetchOrganization
  };
}
