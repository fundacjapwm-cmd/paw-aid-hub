import { MousePointerClick, ShoppingBag, CreditCard, Truck } from "lucide-react";
import catDog from "@/assets/how-it-works/cat-dog.png";
import kittensBasket from "@/assets/how-it-works/kittens-basket.jpg";
import creditCard from "@/assets/how-it-works/credit-card.png";
import dogPaw from "@/assets/how-it-works/dog-paw.png";

const HowItWorks = () => {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Wybierz",
      description: "Znajdź swojego ulubieńca spośród zwierzaków czekających na pomoc. Każdy ma swoją historię i listę życzeń.",
      image: catDog,
    },
    {
      icon: ShoppingBag,
      title: "Dodaj",
      description: "Skompletuj paczkę z potrzebnymi produktami. Możesz wybrać konkretne rzeczy lub całą listę jednym kliknięciem.",
      image: kittensBasket,
    },
    {
      icon: CreditCard,
      title: "Zapłać",
      description: "Aby proces był jak najłatwiejszy, zdecydowaliśmy się na PayU. Możesz płacić szybko i wygodnie.",
      image: creditCard,
    },
    {
      icon: Truck,
      title: "Dostawa",
      description: "My zawozimy! Zajmiemy się wszystkim, aby Twoja paczka dotarła bezpośrednio do podopiecznego.",
      image: dogPaw,
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
                        bg-card rounded-[2.5rem] 
                        shadow-card 
                        transition-all duration-500 
                        border border-border/50
                        relative group
                        overflow-hidden
                        md:hover:shadow-bubbly
                        md:hover:-translate-y-2
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
                          transform md:group-hover:-translate-y-2 
                          transition-transform duration-300
                          z-10
                        `}
                      >
                        {index + 1}
                      </div>

                      {/* Card Content with Image */}
                      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6`}>
                        
                        {/* Image Section */}
                        <div className="md:w-2/5 relative overflow-hidden">
                          <div className="aspect-square md:aspect-auto md:h-full relative">
                            <img 
                              src={step.image} 
                              alt={step.title}
                              className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Image Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent md:hidden" />
                          </div>
                        </div>

                        {/* Text Section */}
                        <div className={`md:w-3/5 p-6 md:p-8 flex flex-col justify-center ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                          <div className="space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                              {step.title}
                            </h3>
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

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
                        md:hover:scale-110 md:hover:border-primary/40
                        transition-all duration-300
                        group
                      "
                    >
                      <StepIcon className="w-9 h-9 md:w-11 md:h-11 text-primary md:group-hover:scale-110 transition-transform" />
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