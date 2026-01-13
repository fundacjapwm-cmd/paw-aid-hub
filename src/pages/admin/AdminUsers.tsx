import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Users, Building2, Shield, Loader2 } from 'lucide-react';
import { OrganizationCreateForm } from '@/components/admin/OrganizationCreateForm';

interface Profile {
  id: string;
  display_name?: string;
  role: 'USER' | 'ORG' | 'ADMIN';
  must_change_password: boolean;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
}

export default function AdminUsers() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ORG' | 'ADMIN'>('ALL');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, 'USER' | 'ORG' | 'ADMIN'>>({});
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    contact_email: ''
  });

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchUsers();
    fetchOrganizations();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    const orgsChannel = supabase
      .channel('organizations-changes-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
        fetchOrganizations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(orgsChannel);
    };
  }, [loading, user, profile]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        role,
        must_change_password,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać użytkowników",
        variant: "destructive"
      });
    } else {
      setUsers(data || []);
    }
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug, contact_email')
      .order('name');
    
    if (error) {
      console.error('Error fetching organizations:', error);
    } else {
      setOrganizations(data || []);
    }
  };

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ORG' | 'ADMIN') => {
    setPendingRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const saveRoleChange = async (userId: string) => {
    const newRole = pendingRoleChanges[userId];
    if (!newRole) return;

    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return;

    setSavingUserId(userId);

    try {
      // Update role in the secure user_roles table
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      // Also update profiles.role for backwards compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // If changing to ORG role, check if user needs organization_users entry
      if (newRole === 'ORG' && currentUser.role !== 'ORG') {
        // Check if user already has an organization
        const { data: existingOrgUser } = await supabase
          .from('organization_users')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingOrgUser) {
          toast({
            title: "Uwaga",
            description: "Użytkownik ma teraz rolę ORG. Przypisz go do organizacji aby mógł zarządzać jej panelem.",
          });
        }
      }

      // Clear pending change
      setPendingRoleChanges(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      toast({
        title: "Sukces",
        description: "Rola została zmieniona"
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zmienić roli",
        variant: "destructive"
      });
    }

    setSavingUserId(null);
  };

  const createOrganization = async () => {
    if (!newOrg.name || !newOrg.contact_email) {
      toast({
        title: "Błąd",
        description: "Nazwa i email są wymagane",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrg(true);

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
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsCreatingOrg(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchQuery || 
        (u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const userCounts = useMemo(() => ({
    all: users.length,
    user: users.filter(u => u.role === 'USER').length,
    org: users.filter(u => u.role === 'ORG').length,
    admin: users.filter(u => u.role === 'ADMIN').length,
  }), [users]);

  const getCurrentRole = (userId: string, originalRole: 'USER' | 'ORG' | 'ADMIN') => {
    return pendingRoleChanges[userId] || originalRole;
  };

  const hasUnsavedChange = (userId: string) => {
    return userId in pendingRoleChanges;
  };

  return (
    <div className="space-y-6">
      {/* Create Organization Form */}
      <OrganizationCreateForm
        newOrg={newOrg}
        isLoading={isCreatingOrg}
        onNewOrgChange={setNewOrg}
        onCreateOrganization={createOrganization}
      />

      {/* Users List */}
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Użytkownicy systemu ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po nazwie lub ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter Tabs */}
          <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="ALL" className="gap-1">
                Wszystko
                <Badge variant="secondary" className="ml-1 text-xs">{userCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="USER" className="gap-1">
                <Users className="h-3 w-3" />
                <Badge variant="secondary" className="ml-1 text-xs">{userCounts.user}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ORG" className="gap-1">
                <Building2 className="h-3 w-3" />
                <Badge variant="secondary" className="ml-1 text-xs">{userCounts.org}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ADMIN" className="gap-1">
                <Shield className="h-3 w-3" />
                <Badge variant="secondary" className="ml-1 text-xs">{userCounts.admin}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={roleFilter} className="mt-4">
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Brak użytkowników spełniających kryteria
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <div 
                      key={u.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl gap-4 transition-colors ${
                        hasUnsavedChange(u.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{u.display_name || 'Bez nazwy'}</h3>
                        <p className="text-sm text-muted-foreground truncate">ID: {u.id}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={u.role === 'ADMIN' ? 'destructive' : u.role === 'ORG' ? 'default' : 'secondary'}>
                            {u.role}
                          </Badge>
                          {u.must_change_password && (
                            <Badge variant="outline">Musi zmienić hasło</Badge>
                          )}
                          {hasUnsavedChange(u.id) && (
                            <Badge variant="outline" className="border-primary text-primary">
                              Niezapisane zmiany
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={getCurrentRole(u.id, u.role)} 
                          onValueChange={(value: 'USER' | 'ORG' | 'ADMIN') => handleRoleChange(u.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ORG">ORG</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                        {hasUnsavedChange(u.id) && (
                          <Button 
                            size="sm" 
                            onClick={() => saveRoleChange(u.id)}
                            disabled={savingUserId === u.id}
                          >
                            {savingUserId === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Zapisz'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
