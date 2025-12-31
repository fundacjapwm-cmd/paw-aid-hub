import { Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import LeadGenSection from "@/components/LeadGenSection";
import kittenTrain from "@/assets/about/kitten-train.png";
import kittensBasket from "@/assets/about/kittens-basket.jpg";
import womanDog from "@/assets/about/woman-dog.png";
import HeartPawIcon from "@/components/icons/HeartPawIcon";
import HandshakePawIcon from "@/components/icons/HandshakePawIcon";
import ShieldPawIcon from "@/components/icons/ShieldPawIcon";
import DecorativePaws from "@/components/icons/DecorativePaws";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section - Full Width Image with Overlay */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={kittenTrain} 
              alt="Ludzie głaszczący kociaka" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-white/90 font-medium">Z miłości do zwierząt</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Pączki w Maśle
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Dla tych, którzy najbardziej tego potrzebują
            </p>
          </div>
        </section>

        {/* About Content - Bento Grid Style with decorative background */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Decorative paws background */}
          <DecorativePaws className="absolute inset-0 w-full h-full text-foreground pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Text Card - Spans 2 columns */}
              <div className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Kim jesteśmy?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, 
                  gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji 
                  na terenie całej Polski.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nasza siła to wieloletnie doświadczenie, pasja do zwierząt oraz ludzie, 
                  którzy z sercem dbają o zwierzęta w potrzebie.
                </p>
              </div>

              {/* Image Card */}
              <div className="relative rounded-3xl overflow-hidden min-h-[250px] group">
                <img 
                  src={kittensBasket} 
                  alt="Kocięta w koszyku" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium text-sm">Każde zwierzę zasługuje na dom</p>
                </div>
              </div>

              {/* Value Cards with custom icons */}
              <div className="bg-primary/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm">
                <div className="bg-primary rounded-2xl p-3 w-fit mb-4">
                  <HeartPawIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Miłość</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Każde zwierzę zasługuje na bezwarunkową miłość i troskę
                </p>
              </div>

              <div className="bg-secondary/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm">
                <div className="bg-secondary rounded-2xl p-3 w-fit mb-4">
                  <HandshakePawIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Współpraca</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Razem możemy więcej - łączymy siły z organizacjami
                </p>
              </div>

              <div className="bg-accent/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm">
                <div className="bg-accent rounded-2xl p-3 w-fit mb-4">
                  <ShieldPawIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Opieka</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Zapewniamy profesjonalną opiekę i najwyższe standardy
                </p>
              </div>

              {/* Image Card 2 */}
              <div className="relative rounded-3xl overflow-hidden min-h-[250px] group">
                <img 
                  src={womanDog} 
                  alt="Kobieta przytulająca psa" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium text-sm">Miłość zmienia życie</p>
                </div>
              </div>

              {/* Mission Card - Spans 2 columns */}
              <div className="lg:col-span-2 bg-foreground rounded-3xl p-8 md:p-10 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Nasza misja
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, 
                  który dotyka tysięcy zwierząt każdego roku. Naszym celem jest walka z tym 
                  zjawiskiem poprzez konkretne działania.
                </p>
                <p className="text-white/80 leading-relaxed">
                  Naszą misją jest nieustanna pomoc wszystkim bezbronnym zwierzętom. 
                  Pomagamy bezdomnym czworonogom odzyskać zdrowie, siły i zaufanie do ludzi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organization Registration Form */}
        <LeadGenSection />
      </main>

      <Footer />
    </div>
  );
};

export default ONas;
