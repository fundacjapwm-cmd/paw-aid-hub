import { Heart, Users, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                O nas
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Poznaj ludzi z wielkimi sercami, którzy każdego dnia pomagają zwierzętom w potrzebie. 💝
              </p>
            </div>
          </div>
        </section>

        {/* Foundation Logo Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl p-12 shadow-card max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <Logo className="h-16 w-auto" />
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
          <div className="flex items-center justify-center mb-4">
            <Logo className="h-10 w-auto" />
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