import Navigation from "@/components/Navigation";
import { Heart, Users, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-secondary py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-16 h-16 bg-white/15 rounded-full animate-float"></div>
            <div className="absolute top-32 right-20 w-12 h-12 bg-white/12 rounded-full animate-bounce-gentle delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-float delay-500"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                  <Heart className="h-8 w-8 text-white fill-white animate-pulse" />
                  <span className="text-white/90 font-medium">Fundacja</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  O nas
                </h1>
                <p className="text-lg text-white/95 leading-relaxed font-medium">
                  Poznaj ludzi z wielkimi sercami. 💝
                </p>
              </div>

              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-primary rounded-2xl flex items-center justify-center">
                    <Heart className="h-20 w-20 text-white fill-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Foundation Logo Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl p-12 shadow-card max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="bg-primary rounded-full p-4">
                  <Heart className="h-12 w-12 text-white fill-white" />
                </div>
                <div className="bg-accent rounded-full p-4">
                  <Heart className="h-10 w-10 text-white fill-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">PĄCZKI W MAŚLE</h2>
              <p className="text-lg font-semibold text-accent">FUNDACJA</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Sierść, miłość i trochę zamierzania
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-3xl p-8 shadow-card mb-8">
                <p className="text-foreground leading-relaxed mb-6">
                  Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, gdzie jest ono najbardziej potrzebne. Nasza działalność. Współpracujemy z gronem prowadząc akcje ratujące bezdomnych kotów, organizujemy zbiórki karmy i wspieramy organizacje na całą Polskę. Nasza siła to wieloletnie dzieli zwierzęta oraz ludzie, którzy dbają o nie.
                </p>
                
                <p className="text-foreground leading-relaxed mb-6">
                  Wiczymy, że każde zwierzę zasługuje na dobry bok, pełną miskę i ludzkę troskę. Dzielmy się tym! Razem możemy więcej!
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Nasza misja</h3>
                <p className="text-foreground leading-relaxed mb-6">
                  Zaczynaj się od jednego telefonu. Berdomnistwo rozwija się czasami pod śmiertelnym roku, które nad pod ścianą. 
                  Nasz cel: ten przeciw zwierzęc!
                </p>
                
                <p className="text-foreground leading-relaxed mb-6">
                  Nie można pozostrzyć - zgodny grupa całej organizacji tworzenią całość świerzen. Na całe: na każda zostrzenie zadłużę na świecie; na tylko tak przemowanie. Na całe: na przemowie tak nie wszrócone na każda zeruty się chwala. Na życia: w których kreć wzroście czy się w każć i nadal. -Już jestań steprymały!
                </p>
                
                <p className="text-foreground leading-relaxed">
                  Naszą misją jest niezmienne to to bezludowanie! Na wszystkimi swymi pozzanymi zwierzce. Pomóż bezliczni. towarzysz rzemy dotkanie, ciekławanie są dla rzeczy poziom życie była otwarza - wiedy, gdy fałsz się oddaną...
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nasze wartości
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white fill-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Miłość</h3>
                <p className="text-muted-foreground">
                  Każde zwierzę zasługuje na bezwarunkową miłość i troskę
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-secondary rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Współpraca</h3>
                <p className="text-muted-foreground">
                  Razem możemy więcej - łączymy siły z organizacjami i wolontariuszami
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-accent rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Opieka</h3>
                <p className="text-muted-foreground">
                  Zapewniamy profesjonalną opiekę i najwyższe standardy dbania o zwierzęta
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Dołącz do nas!
              </h2>
              <p className="text-xl text-white/95 mb-8">
                Każda pomoc się liczy. Wspieraj nasze działania i pomóż nam ratować więcej zwierząt! 🐾
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="light" size="hero">
                  Wspieraj zwierzęta
                  <Heart className="h-6 w-6 fill-current" />
                </Button>
                <Button variant="outline" size="hero" className="border-white text-white hover:bg-white hover:text-primary">
                  Skontaktuj się
                  <Sparkles className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground/5 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <span className="text-lg font-bold text-primary">Pączki w Maśle</span>
          </div>
          <p className="text-muted-foreground">
            &copy; 2024 Fundacja Pączki w Maśle. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ONas;