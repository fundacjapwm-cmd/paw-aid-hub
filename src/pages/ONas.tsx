import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

// Mascots
import greyCatSitting from "@/assets/mascots/grey-cat-sitting.png";
import orangeCatLying from "@/assets/mascots/orange-cat-lying.png";
import goldenDogSitting from "@/assets/mascots/golden-dog-sitting.png";
import brownDogLying from "@/assets/mascots/brown-dog-lying.png";
import whiteCatSitting from "@/assets/mascots/white-cat-sitting.png";
import greyDogTall from "@/assets/mascots/grey-dog-tall.png";

const ONas = () => {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6B5B7A] via-[#5D5169] to-[#4A4258]" />
          
          {/* Decorative paw prints */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-16 h-16 bg-white rounded-full" />
            <div className="absolute top-40 right-20 w-12 h-12 bg-white rounded-full" />
            <div className="absolute bottom-32 left-1/4 w-8 h-8 bg-white rounded-full" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                  Pączki<br />w Maśle
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Dla tych, którzy najbardziej tego potrzebują
                </p>
                
                {/* Contact info instead of stats */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <Mail className="h-5 w-5 text-white/80" />
                  <a 
                    href="mailto:fundacjapwm@gmail.com" 
                    className="text-white hover:text-white/80 transition-colors font-medium"
                  >
                    fundacjapwm@gmail.com
                  </a>
                </div>
              </div>

              {/* Mascots Group */}
              <div className="relative h-[500px] lg:h-[600px]">
                {/* Grey dog in back */}
                <img 
                  src={greyDogTall} 
                  alt="" 
                  className="absolute left-0 bottom-0 h-[85%] object-contain drop-shadow-2xl z-10"
                />
                {/* Golden dog */}
                <img 
                  src={goldenDogSitting} 
                  alt="" 
                  className="absolute right-4 bottom-0 h-[75%] object-contain drop-shadow-2xl z-20"
                />
                {/* White cat in front */}
                <img 
                  src={whiteCatSitting} 
                  alt="" 
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[55%] object-contain drop-shadow-2xl z-30"
                />
                {/* Grey cat peeking */}
                <img 
                  src={greyCatSitting} 
                  alt="" 
                  className="absolute right-0 bottom-8 h-[50%] object-contain drop-shadow-2xl z-25"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20 md:py-28 relative">
          {/* Orange cat lying on section */}
          <div className="absolute -top-16 right-8 md:right-20 z-20">
            <img 
              src={orangeCatLying} 
              alt="" 
              className="w-32 md:w-48 drop-shadow-lg"
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
              {/* Card with dog lying on it */}
              <div className="relative bg-[#6B5B7A] rounded-3xl p-8 md:p-10 text-white overflow-visible">
                {/* Brown dog lying on top of card */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                  <img 
                    src={brownDogLying} 
                    alt="" 
                    className="w-40 md:w-56 drop-shadow-lg"
                  />
                </div>
                <div className="pt-16 md:pt-20">
                  <h3 className="text-2xl font-bold mb-4">Nasza misja</h3>
                  <p className="text-white/85 leading-relaxed">
                    Wszystko zaczęło się od jednego telefonu. Naszą misją jest nieustanna pomoc 
                    wszystkim bezbronnym zwierzętom. Pomagamy bezdomnym czworonogom odzyskać 
                    zdrowie, siły i zaufanie do ludzi.
                  </p>
                </div>
              </div>

              {/* Card with values */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-border/40">
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
        <section className="py-16 md:py-20 bg-gradient-to-br from-[#F5EDE8] to-[#FFFBF7] relative overflow-hidden">
          {/* Decorative cat */}
          <div className="absolute bottom-0 left-8 hidden lg:block">
            <img 
              src={greyCatSitting} 
              alt="" 
              className="h-48 opacity-30"
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
              <Button asChild size="lg" className="rounded-full px-8 bg-[#6B5B7A] hover:bg-[#5D5169]">
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