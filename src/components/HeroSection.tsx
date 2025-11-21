import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import catImage1 from "@/assets/cat-1.jpg";
import catImage2 from "@/assets/cat-2.jpg";
import dogImage1 from "@/assets/dog-1.jpg";
import dogImage2 from "@/assets/dog-2.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-hero py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
      {/* Background decorative elements - animal images */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full animate-bounce-gentle hidden sm:block overflow-hidden">
          <img src={dogImage1} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-32 right-20 w-16 h-16 rounded-full animate-bounce-gentle delay-1000 hidden md:block overflow-hidden">
          <img src={catImage1} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full animate-bounce-gentle delay-500 hidden sm:block overflow-hidden">
          <img src={dogImage2} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full animate-bounce-gentle delay-700 overflow-hidden">
          <img src={catImage2} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-10 right-10 w-6 h-6 rounded-full animate-bounce-gentle delay-200 hidden sm:block overflow-hidden">
          <img src={dogImage1} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-20 left-1/3 w-4 h-4 rounded-full animate-bounce-gentle delay-1200 hidden md:block overflow-hidden">
          <img src={catImage1} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

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
              <Button variant="light" size="hero" className="w-full sm:w-auto">
                Zwierzaki
              </Button>
              <Button variant="outline" size="hero" className="border-white text-foreground bg-white/90 hover:bg-white hover:text-primary w-full sm:w-auto">
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
                  <img src={dogImage1} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={catImage1} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={catImage2} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src={dogImage2} alt="" className="w-full h-full object-cover" />
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