import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

export default function AdminLogs() {
  const { user, profile, loading } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchActivityLogs();
  }, [loading, user, profile]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        table_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać logów aktywności",
        variant: "destructive"
      });
    } else {
      setActivityLogs((data || []) as any);
    }
  };

  return (
    <Card className="rounded-3xl shadow-bubbly">
      <CardHeader>
        <CardTitle>Logi aktywności systemu</CardTitle>
        <CardDescription>Ostatnie 50 akcji w systemie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border rounded-2xl">
              <div>
                <p className="font-medium">{log.action} - {log.table_name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('pl-PL')}
                </p>
              </div>
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1" />
                System
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
