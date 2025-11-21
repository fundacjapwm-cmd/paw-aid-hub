import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import heroCat1 from "@/assets/hero-cat1.png";
import heroCatDog from "@/assets/hero-catdog.png";
import heroDog1 from "@/assets/hero-dog1.png";
import heroDog2 from "@/assets/hero-dog2.png";

const HeroSection = () => {
  return (
    <section className="relative bg-hero py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4 sm:mb-6">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white fill-white animate-pulse" />
              <span className="text-white/90 text-sm sm:text-base font-medium">Fundacja</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Odmień życie<br />
              <span className="text-white/90">bezdomniaczka</span><br />
              <span className="bg-white text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-3xl inline-block transform rotate-1 shadow-bubbly font-black text-2xl sm:text-3xl lg:text-4xl mt-2">
                kup mu smaczka!
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-6 sm:mb-8 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
              Karma wraca! Wspieraj zwierzęta i organizacje kupując im potrzebne produkty. 
              Każdy zakup to realna pomoc dla naszych czworonożnych przyjaciół.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button variant="light" size="hero" className="w-full sm:w-auto hover:scale-105 transition-transform">
                Zwierzaki
              </Button>
              <Button variant="outline" size="hero" className="border-white text-foreground bg-white/90 w-full sm:w-auto hover:scale-105 transition-transform">
                Jak to działa?
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

        {/* Animal Photos Grid */}
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroCat1} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroCatDog} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroDog1} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={heroDog2} alt="" className="w-full h-full object-cover" />
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