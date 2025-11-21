import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  logo_url?: string;
  created_at: string;
}

export default function AdminOrganizations() {
  const { user, profile, loading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    contact_email: ''
  });

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
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
  }, [loading, user, profile]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

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

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Dodaj nową organizację
          </CardTitle>
          <CardDescription>
            Utwórz nową organizację
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-name">Nazwa organizacji</Label>
              <Input
                id="org-name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Fundacja Ratuj Łapki"
              />
            </div>
            <div>
              <Label htmlFor="org-slug">Slug (opcjonalny)</Label>
              <Input
                id="org-slug"
                value={newOrg.slug}
                onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                placeholder="fundacja-ratuj-lapki"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="org-email">Email kontaktowy organizacji</Label>
            <Input
              id="org-email"
              type="email"
              value={newOrg.contact_email}
              onChange={(e) => setNewOrg({ ...newOrg, contact_email: e.target.value })}
              placeholder="kontakt@ratujlapki.pl"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Na ten adres zostanie wysłane zaproszenie z linkiem do ustawienia hasła
            </p>
          </div>
          <Button onClick={createOrganization} disabled={isLoading}>
            {isLoading ? 'Wysyłanie zaproszenia...' : 'Utwórz organizację i wyślij zaproszenie'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle>Lista organizacji ({organizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-2xl">
                <div>
                  <h3 className="font-semibold">{org.name}</h3>
                  <p className="text-sm text-muted-foreground">{org.contact_email}</p>
                  <p className="text-xs text-muted-foreground">Slug: {org.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setEditingOrg(org)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edytuj organizację</DialogTitle>
                        <DialogDescription>Zmień dane organizacji</DialogDescription>
                      </DialogHeader>
                      {editingOrg && (
                        <div className="space-y-4">
                          <div>
                            <Label>Nazwa</Label>
                            <Input
                              value={editingOrg.name}
                              onChange={(e) => setEditingOrg({...editingOrg, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Slug</Label>
                            <Input
                              value={editingOrg.slug}
                              onChange={(e) => setEditingOrg({...editingOrg, slug: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Email kontaktowy</Label>
                            <Input
                              value={editingOrg.contact_email}
                              onChange={(e) => setEditingOrg({...editingOrg, contact_email: e.target.value})}
                            />
                          </div>
                          <Button onClick={updateOrganization}>Zapisz zmiany</Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deleteOrganization(org.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
