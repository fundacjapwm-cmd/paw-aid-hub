import heartCoinsIcon from "@/assets/icons/heart-coins.png";
import animalsPawIcon from "@/assets/icons/animals-paw.png";
import donationBoxIcon from "@/assets/icons/donation-box.png";
import shelterHomeIcon from "@/assets/icons/shelter-home.png";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  noBackground?: boolean;
}

const StatItem = ({ value, label, icon, suffix = "", noBackground = false }: StatItemProps) => {
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
      <div className={`${noBackground ? 'mb-0' : 'mb-2 md:mb-3 p-3 bg-primary/10 rounded-2xl'} text-primary`}>
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

    // Set up realtime subscription for orders, order_items, and organizations changes
    const channel = supabase
      .channel('stats-realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total amount from completed orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const totalAmount = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Fetch order items for completed orders to count animals and products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('animal_id, quantity, orders!inner(payment_status)')
        .eq('orders.payment_status', 'completed');

      // Count unique animals helped
      const uniqueAnimals = new Set(orderItems?.filter(item => item.animal_id).map(item => item.animal_id) || []);
      const animalsHelped = uniqueAnimals.size;

      // Count total products delivered (sum of quantities)
      const totalProducts = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      // Fetch count of active organizations using secure RPC
      const { data: orgsData, error: orgsError } = await supabase
        .rpc('get_public_organizations');
      
      const orgCount = orgsError ? 0 : (orgsData?.length || 0);

      setStats({
        totalAmount: Math.round(totalAmount),
        animalsHelped,
        organizations: orgCount || 0,
        deliveredOrders: totalProducts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <section className="py-8 md:py-12 relative z-20 -mt-8 md:-mt-16">
      <div className="md:container md:mx-auto md:px-8 px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl p-6 md:p-8 border border-primary/10">
          <div className="grid grid-cols-2 md:flex md:justify-around md:items-center gap-8 md:gap-0 md:divide-x md:divide-primary/10">
            <StatItem
              value={stats.totalAmount}
              label="Wsparcie przekazane"
              suffix=" zł"
              icon={<img src={heartCoinsIcon} alt="Wsparcie" className="w-20 h-20 md:w-32 md:h-32 object-contain scale-150" />}
              noBackground
            />
            
            <StatItem
              value={stats.animalsHelped}
              label="Wspartych zwierząt"
              icon={<img src={animalsPawIcon} alt="Zwierzęta" className="w-20 h-20 md:w-32 md:h-32 object-contain scale-150" />}
              noBackground
            />
            
            <StatItem
              value={stats.organizations}
              label="Wspieranych organizacji"
              icon={<img src={shelterHomeIcon} alt="Organizacje" className="w-20 h-20 md:w-32 md:h-32 object-contain scale-150" />}
              noBackground
            />
            
            <StatItem
              value={stats.deliveredOrders}
              label="Dostarczonych produktów"
              icon={<img src={donationBoxIcon} alt="Produkty" className="w-20 h-20 md:w-32 md:h-32 object-contain scale-150" />}
              noBackground
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
