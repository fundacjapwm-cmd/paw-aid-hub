import Navigation from "@/components/Navigation";
import { Heart, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Kontakt = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-accent py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-16 h-16 bg-white/15 rounded-full animate-bounce-gentle"></div>
            <div className="absolute top-32 right-20 w-12 h-12 bg-white/12 rounded-full animate-float delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-bounce-gentle delay-500"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Kontakt
                </h1>
                <p className="text-xl text-white/95 mb-8 leading-relaxed font-medium">
                  Chcesz nam coś przekazać? Czekamy na Twoją wiadomość! 💌
                </p>
              </div>

              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
                    <Heart className="h-20 w-20 text-accent fill-current animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-3xl p-8 shadow-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Napisz do nas
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Jesteśmy tu aby odpowiedzieć na wszystkie Twoje pytania i pomysły.
                  </p>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Imię*</Label>
                        <Input 
                          id="name" 
                          placeholder="Twoje imię" 
                          className="rounded-xl border-2 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail*</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="twoj@email.pl" 
                          className="rounded-xl border-2 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Podaj swój numer telefonu</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+48 123 456 789" 
                        className="rounded-xl border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Zacznij pisać wiadomość...</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Opisz swoją sprawę, pytanie lub pomysł..."
                        rows={6}
                        className="rounded-xl border-2 focus:border-primary resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full rounded-xl font-bold" 
                      size="lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Wyślij
                    </Button>
                  </form>
                </div>
              </div>

              {/* Contact Info & Animal Image */}
              <div className="space-y-8">
                {/* Contact Details */}
                <div className="bg-white rounded-3xl p-8 shadow-card">
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    Skontaktuj się z nami
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-light rounded-full p-3 flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">E-mail</h4>
                        <p className="text-muted-foreground">kontakt@paczkiwmasle.pl</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-secondary-light rounded-full p-3 flex-shrink-0">
                        <Phone className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Telefon</h4>
                        <p className="text-muted-foreground">+48 123 456 789</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-accent-light rounded-full p-3 flex-shrink-0">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Adres</h4>
                        <p className="text-muted-foreground">
                          ul. Serdeczna 12<br />
                          00-001 Warszawa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Happy Animal */}
                <div className="bg-white rounded-3xl p-8 shadow-card text-center">
                  <div className="bg-primary-light rounded-3xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary/20 rounded-full animate-bounce-gentle"></div>
                    <div className="absolute bottom-4 left-4 w-4 h-4 bg-accent/30 rounded-full animate-float delay-500"></div>
                    <div className="w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center shadow-soft">
                      <Heart className="h-16 w-16 text-primary fill-current animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Czekamy na Twój kontakt! 🐾
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Razem możemy pomóc jeszcze większej liczbie zwierząt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Często zadawane pytania
              </h2>
              <p className="text-lg text-muted-foreground">
                Może znajdziesz odpowiedź na swoje pytanie poniżej
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Jak mogę zostać wolontariuszem?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Napisz do nas! Zawsze szukamy osób chętnych do pomocy zwierzętom.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Czy mogę odwiedzić schronisko?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Oczywiście! Skontaktuj się z nami wcześniej, aby umówić wizytę.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Jak mogę zgłosić potrzebującego pomoc?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Zadzwoń lub napisz do nas - postaramy się pomóc jak najszybciej.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Czy wydajecie faktury?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Tak, na życzenie wystawiamy faktury za wszystkie zakupy.
                </p>
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

export default Kontakt;