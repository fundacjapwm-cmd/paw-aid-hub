import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

// Illustrations
import happyPetsHero from "@/assets/illustrations/happy-pets-hero.png";
import petsCozy from "@/assets/illustrations/pets-cozy.png";
import dogHeart from "@/assets/illustrations/dog-heart.png";
import catGift from "@/assets/illustrations/cat-gift.png";
import petsWaving from "@/assets/illustrations/pets-waving.png";

// Icons
import pawIcon from "@/assets/icons/paw-icon.png";
import heartPawIcon from "@/assets/icons/heart-paw-icon.png";
import giftIcon from "@/assets/icons/gift-icon.png";
import shelterIcon from "@/assets/icons/shelter-icon.png";

const ONas = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5E6DC] to-[#FFF9F5]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
                  <img src={pawIcon} alt="" className="h-5 w-5" />
                  <span className="text-sm text-primary font-medium">Z miłości do zwierząt</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Pączki w Maśle
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Dla tych, którzy najbardziej tego potrzebują. Pomagamy zwierzętom 
                  w schroniskach znaleźć drogę do serca ludzi.
                </p>
              </div>

              {/* Illustration */}
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50" />
                <img 
                  src={happyPetsHero} 
                  alt="Szczęśliwe zwierzęta" 
                  className="relative w-full max-w-lg mx-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="relative z-20 -mt-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-border/50 p-6 md:p-8 grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">50+</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Organizacji partnerskich</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="text-3xl md:text-4xl font-bold text-secondary">1000+</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Wspieranych zwierząt</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-accent">100%</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Zaangażowania</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Content - Bento Grid Style */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Text Card - Spans 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-border/30">
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

              {/* Illustration Card */}
              <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-6 flex items-center justify-center min-h-[250px]">
                <img 
                  src={petsCozy} 
                  alt="Przytulone zwierzaki" 
                  className="w-full max-w-[200px] drop-shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Value Cards with Custom Icons */}
              <div className="bg-white rounded-3xl p-6 flex flex-col shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <img src={heartPawIcon} alt="" className="h-14 w-14" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Miłość</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Każde zwierzę zasługuje na bezwarunkową miłość i troskę
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 flex flex-col shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <img src={shelterIcon} alt="" className="h-14 w-14" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Współpraca</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Razem możemy więcej - łączymy siły z organizacjami
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 flex flex-col shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <img src={giftIcon} alt="" className="h-14 w-14" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Pomoc</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Dostarczamy potrzebne produkty prosto do schronisk
                </p>
              </div>

              {/* Illustration Card 2 */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 flex items-center justify-center min-h-[250px]">
                <img 
                  src={dogHeart} 
                  alt="Piesek z sercem" 
                  className="w-full max-w-[180px] drop-shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Mission Card - Spans 2 columns */}
              <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-20">
                  <img src={pawIcon} alt="" className="h-24 w-24" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Nasza misja
                </h2>
                <p className="text-white/90 leading-relaxed mb-4">
                  Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, 
                  który dotyka tysięcy zwierząt każdego roku. Naszym celem jest walka z tym 
                  zjawiskiem poprzez konkretne działania.
                </p>
                <p className="text-white/90 leading-relaxed">
                  Naszą misją jest nieustanna pomoc wszystkim bezbronnym zwierzętom. 
                  Pomagamy bezdomnym czworonogom odzyskać zdrowie, siły i zaufanie do ludzi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-[#F5E6DC] to-[#FFF9F5]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-border/30">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Dołącz do nas!
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Razem możemy więcej. Każda pomoc ma znaczenie - sprawdź jak możesz wesprzeć 
                    zwierzęta w potrzebie.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild size="lg" className="rounded-full px-8">
                      <Link to="/zwierzeta">
                        Zobacz zwierzęta
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                      <Link to="/kontakt">
                        Skontaktuj się
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={petsWaving} 
                    alt="Zwierzaki machające łapkami" 
                    className="w-full max-w-[280px] drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ONas;