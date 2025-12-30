import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

// Mascots
import greyCatSitting from "@/assets/mascots/grey-cat-sitting.png";
import orangeCatLying from "@/assets/mascots/orange-cat-lying.png";
import brownDogLying from "@/assets/mascots/brown-dog-lying.png";
import groupMascotsHero from "@/assets/mascots/group-mascots-hero.png";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-16 h-16 bg-white rounded-full blur-xl" />
            <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white rounded-full blur-lg" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight tracking-tight">
                  Pączki<br />w Maśle
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Dla tych, którzy najbardziej tego potrzebują
                </p>
                
                {/* Contact info */}
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <Mail className="h-5 w-5 text-primary-foreground/90" />
                  <a 
                    href="mailto:fundacjapwm@gmail.com" 
                    className="text-primary-foreground hover:text-primary-foreground/80 transition-colors font-medium"
                  >
                    fundacjapwm@gmail.com
                  </a>
                </div>
              </div>

              {/* Group mascots illustration */}
              <div className="relative flex items-end justify-center h-[350px] lg:h-[450px]">
                <img 
                  src={groupMascotsHero} 
                  alt="Grupa przyjaznych psów i kotów" 
                  className="max-h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20 md:py-28 relative">
          {/* Orange cat lying on section edge */}
          <div className="absolute -top-8 md:-top-12 right-8 md:right-16 lg:right-24 z-20 pointer-events-none">
            <img 
              src={orangeCatLying} 
              alt="" 
              className="w-28 md:w-40 lg:w-48"
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-8">
            {/* Main intro */}
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                Kim jesteśmy?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, 
                gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji 
                na terenie całej Polski.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Mission card with dog lying on top */}
              <div className="relative bg-primary rounded-3xl p-8 md:p-10 text-primary-foreground overflow-visible">
                {/* Brown dog lying on top edge of card */}
                <div className="absolute -top-10 md:-top-14 left-8 md:left-12 z-10 pointer-events-none">
                  <img 
                    src={brownDogLying} 
                    alt="" 
                    className="w-32 md:w-44"
                  />
                </div>
                <div className="pt-12 md:pt-16">
                  <h3 className="text-2xl font-bold mb-4">Nasza misja</h3>
                  <p className="text-primary-foreground/85 leading-relaxed">
                    Wszystko zaczęło się od jednego telefonu. Naszą misją jest nieustanna pomoc 
                    wszystkim bezbronnym zwierzętom. Pomagamy bezdomnym czworonogom odzyskać 
                    zdrowie, siły i zaufanie do ludzi.
                  </p>
                </div>
              </div>

              {/* Values card */}
              <div className="bg-card rounded-3xl p-8 md:p-10 shadow-sm border border-border/40">
                <h3 className="text-2xl font-bold text-foreground mb-6">Nasze wartości</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💛</span>
                    <div>
                      <span className="font-semibold text-foreground">Miłość</span>
                      <p className="text-sm text-muted-foreground">Każde zwierzę zasługuje na bezwarunkową troskę</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <span className="font-semibold text-foreground">Współpraca</span>
                      <p className="text-sm text-muted-foreground">Razem możemy więcej - łączymy siły z organizacjami</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <span className="font-semibold text-foreground">Pomoc</span>
                      <p className="text-sm text-muted-foreground">Dostarczamy potrzebne produkty prosto do schronisk</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-muted relative overflow-hidden">
          {/* Grey cat sitting at the bottom left - integral to design */}
          <div className="absolute bottom-0 left-4 md:left-12 lg:left-20 pointer-events-none">
            <img 
              src={greyCatSitting} 
              alt="" 
              className="h-32 md:h-44 lg:h-52"
            />
          </div>

          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dołącz do nas!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Razem możemy więcej. Każda pomoc ma znaczenie - sprawdź jak możesz wesprzeć 
              zwierzęta w potrzebie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ONas;