import Navigation from "@/components/Navigation";
import { Search, ShoppingCart, CreditCard, Truck, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const JakToDziala = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Jak to działa?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dowiedz się jak możesz pomóc zwierzętom w zaledwie kilku prostych krokach. 🧠
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                4 proste kroki do pomocy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                W kilka chwil możesz sprawić radość zwierzakowi i wspomóc organizację. Zobacz jak to proste!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 - Wybierz */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-primary rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-bubbly group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Wybierz</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Spośród naszych wychowanców wybierz tego, któremu chcesz pomóc. Każdy z nich ma swoją historię i listę potrzeb.
                </p>
              </div>

              {/* Step 2 - Dodaj */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-secondary rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-bubbly group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Dodaj</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dodaj potrzebne produkty do koszyka. Możesz wybrać konkretne rzeczy lub kupić całą listę życzeń jednym kliknięciem.
                </p>
              </div>

              {/* Step 3 - Zapłać */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-accent rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-bubbly group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Zapłać</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Aby proces był jak najbardziej bezpieczny, składamy się na Przelewy24. Możesz płacić szybko i wygodnie.
                </p>
              </div>

              {/* Step 4 - My dostarczamy */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-primary rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-bubbly group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">My dostarczamy!</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Wysyłamy bierzemy na siebie! Dostaniesz aby Twoje zamówienie dotarło tam gdzie trzeba. 😊
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Dlaczego warto?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nasze rozwiązanie jest proste, bezpieczne i skuteczne
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-primary-light rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary fill-current" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">100% trafia do celu</h3>
                <p className="text-muted-foreground">
                  Twoja pomoc trafia bezpośrednio do zwierzaka - żadnych pośredników
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-secondary-light rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Pełna transparentność</h3>
                <p className="text-muted-foreground">
                  Widzisz dokładnie na co idą Twoje pieniądze i komu pomagasz
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300">
                <div className="bg-accent-light rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Wygoda i prostota</h3>
                <p className="text-muted-foreground">
                  Kilka kliknięć i gotowe - my zajmiemy się resztą
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Często zadawane pytania
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Czy moja pomoc na pewno dotrze do zwierzaka?
                </h3>
                <p className="text-muted-foreground">
                  Tak! Współpracujemy bezpośrednio z organizacjami i schroniskami. Każdy zakup trafia dokładnie tam, gdzie jest potrzebny.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Czy mogę wybrać konkretne produkty zamiast całej listy?
                </h3>
                <p className="text-muted-foreground">
                  Oczywiście! Możesz wybrać pojedyncze produkty z listy życzeń lub kupić wszystko jednym kliknięciem.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Jakie formy płatności są dostępne?
                </h3>
                <p className="text-muted-foreground">
                  Akceptujemy wszystkie popularne metody płatności przez Przelewy24 - karty, BLIK, przelewy bankowe.
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
                Gotowy żeby pomóc? 🐾
              </h2>
              <p className="text-xl text-white/95 mb-8">
                Teraz gdy wiesz jak to działa, czas na pierwszy zakup! Wybierz zwierzaka i spraw mu radość.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="light" size="hero">
                  Wybierz zwierzaka
                  <Heart className="h-6 w-6 fill-current" />
                </Button>
                <Button variant="outline" size="hero" className="border-white text-white hover:bg-white hover:text-primary">
                  Zobacz organizacje
                  <Search className="h-6 w-6" />
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

export default JakToDziala;