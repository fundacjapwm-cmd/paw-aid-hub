import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-hero py-20 px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce-gentle delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce-gentle delay-500"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
              <Heart className="h-8 w-8 text-white fill-white animate-pulse" />
              <span className="text-white/90 font-medium">Fundacja</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Odmień życie<br />
              <span className="text-white/90">bezdomniaczka</span><br />
              <span className="bg-white text-primary px-4 py-2 rounded-2xl inline-block transform rotate-1">
                kup mu smaczka!
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-lg">
              Karma wraca 🙂 Wspieraj zwierzęta i organizacje kupując im potrzebne produkty. 
              Każdy zakup to realna pomoc dla naszych czworonożnych przyjaciół.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="light" size="hero">
                Zwierzaki
                <Heart className="h-5 w-5 fill-current" />
              </Button>
              <Button variant="outline" size="hero" className="border-white text-white hover:bg-white hover:text-primary">
                Jak to działa?
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

        {/* Animal Photos Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-primary rounded-2xl flex items-center justify-center">
                  <Heart className="h-16 w-16 text-white fill-white" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-secondary rounded-2xl flex items-center justify-center">
                  <Heart className="h-12 w-12 text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-accent rounded-2xl flex items-center justify-center">
                  <Heart className="h-14 w-14 text-white fill-white" />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-1 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-primary rounded-2xl flex items-center justify-center">
                  <Heart className="h-10 w-10 text-white fill-white" />
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