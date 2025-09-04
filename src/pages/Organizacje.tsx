import Navigation from "@/components/Navigation";
import AnimalFilters from "@/components/AnimalFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Users, ShoppingBag, Phone, Mail } from "lucide-react";

const organizationData = [
  {
    id: 1,
    name: "Nazwa organizacji testowej",
    description: "Słup słup krótki opis",
    location: "Warszawa",
    phone: "123-456-789",
    email: "kontakt@org1.pl",
    animalsCount: 24,
    image: "🍩", // Donut icon matching reference
    totalWishlistValue: "12,450 zł",
    urgentNeeds: ["Karma sucha", "Legowiska", "Zabawki"],
    backgroundColor: "bg-gradient-to-br from-pink-400 to-pink-600"
  },
  {
    id: 2,
    name: "Stowarzyszenie",
    description: "Stowarzyszenie Futrzany Los z sercem opiekuje się schroniskiem w Żywcu, dając bezdomnym zwierzakom drugą szansę i nadzieję na nowy dom.",
    location: "Żywiec", 
    phone: "987-654-321",
    email: "kontakt@futrzanylos.pl",
    animalsCount: 18,
    image: "🐾", // Paw icon
    totalWishlistValue: "8,320 zł",
    urgentNeeds: ["Karma mokra", "Koce", "Leki"],
    backgroundColor: "bg-gradient-to-br from-gray-700 to-gray-900"
  }
];

const Organizacje = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-secondary py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-16 h-16 bg-white/15 rounded-full animate-bounce-gentle"></div>
            <div className="absolute top-32 right-20 w-12 h-12 bg-white/12 rounded-full animate-float delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-bounce-gentle delay-500"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Organizacje
                </h1>
                <p className="text-xl text-white/95 mb-8 leading-relaxed font-medium">
                  Poznaj ludzi z wielkimi sercami. 💝
                </p>
              </div>

              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
                    <Users className="h-20 w-20 text-secondary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="bg-white rounded-3xl p-6 shadow-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filtry</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Wybierz rodzaj</label>
                  <select className="w-full p-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none">
                    <option>Wszystkie</option>
                    <option>Schronisko</option>
                    <option>Fundacja</option>
                    <option>Stowarzyszenie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Województwo</label>
                  <select className="w-full p-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none">
                    <option>Wszystkie</option>
                    <option>Mazowieckie</option>
                    <option>Śląskie</option>
                    <option>Małopolskie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Miejscowość</label>
                  <input 
                    type="text" 
                    placeholder="Wpisz miejscowość..."
                    className="w-full p-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organizations List */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Lista organizacji
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {organizationData.map((org) => (
                <Card 
                  key={org.id}
                  className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-3 rounded-3xl border-0 shadow-card cursor-pointer"
                >
                  {/* Header with Icon */}
                  <div className={`${org.backgroundColor} p-8 relative overflow-hidden`}>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full animate-bounce-gentle"></div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-white/15 rounded-full animate-float delay-300"></div>
                    
                    <div className="text-center">
                      <div className="text-6xl mb-4">{org.image}</div>
                      <h3 className="text-2xl font-bold text-white mb-2">{org.name}</h3>
                      <div className="flex items-center justify-center space-x-2 text-white/90">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{org.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {org.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Heart className="h-5 w-5 text-primary fill-current" />
                        </div>
                        <p className="text-lg font-bold text-foreground">{org.animalsCount}</p>
                        <p className="text-xs text-muted-foreground">podopiecznych</p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <ShoppingBag className="h-5 w-5 text-secondary" />
                        </div>
                        <p className="text-lg font-bold text-foreground">{org.totalWishlistValue}</p>
                        <p className="text-xs text-muted-foreground">lista życzeń</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{org.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{org.email}</span>
                      </div>
                    </div>

                    {/* Urgent Needs */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Pilnie potrzebne:</p>
                      <div className="flex flex-wrap gap-2">
                        {org.urgentNeeds.map((need, index) => (
                          <span 
                            key={index}
                            className="bg-accent-light text-accent text-xs px-3 py-1.5 rounded-full font-semibold"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-border/30">
                      <div className="flex space-x-3">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 rounded-xl font-bold"
                        >
                          Zobacz zwierzęta
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="flex-1 rounded-xl font-bold"
                        >
                          Wspieraj organizację
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="hero" size="lg">
                Pokaż więcej organizacji
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nasze partnerstwa
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Współpracujemy z najlepszymi organizacjami w całej Polsce
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="bg-primary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white fill-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-sm text-muted-foreground">Organizacji partnerskich</p>
              </div>
              <div className="space-y-2">
                <div className="bg-secondary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">234</p>
                <p className="text-sm text-muted-foreground">Wolontariuszy</p>
              </div>
              <div className="space-y-2">
                <div className="bg-accent rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">16</p>
                <p className="text-sm text-muted-foreground">Województw</p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-muted-foreground">Wspartych zwierząt</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Zostań partnerem! 🤝
              </h2>
              <p className="text-xl text-white/95 mb-8">
                Jesteś organizacją pomagającą zwierzętom? Dołącz do nas i pozwól wspierać Twoich podopiecznych!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="light" size="hero">
                  Aplikuj jako organizacja
                  <Heart className="h-6 w-6 fill-current" />
                </Button>
                <Button variant="outline" size="hero" className="border-white text-white hover:bg-white hover:text-primary">
                  Dowiedz się więcej
                  <Users className="h-6 w-6" />
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

export default Organizacje;