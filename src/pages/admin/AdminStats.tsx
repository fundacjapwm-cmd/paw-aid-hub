import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Heart, Factory, Users, ShoppingCart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

export default function AdminStats() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState({
    organizations: 0,
    animals: 0,
    producers: 0,
    users: 0,
    orders: 0,
  });
  const [chartData, setChartData] = useState<Array<{
    date: string;
    users: number;
    organizations: number;
    orders: number;
  }>>([]);

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchStats();
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const fetchStats = async () => {
    try {
      const [orgsRes, animalsRes, producersRes, usersRes, ordersRes] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('animals').select('id', { count: 'exact', head: true }),
        supabase.from('producers').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        organizations: orgsRes.count || 0,
        animals: animalsRes.count || 0,
        producers: producersRes.count || 0,
        users: usersRes.count || 0,
        orders: ordersRes.count || 0,
      });

      // Fetch trend data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      const [usersData, orgsData, ordersData] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgoISO),
        supabase.from('organizations').select('created_at').gte('created_at', thirtyDaysAgoISO),
        supabase.from('orders').select('created_at').gte('created_at', thirtyDaysAgoISO),
      ]);

      // Group data by day
      const dataByDay = new Map<string, { users: number; organizations: number; orders: number }>();
      
      // Initialize all days with 0
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateKey = date.toISOString().split('T')[0];
        dataByDay.set(dateKey, { users: 0, organizations: 0, orders: 0 });
      }

      // Count users by day
      usersData.data?.forEach(item => {
        const dateKey = item.created_at?.split('T')[0];
        if (dateKey && dataByDay.has(dateKey)) {
          dataByDay.get(dateKey)!.users++;
        }
      });

      // Count organizations by day
      orgsData.data?.forEach(item => {
        const dateKey = item.created_at?.split('T')[0];
        if (dateKey && dataByDay.has(dateKey)) {
          dataByDay.get(dateKey)!.organizations++;
        }
      });

      // Count orders by day
      ordersData.data?.forEach(item => {
        const dateKey = item.created_at?.split('T')[0];
        if (dateKey && dataByDay.has(dateKey)) {
          dataByDay.get(dateKey)!.orders++;
        }
      });

      // Convert to array format for chart
      const chartDataArray = Array.from(dataByDay.entries()).map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
        ...counts,
      }));

      setChartData(chartDataArray);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać statystyk",
        variant: "destructive"
      });
    }
  };

  const statCards = [
    {
      title: "Organizacje",
      value: stats.organizations,
      icon: Building2,
      description: "Zarejestrowanych organizacji",
      link: "/admin/organizacje"
    },
    {
      title: "Zwierzęta",
      value: stats.animals,
      icon: Heart,
      description: "Zwierząt w systemie",
      link: "/admin/zwierzeta"
    },
    {
      title: "Producenci",
      value: stats.producers,
      icon: Factory,
      description: "Producentów w bazie",
      link: "/admin/producenci"
    },
    {
      title: "Użytkownicy",
      value: stats.users,
      icon: Users,
      description: "Zarejestrowanych użytkowników",
      link: "/admin/uzytkownicy"
    },
    {
      title: "Zamówienia",
      value: stats.orders,
      icon: ShoppingCart,
      description: "Złożonych zamówień",
      link: "/admin/zamowienia"
    },
  ];

  const chartConfig = {
    users: {
      label: "Użytkownicy",
      color: "hsl(var(--chart-1))",
    },
    organizations: {
      label: "Organizacje",
      color: "hsl(var(--chart-2))",
    },
    orders: {
      label: "Zamówienia",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="rounded-3xl shadow-bubbly hover:shadow-bubbly-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle>Trendy wzrostu (ostatnie 30 dni)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Użytkownicy"
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="organizations" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Organizacje"
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Zamówienia"
                  dot={{ fill: 'hsl(var(--chart-3))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle>Witaj w Panelu Administratora</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Zarządzaj organizacjami, zwierzętami, producentami, produktami i użytkownikami systemu Fundacji PWM.
            Skorzystaj z menu po lewej stronie, aby przejść do poszczególnych sekcji.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
