import { Heart, Users, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import Footer from "@/components/Footer";
import kittenTrain from "@/assets/about/kitten-train.png";
import kittensBasket from "@/assets/about/kittens-basket.jpg";
import womanDog from "@/assets/about/woman-dog.png";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section with Large Logo */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-12 flex justify-center">
                <div className="bg-white rounded-3xl p-12 md:p-16 shadow-xl">
                  <Logo className="h-32 md:h-48 w-auto" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Pączki w Maśle
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Z miłości do zwierząt, dla tych którzy najbardziej tego potrzebują
              </p>
            </div>
          </div>
        </section>

        {/* O Nas Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
              O nas
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="order-2 md:order-1">
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground leading-relaxed text-lg mb-6">
                    Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji na terenie całej Polski, prowadząc akcje ratujące bezdomne koty i psy, organizując zbiórki karmy oraz wspierając lokalne organizacje.
                  </p>
                  <p className="text-foreground leading-relaxed text-lg mb-6">
                    Nasza siła to wieloletnie doświadczenie, pasja do zwierząt oraz ludzie, którzy z sercem dbają o zwierzęta w potrzebie. Wierzymy, że każde zwierzę zasługuje na ciepły dom, pełną miskę i ludzką troskę.
                  </p>
                  <p className="text-foreground leading-relaxed text-lg font-semibold text-primary">
                    Dołącz do nas! Razem możemy więcej!
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src={kittenTrain} 
                  alt="Ludzie głaszczący kociaka" 
                  className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src={kittensBasket} 
                  alt="Kocięta w koszyku" 
                  className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
              <div>
                <img 
                  src={womanDog} 
                  alt="Kobieta przytulająca psa" 
                  className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nasza Misja Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
                Nasza misja
              </h2>
              
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-12">
                <p className="text-foreground leading-relaxed text-lg mb-6">
                  Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, który dotyka tysięcy zwierząt każdego roku. Naszym celem jest walka z tym zjawiskiem poprzez konkretne działania ratujące życie i zdrowie bezdomnych czworonogów.
                </p>
                
                <p className="text-foreground leading-relaxed text-lg mb-6">
                  Nie możemy pozostać obojętni - dlatego łączymy siły z całą siecią organizacji działających na rzecz zwierząt. Naszym priorytetem jest każde zwierzę w potrzebie: od ratowania w sytuacjach zagrożenia życia, przez zapewnienie opieki weterynaryjnej, po znalezienie kochających domów.
                </p>
                
                <p className="text-foreground leading-relaxed text-lg">
                  Naszą misją jest nieustanna pomoc wszystkim bezbronnym zwierzętom. Pomagamy bezdomnym czworonogom odzyskać zdrowie, siły i zaufanie do ludzi. Każde zwierzę zasługuje na godne życie, pełne miłości i opieki - dlatego działamy, by ta wizja się spełniła.
                </p>
              </div>

              {/* Values Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white fill-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Miłość</h3>
                  <p className="text-muted-foreground">
                    Każde zwierzę zasługuje na bezwarunkową miłość i troskę
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-secondary rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Współpraca</h3>
                  <p className="text-muted-foreground">
                    Razem możemy więcej - łączymy siły z organizacjami i wolontariuszami
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ONas;