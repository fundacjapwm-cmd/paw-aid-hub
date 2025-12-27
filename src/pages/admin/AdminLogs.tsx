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
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  user_id: string | null;
}

export default function AdminLogs() {
  const { user, profile, loading } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać logów aktywności",
        variant: "destructive"
      });
    } else {
      setActivityLogs((data || []) as ActivityLog[]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="rounded-3xl shadow-bubbly md:mx-0">
      <CardHeader>
        <CardTitle>Logi aktywności systemu</CardTitle>
        <CardDescription>
          Ostatnie 50 akcji w systemie. Logi rejestrują ważne operacje takie jak 
          tworzenie/edycja zwierząt, zamówienia, zmiany w organizacjach itp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Ładowanie logów...</p>
        ) : activityLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Brak logów aktywności. Logi pojawią się gdy użytkownicy wykonają akcje w systemie.
          </p>
        ) : (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-2xl">
                <div>
                  <p className="font-medium">
                    {log.action}
                    {log.entity_type && <span className="text-muted-foreground"> - {log.entity_type}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pl-PL')}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(log.details).slice(0, 100)}...
                    </p>
                  )}
                </div>
                <Badge variant="outline">
                  <Activity className="h-3 w-3 mr-1" />
                  {log.entity_type || 'System'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
