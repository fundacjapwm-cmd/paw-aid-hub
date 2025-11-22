import { HandHeart, Dog, Building2, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      <div className="mb-2 p-3 bg-primary/10 rounded-2xl text-primary">
        {icon}
      </div>
      <span className="text-3xl md:text-4xl font-black text-foreground">
        {formattedValue}{suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
        {label}
      </span>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-8 px-4 relative z-20 -mt-[72px]">
      <div className="container mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl p-8 md:p-10 border border-primary/10 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:flex md:justify-around md:items-center gap-8 md:gap-0 md:divide-x md:divide-primary/10">
            <StatItem
              value={0}
              label="Wsparcie przekazane"
              suffix=" zł"
              icon={<HandHeart className="w-6 h-6" />}
            />
            
            <StatItem
              value={12}
              label="Nakarmionych zwierząt"
              icon={<Dog className="w-6 h-6" />}
            />
            
            <StatItem
              value={3}
              label="Wspieranych organizacji"
              icon={<Building2 className="w-6 h-6" />}
            />
            
            <StatItem
              value={0}
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
