import { Heart, Building2, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  className?: string;
  isMain?: boolean;
  suffix?: string;
}

const StatCard = ({ value, label, icon, className = "", isMain = false, suffix = "" }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [hasAnimated]);

  const animateValue = () => {
    const duration = 2000; // 2 seconds
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
    <div
      ref={cardRef}
      className={`
        ${className} 
        rounded-3xl p-6 md:p-8 
        hover:scale-[1.02] transition-all duration-300 
        shadow-card
        ${isMain ? 'relative overflow-hidden' : ''}
      `}
    >
      {isMain && (
        <div className="absolute -right-8 -bottom-8 opacity-20">
          <Sparkles className="h-48 w-48" />
        </div>
      )}
      
      <div className={`relative z-10 h-full flex flex-col ${isMain ? 'justify-center items-center text-center' : 'justify-between'}`}>
        {!isMain && (
          <div className={`${isMain ? 'mb-6' : 'mb-4'} flex justify-center md:justify-start`}>
            {icon}
          </div>
        )}
        
        <div className={isMain ? 'space-y-4' : 'space-y-2'}>
          <p className={`font-bold ${isMain ? 'text-5xl md:text-7xl' : 'text-3xl md:text-4xl'} ${isMain ? 'text-white' : 'text-foreground'}`}>
            {formattedValue}{suffix}
          </p>
          <p className={`${isMain ? 'text-lg md:text-xl' : 'text-sm md:text-base'} ${isMain ? 'text-white/90' : 'text-muted-foreground'}`}>
            {label}
          </p>
        </div>

        {isMain && (
          <div className="mt-6">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Razem możemy więcej
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zobacz, jak wiele udało nam się osiągnąć dzięki wspólnym działaniom
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 max-w-6xl mx-auto">
          {/* Main Card - Zebrane środki (col-span-2 row-span-2 on desktop) */}
          <StatCard
            value={328445}
            label="Zebranych środków"
            suffix=" zł"
            icon={<Sparkles className="h-16 w-16 text-white" />}
            className="col-span-2 row-span-2 bg-gradient-to-br from-primary/80 to-primary text-white"
            isMain={true}
          />

          {/* Animals Card (row-span-2 on desktop) */}
          <StatCard
            value={1247}
            label="Wspartych zwierząt"
            icon={
              <div className="bg-primary rounded-2xl p-3 w-14 h-14 flex items-center justify-center">
                <Heart className="h-7 w-7 text-white fill-white animate-pulse" />
              </div>
            }
            className="col-span-2 md:col-span-1 md:row-span-2 bg-white border-2 border-primary/10"
          />

          {/* Organizations Card */}
          <StatCard
            value={89}
            label="Organizacji"
            icon={
              <div className="bg-secondary rounded-2xl p-3 w-14 h-14 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-white" />
              </div>
            }
            className="bg-secondary/20"
          />

          {/* Products Card */}
          <StatCard
            value={15623}
            label="Zakupionych produktów"
            icon={
              <div className="bg-accent rounded-2xl p-3 w-14 h-14 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>
            }
            className="bg-accent/20"
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
