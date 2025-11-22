import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import dogNose from "@/assets/how-it-works/dog-nose.png";
import dogPaw from "@/assets/how-it-works/dog-paw.png";
import kittensBasket from "@/assets/how-it-works/kittens-basket.jpg";
import catDog from "@/assets/how-it-works/cat-dog.png";
import creditCard from "@/assets/how-it-works/credit-card.png";
import { MousePointerClick, ShoppingBag, CreditCard, Truck } from "lucide-react";

const JakToDziala = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section with Asymmetric Layout */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Jak to działa?
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Pomoc zwierzętom nigdy nie była prostsza. <br/>
                  <span className="text-primary font-semibold">4 kroki</span> dzielą Cię od czynienia dobra.
                </p>
              </div>
              
              {/* Hero Image Collage */}
              <div className="relative h-[400px] md:h-[500px] animate-scale-in">
                <div className="absolute top-0 right-0 w-2/3 h-2/3 rounded-[3rem] overflow-hidden shadow-bubbly border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={catDog} 
                    alt="Kot i pies razem" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-2/3 h-2/3 rounded-[3rem] overflow-hidden shadow-bubbly border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={kittensBasket} 
                    alt="Kocięta w koszyku" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
        </section>

        {/* Bento Grid Steps Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              
              {/* Step 1 - Large Card */}
              <div className="md:col-span-2 lg:col-span-2 group">
                <div className="relative h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-card hover:shadow-bubbly transition-all duration-500">
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-20">
                    <img src={dogPaw} alt="" className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-primary text-white rounded-2xl p-4 shadow-soft">
                        <MousePointerClick className="h-8 w-8" />
                      </div>
                      <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-soft">
                        1
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Wybierz
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Spośród naszych kochanych czworonogów wybierz tego, któremu chcesz pomóc. 
                        Każdy ma swoją unikalną historię i listę potrzeb.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 - Tall Card with Image */}
              <div className="lg:row-span-2 group">
                <div className="relative h-full bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-[3rem] overflow-hidden shadow-card hover:shadow-bubbly transition-all duration-500">
                  <div className="absolute inset-0">
                    <img src={kittensBasket} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>
                  
                  <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary text-white rounded-2xl p-4 shadow-soft">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                      <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-soft">
                        2
                      </div>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6">
                      <h3 className="text-3xl font-bold text-foreground mb-3">
                        Dodaj
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        Dodaj potrzebne produkty do koszyka. Wielkość i ilość zamówienia zależy tylko od Ciebie.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 - Medium Card with Credit Card */}
              <div className="group">
                <div className="relative h-full min-h-[350px] bg-gradient-to-br from-accent/20 to-accent/5 rounded-[3rem] p-8 overflow-hidden shadow-card hover:shadow-bubbly transition-all duration-500">
                  <div className="absolute -right-10 bottom-0 w-64 h-64 opacity-40">
                    <img src={creditCard} alt="" className="w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700" />
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-accent text-white rounded-2xl p-4 shadow-soft">
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <div className="bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-soft">
                        3
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-bold text-foreground mb-3">
                        Zapłać
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        Abyś mógł zdecydować maksymalnie wygodnie, zdecydowaliśmy się na Przelewy24.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 - Wide Card */}
              <div className="md:col-span-2 lg:col-span-2 group">
                <div className="relative h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-card hover:shadow-bubbly transition-all duration-500">
                  <div className="absolute -left-20 -top-20 w-80 h-80 opacity-20 transform rotate-12">
                    <img src={dogNose} alt="" className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-primary text-white rounded-2xl p-4 shadow-soft">
                        <Truck className="h-8 w-8" />
                      </div>
                      <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-soft">
                        4
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        My dostarczamy
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Wysyłkę bierzemy na siebie! Dopilnujemy, aby Twoje zamówienie dotarło tam gdzie trzeba.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Existing How It Works Component */}
        <HowItWorks />

        {/* Benefits with Visual Elements */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Dlaczego warto?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Proste. Bezpieczne. Skuteczne.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card rounded-[2.5rem] p-8 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2 border border-border/50">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  100% trafia do celu
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Twoja pomoc trafia bezpośrednio do zwierzaka - żadnych pośredników
                </p>
              </div>

              <div className="bg-card rounded-[2.5rem] p-8 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2 border border-border/50">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Pełna transparentność
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Widzisz dokładnie na co idą Twoje pieniądze i komu pomagasz
                </p>
              </div>

              <div className="bg-card rounded-[2.5rem] p-8 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2 border border-border/50">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Wygoda i prostota
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Kilka kliknięć i gotowe - my zajmiemy się resztą
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Często zadawane pytania
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-bubbly transition-all duration-300">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Czy moja pomoc na pewno dotrze do zwierzaka?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tak! Współpracujemy bezpośrednio z organizacjami i schroniskami. Każdy zakup trafia dokładnie tam, gdzie jest potrzebny.
                </p>
              </div>

              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-bubbly transition-all duration-300">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Czy mogę wybrać konkretne produkty zamiast całej listy?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Oczywiście! Możesz wybrać pojedyncze produkty z listy życzeń lub kupić wszystko jednym kliknięciem.
                </p>
              </div>

              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50 hover:shadow-bubbly transition-all duration-300">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Jakie formy płatności są dostępne?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Akceptujemy wszystkie popularne metody płatności przez Przelewy24 - karty, BLIK, przelewy bankowe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90"></div>
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Gotowy żeby pomóc?
              </h2>
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed">
                Teraz gdy wiesz jak to działa, czas na pierwszy zakup!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  variant="light" 
                  size="hero"
                  className="shadow-bubbly hover:scale-105 transition-transform"
                  onClick={() => window.location.href = '/zwierzeta'}
                >
                  Wybierz zwierzaka
                </Button>
                <Button 
                  variant="outline" 
                  size="hero" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary shadow-bubbly hover:scale-105 transition-all"
                  onClick={() => window.location.href = '/organizacje'}
                >
                  Zobacz organizacje
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default JakToDziala;
