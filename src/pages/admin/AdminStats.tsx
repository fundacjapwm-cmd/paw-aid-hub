import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Heart, Factory, Users, Package, ShoppingCart } from 'lucide-react';

export default function AdminStats() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState({
    organizations: 0,
    animals: 0,
    producers: 0,
    products: 0,
    users: 0,
    orders: 0,
  });

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
      const [orgsRes, animalsRes, producersRes, productsRes, usersRes, ordersRes] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('animals').select('id', { count: 'exact', head: true }),
        supabase.from('producers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        organizations: orgsRes.count || 0,
        animals: animalsRes.count || 0,
        producers: producersRes.count || 0,
        products: productsRes.count || 0,
        users: usersRes.count || 0,
        orders: ordersRes.count || 0,
      });
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
      description: "Zarejestrowanych organizacji"
    },
    {
      title: "Zwierzęta",
      value: stats.animals,
      icon: Heart,
      description: "Zwierząt w systemie"
    },
    {
      title: "Producenci",
      value: stats.producers,
      icon: Factory,
      description: "Producentów w bazie"
    },
    {
      title: "Produkty",
      value: stats.products,
      icon: Package,
      description: "Dostępnych produktów"
    },
    {
      title: "Użytkownicy",
      value: stats.users,
      icon: Users,
      description: "Zarejestrowanych użytkowników"
    },
    {
      title: "Zamówienia",
      value: stats.orders,
      icon: ShoppingCart,
      description: "Złożonych zamówień"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="rounded-3xl shadow-bubbly hover:shadow-bubbly-lg transition-shadow">
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
        ))}
      </div>

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
