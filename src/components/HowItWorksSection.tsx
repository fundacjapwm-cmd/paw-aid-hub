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
      <section id="jak-to-dziala" className="py-16 md:py-20 bg-gradient-to-b from-white via-orange-50/30 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Jak to działa?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Pomoc zwierzętom nigdy nie była prostsza. Poznaj <span className="text-primary font-semibold">4 proste kroki</span> do czynienia dobra.
          </p>

          {/* Horizontal Timeline - Kompaktowy */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden md:block absolute top-12 left-0 right-0 border-t-2 border-dashed border-primary/30 -z-10 mx-12" />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                
                return (
                  <div 
                    key={index}
                    className="flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300"
                  >
                    {/* Icon Circle with Badge */}
                    <div className="relative mb-6 z-10">
                      <div className="w-24 h-24 bg-white rounded-full shadow-bubbly flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                        <StepIcon className="h-10 w-10 text-primary" />
                      </div>
                      
                      {/* Number Badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-soft z-20">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Co chcesz teraz zrobić?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
