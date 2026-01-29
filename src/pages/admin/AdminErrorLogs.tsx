import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Info,
  Bug,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack: string | null;
  error_type: string | null;
  url: string | null;
  user_id: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  severity: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export default function AdminErrorLogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('unresolved');
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Fetch error logs
  const { data: errorLogs, isLoading, refetch } = useQuery({
    queryKey: ['error-logs', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (activeTab === 'unresolved') {
        query = query.eq('resolved', false);
      } else if (activeTab === 'resolved') {
        query = query.eq('resolved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ErrorLog[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    const channel = supabase
      .channel('error-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'error_logs',
        },
        (payload) => {
          const newError = payload.new as ErrorLog;
          toast.error(`Nowy błąd: ${newError.error_message.substring(0, 50)}...`, {
            duration: 5000,
          });
          queryClient.invalidateQueries({ queryKey: ['error-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeEnabled, queryClient]);

  // Mark as resolved mutation
  const resolveMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', errorId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Błąd oznaczony jako rozwiązany');
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
    },
    onError: () => {
      toast.error('Nie udało się oznaczyć błędu');
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bug className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'outline'> = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      info: 'outline',
    };
    return (
      <Badge variant={variants[severity] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: errorLogs?.length || 0,
    critical: errorLogs?.filter(e => e.severity === 'critical').length || 0,
    errors: errorLogs?.filter(e => e.severity === 'error').length || 0,
    warnings: errorLogs?.filter(e => e.severity === 'warning').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring błędów</h1>
          <p className="text-muted-foreground">
            Śledzenie błędów w czasie rzeczywistym
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={realtimeEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
          >
            {realtimeEnabled ? (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Powiadomienia włączone
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Powiadomienia wyłączone
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Odśwież
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wszystkie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Krytyczne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Błędy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ostrzeżenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unresolved">
            <Clock className="w-4 h-4 mr-2" />
            Nierozwiązane
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="w-4 h-4 mr-2" />
            Rozwiązane
          </TabsTrigger>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Ładowanie...
            </div>
          ) : errorLogs?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>Brak błędów do wyświetlenia</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {errorLogs?.map((error) => (
                <Card key={error.id} className={error.severity === 'critical' ? 'border-destructive' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getSeverityIcon(error.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(error.severity)}
                            {error.error_type && (
                              <Badge variant="outline">{error.error_type}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(error.created_at), 'dd MMM yyyy, HH:mm:ss', { locale: pl })}
                            </span>
                          </div>
                          <p className="font-medium text-sm break-all">
                            {error.error_message}
                          </p>
                          {error.url && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              URL: {error.url}
                            </p>
                          )}
                          {error.error_stack && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                Pokaż stack trace
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
                                {error.error_stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      {!error.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveMutation.mutate(error.id)}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Rozwiązany
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
