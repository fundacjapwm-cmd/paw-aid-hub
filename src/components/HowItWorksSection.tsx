import { MousePointerClick, ShoppingBag, CreditCard, Truck, Heart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Wybierz",
      description: "Spośród naszych kochanych czworonogów tego lub tych, których chcesz dziś wesprzeć",
    },
    {
      icon: ShoppingBag,
      title: "Dodaj",
      description: "Dodaj potrzebne im produkty do koszyka. Wielkość i ilość zamówienia zależy tylko od Ciebie, każda pomoc się liczy!",
    },
    {
      icon: CreditCard,
      title: "Zapłać",
      description: "Aby proces był jak najłatwiejszy, zdecydowaliśmy się na Przelewy24. Możesz płacić szybko i wygodnie",
    },
    {
      icon: Truck,
      title: "My dostarczamy",
      description: "Wysyłkę bierzemy na siebie! Dopilnujemy, aby Twoje zamówienie dotarło tam gdzie trzeba",
    },
  ];

  return (
    <>
      {/* Main Section with Floating Pill */}
      <section id="jak-to-dziala" className="relative z-20 px-4 py-8 md:py-12 bg-gradient-to-b from-background via-orange-50/20 to-background">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Jak to działa?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Pomoc zwierzętom nigdy nie była prostsza. Poznaj <span className="text-primary font-semibold">4 proste kroki</span> do czynienia dobra.
            </p>
          </div>

          {/* The Floating Pill Container */}
          <div className="bg-white rounded-[2.5rem] md:rounded-full shadow-xl border border-primary/10 -mt-8 md:-mt-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
              
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isFirst = index === 0;
                const isLast = index === steps.length - 1;
                
                return (
                  <div 
                    key={index}
                    className={`
                      flex-1 py-8 px-6 flex flex-col items-center text-center group 
                      hover:bg-gray-50/50 transition-colors duration-300
                      ${isFirst ? 'rounded-t-[2.5rem] md:rounded-l-full md:rounded-tr-none' : ''}
                      ${isLast ? 'rounded-b-[2.5rem] md:rounded-r-full md:rounded-bl-none' : ''}
                    `}
                  >
                    {/* Icon (no background, just colored) */}
                    <StepIcon className="w-12 h-12 text-primary mb-4 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                      {step.description}
                    </p>
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
