import { Heart, ShoppingBag, CreditCard, Package, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroCatDog from "@/assets/hero-catdog.png";
import heroCat1 from "@/assets/hero-cat1.png";
import heroDog1 from "@/assets/hero-dog1.png";
import heroDog2 from "@/assets/hero-dog2.png";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Heart,
      iconBg: "bg-yellow-400",
      title: "Wybierz",
      description: "Spośród naszych kochanych czworonogów tego lub tych, których chcesz dziś wesprzeć",
      image: heroCatDog,
    },
    {
      icon: ShoppingBag,
      iconBg: "bg-blue-400",
      title: "Dodaj",
      description: "Dodaj potrzebne im produkty do koszyka. Wielkość i ilość zamówienia zależy tylko od Ciebie, każda pomoc się liczy!",
      image: heroCat1,
    },
    {
      icon: CreditCard,
      iconBg: "bg-green-600",
      title: "Zapłać",
      description: "Aby proces był jak najłatwiejszy, zdecydowaliśmy się na Przelewy24. Możesz płacić szybko i wygodnie",
      image: heroDog1,
    },
    {
      icon: Package,
      iconBg: "bg-orange-400",
      title: "My dostarczamy",
      description: "Wysyłkę bierzemy na siebie! Dopilnujemy, aby Twoje zamówienie dotarło tam gdzie trzeba",
      image: heroDog2,
    },
  ];

  return (
    <>
      {/* Hero Header */}
      <section id="jak-to-dziala" className="py-16 md:py-24 bg-gradient-to-b from-background via-orange-50/20 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Jak to działa?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Pomoc zwierzętom nigdy nie była prostsza. Poznaj <span className="text-primary font-semibold">4 proste kroki</span> do czynienia dobra.
            </p>
          </div>

          {/* Overlapping Pills Container */}
          <div className="relative max-w-7xl mx-auto">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col gap-6 md:hidden">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                
                return (
                  <div 
                    key={index}
                    className="relative min-h-[70vh] overflow-hidden group"
                    style={{
                      borderRadius: '200px 200px 200px 200px',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.5)'
                    }}
                  >
                    {/* Background Image */}
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/90" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end px-8 py-16 text-white">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${step.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                        <StepIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-3xl font-bold mb-3">
                        {step.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-base leading-relaxed opacity-90">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Overlapping horizontal layout */}
            <div className="hidden md:flex md:justify-center md:items-center md:min-h-[70vh] md:relative">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const offsetX = index * 220; // Horizontal spacing
                const offsetY = index % 2 === 0 ? 0 : 40; // Alternating vertical offset
                
                return (
                  <div 
                    key={index}
                    className="absolute transition-all duration-500 hover:scale-105 hover:z-50 hover:rotate-0"
                    style={{
                      left: `${offsetX}px`,
                      top: `${offsetY}px`,
                      zIndex: index,
                      transform: index === 1 ? 'rotate(-2deg)' : index === 2 ? 'rotate(1deg)' : index === 3 ? 'rotate(-1deg)' : 'rotate(0deg)',
                    }}
                  >
                    {/* Pill-shaped Card */}
                    <div 
                      className="w-[320px] overflow-hidden"
                      style={{
                        minHeight: '70vh',
                        borderRadius: '200px 200px 200px 200px',
                        boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.5)'
                      }}
                    >
                      {/* Background Image */}
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-black/90" />
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-end px-8 py-16 text-white">
                        {/* Icon */}
                        <div className={`w-14 h-14 ${step.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                          <StepIcon className="w-7 h-7 text-white" />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-3xl font-bold mb-3">
                          {step.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-base leading-relaxed opacity-90">
                          {step.description}
                        </p>
                      </div>
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
