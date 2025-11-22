import { MousePointerClick, ShoppingBag, CreditCard, Truck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Wybierz",
      description: "Znajdź swojego ulubieńca spośród zwierzaków czekających na pomoc. Każdy ma swoją historię i listę życzeń.",
    },
    {
      icon: ShoppingBag,
      title: "Dodaj",
      description: "Skompletuj paczkę z potrzebnymi produktami. Możesz wybrać konkretne rzeczy lub całą listę jednym kliknięciem.",
    },
    {
      icon: CreditCard,
      title: "Zapłać",
      description: "Szybki i bezpieczny przelew przez Przelewy24. BLIK, karta, przelew - wybierz co wolisz.",
    },
    {
      icon: Truck,
      title: "Dostawa",
      description: "My zawozimy! Zajmiemy się wszystkim, aby Twoja paczka dotarła bezpośrednio do podopiecznego.",
    },
  ];

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Jak to działa?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            4 proste kroki do merdającego ogona
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Dashed Line - Desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-primary/30 -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const StepIcon = step.icon;
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  style={{ 
                    animationDelay: `${index * 150}ms` 
                  }}
                >
                  
                  {/* Content Card (Left or Right) */}
                  <div className="flex-1 w-full">
                    <div 
                      className={`
                        bg-card p-8 md:p-10 rounded-[2.5rem] 
                        shadow-card hover:shadow-bubbly 
                        transition-all duration-500 
                        border border-border/50
                        relative group
                        hover:-translate-y-2
                        ${isEven ? 'md:text-right' : 'md:text-left'}
                      `}
                    >
                      {/* Floating Step Number Badge */}
                      <div 
                        className={`
                          absolute -top-6 
                          ${isEven ? 'md:right-8 right-6' : 'md:left-8 left-6'} 
                          w-14 h-14 
                          bg-gradient-to-br from-primary to-primary/80
                          text-white rounded-2xl 
                          flex items-center justify-center 
                          text-2xl font-bold 
                          shadow-lg 
                          transform group-hover:-translate-y-2 
                          transition-transform duration-300
                        `}
                      >
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Subtle Gradient Overlay */}
                      <div 
                        className={`
                          absolute inset-0 rounded-[2.5rem] 
                          bg-gradient-to-br from-primary/5 to-transparent 
                          opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500 
                          pointer-events-none
                        `}
                      />
                    </div>
                  </div>

                  {/* Timeline Node Icon (Center) */}
                  <div className="relative z-10 shrink-0">
                    <div 
                      className="
                        w-20 h-20 md:w-24 md:h-24
                        bg-card rounded-full 
                        border-4 border-primary/20 
                        flex items-center justify-center 
                        shadow-soft
                        hover:scale-110 hover:border-primary/40
                        transition-all duration-300
                        group
                      "
                    >
                      <StepIcon className="w-9 h-9 md:w-11 md:h-11 text-primary group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Pulse Animation Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20" />
                  </div>

                  {/* Empty Space for Balance (Desktop) */}
                  <div className="flex-1 w-full hidden md:block" />
                  
                </div>
              );
            })}
          </div>

          {/* End Cap */}
          <div className="mt-16 md:mt-24 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-bubbly animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;