import { Button } from "@/components/ui/button";
import { Heart, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import ctaHelpImage from "@/assets/cta-help.png";
import ctaFoundationImage from "@/assets/cta-foundation.png";

const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chcesz pomóc? */}
          <div className="relative overflow-hidden rounded-3xl min-h-[500px] flex items-end">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ctaHelpImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="relative z-10 p-8 md:p-12 w-full">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white">Wsparcie</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Chcesz pomóc?
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-md">
                Wybierz zwierzaka i spełnij jego marzenia. Każda pomoc się liczy.
              </p>
              
              <Link to="/zwierzeta">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Wybierz zwierzaka
                </Button>
              </Link>
            </div>
          </div>

          {/* Jesteś fundacją? */}
          <div className="relative overflow-hidden rounded-3xl min-h-[500px] flex items-end">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ctaFoundationImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="relative z-10 p-8 md:p-12 w-full">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white">Dla organizacji</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Jesteś fundacją?
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-md">
                Dołącz do nas i pomóż swoim podopiecznym znaleźć wsparcie.
              </p>
              
              <a href="#dolacz">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Zgłoś organizację
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
