import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
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
    };

    checkOrganization();
  }, [user]);

  return {
    organization,
    hasOrganization: !!organization,
    isOwner: organization?.is_owner ?? false,
    loading
  };
}
