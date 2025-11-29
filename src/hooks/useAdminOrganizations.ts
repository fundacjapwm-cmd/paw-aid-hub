import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  logo_url?: string;
  created_at: string;
}

export function useAdminOrganizations() {
  const { user, profile, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    contact_email: ''
  });

  const isAdmin = profile?.role === 'ADMIN';

  useEffect(() => {
    if (authLoading || !user || !isAdmin) {
      return;
    }

    fetchOrganizations();

    const organizationsChannel = supabase
      .channel('organizations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
        fetchOrganizations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(organizationsChannel);
    };
  }, [authLoading, user, isAdmin]);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać organizacji",
        variant: "destructive"
      });
    } else {
      setOrganizations(data || []);
    }
  };

  const createOrganization = async () => {
    if (!newOrg.name || !newOrg.contact_email) {
      toast({
        title: "Błąd",
        description: "Wszystkie pola są wymagane",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrg.name,
          slug: newOrg.slug || newOrg.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          contact_email: newOrg.contact_email
        })
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: inviteError } = await supabase.functions.invoke('invite-organization', {
        body: {
          email: newOrg.contact_email,
          organizationName: newOrg.name,
          organizationId: orgData.id
        }
      });

      if (inviteError) {
        await supabase.from('organizations').delete().eq('id', orgData.id);
        throw new Error('Nie udało się wysłać zaproszenia do organizacji');
      }

      toast({
        title: "Sukces",
        description: `Organizacja ${newOrg.name} została utworzona. Zaproszenie zostało wysłane na ${newOrg.contact_email}`
      });

      setNewOrg({ name: '', slug: '', contact_email: '' });
      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const updateOrganization = async () => {
    if (!editingOrg) return;

    const { error } = await supabase
      .from('organizations')
      .update({
        name: editingOrg.name,
        slug: editingOrg.slug,
        contact_email: editingOrg.contact_email
      })
      .eq('id', editingOrg.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować organizacji",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Organizacja została zaktualizowana"
      });
      setEditingOrg(null);
      fetchOrganizations();
    }
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase.functions.invoke('delete-organization', {
      body: { organizationId: id }
    });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć organizacji",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Organizacja została usunięta"
      });
      fetchOrganizations();
    }
  };

  return {
    user,
    isAdmin,
    authLoading,
    organizations,
    isLoading,
    editingOrg,
    newOrg,
    setEditingOrg,
    setNewOrg,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };
}
