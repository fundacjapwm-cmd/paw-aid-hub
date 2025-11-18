import { MousePointerClick, ShoppingBag, CreditCard, Truck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Wybierz",
      description: "Spośród naszych kochanych czworonogów wybierz tego, któremu chcesz pomóc",
    },
    {
      icon: ShoppingBag,
      title: "Dodaj",
      description: "Dodaj potrzebne im produkty do koszyka i przejdź do płatności",
    },
    {
      icon: CreditCard,
      title: "Zapłać",
      description: "Płatność przez Przelewy24 - szybko, bezpiecznie i wygodnie",
    },
    {
      icon: Truck,
      title: "My dostarczamy",
      description: "Wysyłkę bierzemy na siebie! Produkty trafią bezpośrednio do organizacji",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Jak to działa?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Pomoc zwierzętom nigdy nie była prostsza. Wystarczą cztery proste kroki!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2"
            >
              {/* Step Number */}
              <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-soft">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="bg-primary/10 rounded-2xl p-3 sm:p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                <step.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;