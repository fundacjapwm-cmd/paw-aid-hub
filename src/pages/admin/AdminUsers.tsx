import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name?: string;
  role: 'USER' | 'ORG' | 'ADMIN';
  must_change_password: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchUsers();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
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

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ORG' | 'ADMIN') => {
    // Update role in the secure user_roles table
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć starej roli",
        variant: "destructive"
      });
      return;
    }

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić roli",
        variant: "destructive"
      });
    } else {
      // Also update profiles.role for backwards compatibility
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      toast({
        title: "Sukces",
        description: "Rola została zmieniona"
      });
      fetchUsers();
    }
  };

  return (
    <Card className="rounded-3xl shadow-bubbly">
      <CardHeader>
        <CardTitle>Użytkownicy systemu ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <h3 className="font-semibold">{user.display_name || 'Bez nazwy'}</h3>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'ORG' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {user.must_change_password && (
                    <Badge variant="outline">Musi zmienić hasło</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={user.role} onValueChange={(value: 'USER' | 'ORG' | 'ADMIN') => updateUserRole(user.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ORG">ORG</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
