import { MousePointerClick, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: MousePointerClick,
    title: "Wybierz",
    description: "Znajdź zwierzaka, któremu chcesz pomóc.",
  },
  {
    icon: ShoppingBag,
    title: "Dodaj",
    description: "Wybierz produkty z jego listy życzeń.",
  },
  {
    icon: CreditCard,
    title: "Zapłać",
    description: "Bezpieczna płatność online (PayU).",
  },
  {
    icon: Truck,
    title: "Dostawa",
    description: "My dostarczamy dary do schroniska.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative pb-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* GŁÓWNY KONTENER "KAPSUŁA" */}
        {/* -mt-16 sprawia, że pasek nachodzi na sekcję powyżej (efekt 3D) */}
        <div className="relative z-20 -mt-16 md:-mt-24 max-w-6xl mx-auto">
          
          {/* To jest ta biała bryła: rounded-[2.5rem] tworzy kształt pigułki */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-primary/10 overflow-hidden">
            
            {/* UKŁAD WEWNĘTRZNY: */}
            {/* Używamy 'divide-x', aby stworzyć pionowe linie między elementami */}
            {/* NIE MA TUTAJ 'gap', elementy stykają się krawędziami */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
              
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex-1 py-10 px-4 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors duration-300 cursor-default"
                >
                  {/* Ikona: Duża, kolorowa, bez tła */}
                  <div className="mb-4 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                    <step.icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
                    {step.description}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Sekcja CTA (Przyciski pod spodem) */}
        <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
          {/* Karta Darczyńcy */}
          <div className="bg-primary/5 rounded-3xl p-8 text-center border border-primary/10 hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-2 text-foreground">Chcę pomóc 💝</h3>
            <p className="text-muted-foreground mb-6">Spraw radość zwierzakom już teraz.</p>
            <Link to="/zwierzeta">
              <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-bubbly w-full sm:w-auto">
                Przeglądaj Zwierzęta
              </Button>
            </Link>
          </div>

          {/* Karta Organizacji */}
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-2 text-foreground">Jestem organizacją 🏠</h3>
            <p className="text-muted-foreground mb-6">Dołącz do nas i otrzymuj wsparcie.</p>
            <a href="/#dolacz">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary hover:bg-primary/5 w-full sm:w-auto">
                Zgłoś Organizację
              </Button>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
