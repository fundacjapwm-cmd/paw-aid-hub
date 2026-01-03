import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroCatBlue from "@/assets/hero/cat-pastel.jpg";
import heroDogWhite from "@/assets/hero/dog-white.jpg";
import heroCatGreen from "@/assets/hero/cat-green.jpg";
import heroDogPink from "@/assets/hero/dog-pink.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative bg-hero pt-8 pb-12 md:py-12 overflow-hidden">
      <div className="md:container md:mx-auto md:max-w-6xl md:px-8 relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Odmień życie<br />
              <span className="text-white/90">bezdomniaczka</span><br />
              <span className="bg-white text-primary-dark px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-3xl inline-block transform rotate-1 shadow-bubbly font-black text-2xl sm:text-3xl lg:text-4xl mt-2">
                kup mu smaczka!
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/95 mb-4 md:mb-8 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
              Karma wraca! Wspieraj zwierzęta i organizacje kupując im potrzebne produkty. 
              Każdy zakup to realna pomoc dla naszych czworonożnych przyjaciół.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-accent text-white md:hover:bg-accent/90 md:hover:shadow-[0_0_30px_rgba(233,165,46,0.4)] shadow-card md:hover:-translate-y-1 transition-all duration-300 rounded-3xl px-8 h-14 text-lg font-bold md:hover:scale-105"
                onClick={() => navigate('/zwierzeta')}
              >
                Wybierz zwierzaka
              </Button>
              
              <a href="#jak-to-dziala" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="w-full bg-secondary text-secondary-foreground md:hover:bg-secondary/90 md:hover:shadow-[0_0_30px_rgba(159,185,115,0.3)] shadow-card md:hover:-translate-y-1 transition-all duration-300 rounded-3xl px-8 h-14 text-lg font-bold md:hover:scale-105"
                >
                  Jak to działa?
                </Button>
              </a>
            </div>
          </div>

        {/* Animal Photos Grid */}
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-2">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroCatBlue} alt="" width={244} height={244} className="w-full h-full object-cover object-center" loading="lazy" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-1">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroDogWhite} alt="" width={244} height={244} className="w-full h-full object-cover object-center" loading="lazy" />
                </div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-2">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroDogPink} alt="" width={244} height={244} className="w-full h-full object-cover object-[40%_center]" loading="lazy" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-1">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroCatGreen} alt="" width={244} height={244} className="w-full h-full object-cover object-center" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;