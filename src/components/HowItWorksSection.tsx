import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Wybierz",
    description: "Znajdź zwierzaka, który skradnie Twoje serce. Każdy z nich ma swoją unikalną historię.",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop", // Pies
  },
  {
    id: 2,
    title: "Napełnij",
    description: "Wybierz produkty z listy życzeń. Nie musisz kupować wszystkiego - każda puszka się liczy!",
    image: "https://images.unsplash.com/photo-1585255318859-f5c15f4cffe9?q=80&w=1974&auto=format&fit=crop", // Zakupy
  },
  {
    id: 3,
    title: "Zapłać",
    description: "Bezpieczna i szybka płatność online. 100% środków trafia na zakup produktów.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop", // Płatność
  },
  {
    id: 4,
    title: "Radość",
    description: "My dostarczamy dary prosto do schroniska, a Ty dostajesz powiadomienie o dostawie!",
    image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=2070&auto=format&fit=crop", // Paczka
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Nagłówek Sekcji */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            Jak to działa? 🍩
          </h2>
          <p className="text-lg text-muted-foreground">
            Pomoc jest prostsza niż myślisz. Zobacz, jaką drogę pokonuje Twój dar.
          </p>
        </div>

        {/* THE STAGGERED GRID (Kluczowy element wizualny) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "relative group rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer transition-all duration-500 hover:-translate-y-2 border-4 border-white bg-gray-100",
                // PROPORCJE: Wysokie i wąskie (Stories)
                "aspect-[9/16]", 
                // PRZESUNIĘCIE: Co drugi element obniżony o 96px (lg:mt-24)
                index % 2 === 1 ? "lg:mt-24" : "lg:mt-0" 
              )}
            >
              {/* Zdjęcie (Full Bleed) */}
              <img 
                src={step.image} 
                alt={step.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay (Gradient dla czytelności tekstu) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />
              
              {/* Treść na dole */}
              <div className="absolute bottom-0 left-0 p-8 text-left w-full">
                {/* Wielki numer w tle */}
                <span className="text-8xl font-black text-white/10 absolute -top-12 right-4 select-none pointer-events-none">
                  {step.id}
                </span>
                
                <h3 className="text-3xl font-bold text-white mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-white/90 text-sm font-medium leading-relaxed relative z-10 pr-2">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dual CTA Buttons (Dla Darczyńcy i Organizacji) */}
        <div className="mt-32 flex flex-col sm:flex-row justify-center gap-6 items-center">
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground mb-2">Chcesz pomóc?</p>
            <Link to="/zwierzeta">
              <Button size="lg" className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-bubbly text-lg w-full sm:w-auto border-4 border-white hover:-translate-y-1 transition-transform">
                Wybierz zwierzaka
              </Button>
            </Link>
          </div>
          
          <div className="hidden sm:block w-px h-12 bg-border"></div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-2">Jesteś fundacją?</p>
            <a href="/#dolacz">
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-2 w-full sm:w-auto hover:-translate-y-1 transition-transform">
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
