import { Search, ShoppingCart, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import dogNose from "@/assets/how-it-works/dog-nose.png";
import cat from "@/assets/how-it-works/cat.jpg";
import creditCard from "@/assets/how-it-works/credit-card.png";
import dogBox from "@/assets/how-it-works/dog-box.png";

const steps = [
  {
    icon: Search,
    title: "Wybierz",
    description: "Spośród naszych kochanych czworonogów tego lub tych, których chcesz dziś wesprzeć",
    delay: 0,
    image: dogNose,
  },
  {
    icon: ShoppingCart,
    title: "Dodaj",
    description: "Dodaj potrzebne im produkty do koszyka. Wielkość i ilość zamówienia zależy tylko od Ciebie, każda pomoc się liczy!",
    delay: 400,
    image: cat,
  },
  {
    icon: CreditCard,
    title: "Zapłać",
    description: "Aby proces był jak najłatwiejszy, zdecydowaliśmy się na Przelewy24. Możesz płacić szybko i wygodnie",
    delay: 400,
    image: creditCard,
  },
  {
    icon: Package,
    title: "My dostarczamy",
    description: "Wysyłkę bierzemy na siebie! Dopilnujemy, aby Twoje zamówienie dotarło tam gdzie trzeba",
    delay: 800,
    image: dogBox,
  },
];

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="relative py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        
        {/* Nagłówek */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Jak to działa?
          </h2>
        </div>

        {/* Grid z 4 kartami */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                relative overflow-hidden rounded-[200px] shadow-2xl
                transition-all duration-700
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
              `}
              style={{
                transitionDelay: isVisible ? `${step.delay}ms` : '0ms',
              }}
            >
              {/* Tło ze zdjęciem */}
              <div className="absolute inset-0">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
                {/* Ciemny overlay dla czytelności */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
              </div>

              {/* Treść */}
              <div className="relative z-10 flex flex-col items-center text-center px-8 py-16 min-h-[400px] justify-end">
                {/* Ikona w kółku */}
                <div className="mb-6 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <step.icon className="w-10 h-10 text-primary" strokeWidth={2} />
                </div>

                {/* Tytuł */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>

                {/* Opis */}
                <p className="text-sm text-white/90 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-20 flex flex-col sm:flex-row justify-center gap-6 items-center">
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground mb-2">Chcesz pomóc?</p>
            <Link to="/zwierzeta">
              <Button size="lg" className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-lg text-lg w-full sm:w-auto">
                Wybierz zwierzaka
              </Button>
            </Link>
          </div>
          
          <div className="hidden sm:block w-px h-12 bg-border"></div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-2">Jesteś fundacją?</p>
            <a href="/#dolacz">
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-2 w-full sm:w-auto">
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
