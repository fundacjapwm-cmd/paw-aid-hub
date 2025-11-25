import { HandHeart, Dog, Building2, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}

const StatItem = ({ value, label, icon, suffix = "" }: StatItemProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, [hasAnimated]);

  const animateValue = () => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.min(Math.floor(stepValue * currentStep), value));

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, duration / steps);
  };

  const formattedValue = displayValue.toLocaleString('pl-PL');

  return (
    <div ref={itemRef} className="flex flex-col items-center text-center px-4">
      <div className="mb-2 md:mb-3 p-3 bg-primary/10 rounded-2xl text-primary">
        {icon}
      </div>
      <span className="text-3xl md:text-4xl font-black text-foreground">
        {formattedValue}{suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1 md:mt-2">
        {label}
      </span>
    </div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalAmount: 0,
    animalsHelped: 0,
    organizations: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total amount from completed orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('payment_status', 'completed');

      const totalAmount = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Fetch count of unique animals that have items in orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('animal_id, orders!inner(payment_status)')
        .not('animal_id', 'is', null)
        .eq('orders.payment_status', 'completed');

      const uniqueAnimals = new Set(orderItems?.map(item => item.animal_id) || []);
      const animalsHelped = uniqueAnimals.size;

      // Fetch count of active organizations
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Fetch count of delivered orders (completed status)
      const { count: deliveredCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('payment_status', 'completed');

      setStats({
        totalAmount: Math.round(totalAmount),
        animalsHelped,
        organizations: orgCount || 0,
        deliveredOrders: deliveredCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <section className="py-8 md:py-12 px-4 md:px-8 relative z-20 -mt-16">
      <div className="container mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl p-6 md:p-8 border border-primary/10 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:flex md:justify-around md:items-center gap-8 md:gap-0 md:divide-x md:divide-primary/10">
            <StatItem
              value={stats.totalAmount}
              label="Wsparcie przekazane"
              suffix=" zł"
              icon={<HandHeart className="w-6 h-6" />}
            />
            
            <StatItem
              value={stats.animalsHelped}
              label="Wspartych zwierząt"
              icon={<Dog className="w-6 h-6" />}
            />
            
            <StatItem
              value={stats.organizations}
              label="Wspieranych organizacji"
              icon={<Building2 className="w-6 h-6" />}
            />
            
            <StatItem
              value={stats.deliveredOrders}
              label="Dostarczonych darów"
              icon={<Package className="w-6 h-6" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
