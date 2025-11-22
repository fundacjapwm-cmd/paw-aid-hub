import { MousePointerClick, ShoppingBag, ShieldCheck, Gift, Heart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Wybierz Sercem",
      description: "Przejrzyj profile naszych podopiecznych. Poznaj ich historie i wybierz tego, który skradnie Twoje serce.",
    },
    {
      icon: ShoppingBag,
      title: "Napełnij Brzuszek",
      description: "Wybierz produkty z listy życzeń. Nie musisz kupować wszystkiego - każda puszka karmy to realna pomoc.",
    },
    {
      icon: ShieldCheck,
      title: "Bezpieczna Płatność",
      description: "Zapłać szybko i bezpiecznie przez PayU/BLIK. My zajmiemy się resztą logistyki.",
    },
    {
      icon: Gift,
      title: "Radość i Transparentność",
      description: "Dostarczamy dary prosto do schroniska. Dostaniesz powiadomienie i zobaczysz, jak pasek postępu rośnie!",
    },
  ];

  return (
    <>
      {/* Hero Header */}
      <section id="jak-to-dziala" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Jak to działa?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Pomoc zwierzętom nigdy nie była prostsza. Poznaj <span className="text-primary font-semibold">4 proste kroki</span> do czynienia dobra.
          </p>
        </div>
      </section>

      {/* Zig-Zag Timeline Section */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          {/* Timeline Container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Central Dashed Line - Desktop Only */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-primary/30 -translate-x-1/2" />

            {/* Steps */}
            <div className="space-y-16 md:space-y-24">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                const StepIcon = step.icon;
                
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    
                    {/* Content Card (Left or Right) */}
                    <div className="flex-1 w-full">
                      <div 
                        className={`
                          bg-white/80 backdrop-blur-sm
                          p-8 md:p-10 rounded-[2.5rem] 
                          shadow-card hover:shadow-bubbly 
                          transition-all duration-500 
                          border border-white
                          relative group
                          hover:-translate-y-2
                          ${isEven ? 'md:text-right' : 'md:text-left'}
                        `}
                      >
                        {/* Floating Step Number Badge */}
                        <div 
                          className={`
                            absolute -top-4 
                            ${isEven ? 'md:right-8 right-6' : 'md:left-8 left-6'} 
                            w-12 h-12 
                            bg-gradient-to-br from-primary to-primary/80
                            text-white rounded-2xl 
                            flex items-center justify-center 
                            text-xl font-bold 
                            shadow-lg 
                            transform group-hover:-translate-y-2 group-hover:scale-110
                            transition-all duration-300
                            z-10
                          `}
                        >
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="space-y-4 pt-4">
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

                    {/* Timeline Node Icon (Center) - Glassmorphism */}
                    <div className="relative z-10 shrink-0">
                      <div 
                        className="
                          w-24 h-24 md:w-28 md:h-28
                          bg-white/80 backdrop-blur-md
                          rounded-full 
                          border-4 border-white
                          flex items-center justify-center 
                          shadow-bubbly
                          hover:scale-110 hover:rotate-12
                          transition-all duration-500
                          group
                        "
                      >
                        <StepIcon className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:scale-110 transition-transform" />
                      </div>

                      {/* Pulse Animation Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-30" />
                    </div>

                    {/* Empty Space for Balance (Desktop) */}
                    <div className="flex-1 w-full hidden md:block" />
                    
                  </div>
                );
              })}
            </div>

            {/* End Cap */}
            <div className="mt-20 md:mt-28 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl flex items-center justify-center shadow-bubbly animate-pulse">
                  <div className="w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section - Grand Finale */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Co chcesz teraz zrobić?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Wybierz swoją ścieżkę i rozpocznij pomaganie już dziś
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: Donor Path */}
            <div className="group">
              <div className="relative bg-primary/5 backdrop-blur-sm rounded-[3rem] p-10 md:p-12 border-2 border-primary/10 hover:border-primary/30 shadow-card hover:shadow-bubbly transition-all duration-500 hover:-translate-y-3 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Heart className="w-10 h-10 text-primary fill-primary/20 group-hover:fill-primary transition-all" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Chcę pomóc
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Wybierz zwierzaka i spraw mu radość. Każda pomoc się liczy - od jednej puszki karmy po pełną listę życzeń.
                  </p>
                </div>

                {/* CTA Button */}
                <Link to="/zwierzeta">
                  <Button 
                    variant="default" 
                    size="lg"
                    className="w-full text-lg py-6 rounded-2xl shadow-soft hover:shadow-bubbly transition-all group-hover:scale-105"
                  >
                    Przeglądaj Zwierzęta
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                {/* Decorative Gradient */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

            {/* Card 2: Organization Path */}
            <div className="group">
              <div className="relative bg-blue-50/80 backdrop-blur-sm rounded-[3rem] p-10 md:p-12 border-2 border-blue-100 hover:border-blue-200 shadow-card hover:shadow-bubbly transition-all duration-500 hover:-translate-y-3 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <Building2 className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    Chcę dołączyć
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Prowadzisz fundację lub schronisko? Dołącz do nas i zyskaj wsparcie tysięcy darczyńców.
                  </p>
                </div>

                {/* CTA Button */}
                <a href="/#dolacz">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full text-lg py-6 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-soft hover:shadow-bubbly transition-all group-hover:scale-105"
                  >
                    Zgłoś Organizację
                    <Building2 className="ml-2 h-5 w-5" />
                  </Button>
                </a>

                {/* Decorative Gradient */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorksSection;
