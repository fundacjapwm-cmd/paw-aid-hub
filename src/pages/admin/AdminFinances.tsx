import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, DollarSign, Percent, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';

type FinancialStats = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  orderCount: number;
};

type ChartDataPoint = {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
};

export default function AdminFinances() {
  const { user, profile, loading } = useAuth();
  const [dailyStats, setDailyStats] = useState<FinancialStats>({ totalRevenue: 0, totalCost: 0, totalProfit: 0, averageMargin: 0, orderCount: 0 });
  const [weeklyStats, setWeeklyStats] = useState<FinancialStats>({ totalRevenue: 0, totalCost: 0, totalProfit: 0, averageMargin: 0, orderCount: 0 });
  const [monthlyStats, setMonthlyStats] = useState<FinancialStats>({ totalRevenue: 0, totalCost: 0, totalProfit: 0, averageMargin: 0, orderCount: 0 });
  const [dailyChartData, setDailyChartData] = useState<ChartDataPoint[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<ChartDataPoint[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchFinancialData();
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

  const fetchFinancialData = async () => {
    try {
      // Fetch completed orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          payment_status,
          order_items (
            quantity,
            unit_price,
            product_id,
            products (
              purchase_price,
              price
            )
          )
        `)
        .eq('payment_status', 'completed');

      if (ordersError) throw ordersError;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats
      const calculateStats = (startDate: Date): FinancialStats => {
        const filteredOrders = orders?.filter(order => new Date(order.created_at!) >= startDate) || [];
        
        let totalRevenue = 0;
        let totalCost = 0;

        filteredOrders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            const revenue = item.unit_price * item.quantity;
            const cost = (item.products?.purchase_price || 0) * item.quantity;
            totalRevenue += revenue;
            totalCost += cost;
          });
        });

        const totalProfit = totalRevenue - totalCost;
        const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
          totalRevenue,
          totalCost,
          totalProfit,
          averageMargin,
          orderCount: filteredOrders.length
        };
      };

      setDailyStats(calculateStats(todayStart));
      setWeeklyStats(calculateStats(weekStart));
      setMonthlyStats(calculateStats(monthStart));

      // Generate chart data for last 7 days
      const dailyData: ChartDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at!);
          return orderDate >= dayStart && orderDate < dayEnd;
        }) || [];

        let revenue = 0;
        let cost = 0;

        dayOrders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            revenue += item.unit_price * item.quantity;
            cost += (item.products?.purchase_price || 0) * item.quantity;
          });
        });

        dailyData.push({
          date: date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
          revenue,
          cost,
          profit: revenue - cost
        });
      }
      setDailyChartData(dailyData);

      // Generate chart data for last 4 weeks
      const weeklyData: ChartDataPoint[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at!);
          return orderDate >= weekStart && orderDate < weekEnd;
        }) || [];

        let revenue = 0;
        let cost = 0;

        weekOrders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            revenue += item.unit_price * item.quantity;
            cost += (item.products?.purchase_price || 0) * item.quantity;
          });
        });

        weeklyData.push({
          date: `Tydz. ${4 - i}`,
          revenue,
          cost,
          profit: revenue - cost
        });
      }
      setWeeklyChartData(weeklyData);

      // Generate chart data for last 12 months
      const monthlyData: ChartDataPoint[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at!);
          return orderDate >= monthDate && orderDate < monthEnd;
        }) || [];

        let revenue = 0;
        let cost = 0;

        monthOrders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            revenue += item.unit_price * item.quantity;
            cost += (item.products?.purchase_price || 0) * item.quantity;
          });
        });

        monthlyData.push({
          date: monthDate.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' }),
          revenue,
          cost,
          profit: revenue - cost
        });
      }
      setMonthlyChartData(monthlyData);

    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych finansowych",
        variant: "destructive"
      });
    }
  };

  const chartConfig = {
    revenue: {
      label: "Przychody",
      color: "hsl(var(--chart-1))",
    },
    cost: {
      label: "Koszty",
      color: "hsl(var(--chart-2))",
    },
    profit: {
      label: "Zysk",
      color: "hsl(var(--chart-3))",
    },
  };

  const renderStatsCards = (stats: FinancialStats) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Przychody</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} zł</div>
        </CardContent>
      </Card>
      
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Koszty</CardTitle>
          <TrendingUp className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCost.toFixed(2)} zł</div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Zysk</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProfit.toFixed(2)} zł</div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Średnia marża</CardTitle>
          <Percent className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageMargin.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Zamówienia</CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.orderCount}</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChart = (data: ChartDataPoint[]) => (
    <Card className="rounded-3xl shadow-bubbly">
      <CardHeader>
        <CardTitle>Wykres finansowy</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Przychody" />
              <Bar dataKey="cost" fill="hsl(var(--chart-2))" name="Koszty" />
              <Bar dataKey="profit" fill="hsl(var(--chart-3))" name="Zysk" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wyniki Finansowe</h2>
        <p className="text-muted-foreground">Przegląd wyników finansowych i statystyk sprzedaży</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="rounded-3xl">
          <TabsTrigger value="daily" className="rounded-3xl">Dziś</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-3xl">Ten tydzień</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-3xl">Ten miesiąc</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {renderStatsCards(dailyStats)}
          {renderChart(dailyChartData)}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {renderStatsCards(weeklyStats)}
          {renderChart(weeklyChartData)}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {renderStatsCards(monthlyStats)}
          {renderChart(monthlyChartData)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
