import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Users, ShoppingBag, Phone, Mail, Filter, Search } from "lucide-react";

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
        {/* Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="bg-card rounded-3xl p-4 sm:p-6 shadow-card border border-border/50">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Filtry</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Szukaj..." 
                    className="pl-10 rounded-2xl border-2 text-sm"
                  />
                </div>

                {/* Organization Type Filter */}
                <Select>
                  <SelectTrigger className="rounded-2xl border-2 text-sm">
                    <SelectValue placeholder="Rodzaj" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
                    <SelectItem value="wszystkie">Wszystkie</SelectItem>
                    <SelectItem value="schronisko">Schronisko</SelectItem>
                    <SelectItem value="fundacja">Fundacja</SelectItem>
                    <SelectItem value="stowarzyszenie">Stowarzyszenie</SelectItem>
                  </SelectContent>
                </Select>

                {/* Province Filter */}
                <Select>
                  <SelectTrigger className="rounded-2xl border-2 text-sm">
                    <SelectValue placeholder="Województwo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
                    <SelectItem value="wszystkie">Wszystkie</SelectItem>
                    <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
                    <SelectItem value="slaskie">Śląskie</SelectItem>
                    <SelectItem value="malopolskie">Małopolskie</SelectItem>
                    <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
                  </SelectContent>
                </Select>

                {/* City Filter */}
                <div>
                  <Input 
                    placeholder="Miejscowość..." 
                    className="rounded-2xl border-2 text-sm"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Szybkie filtry:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full text-xs sm:text-sm">
                    Najwięcej zwierząt
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs sm:text-sm">
                    Pilne potrzeby
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs sm:text-sm">
                    W mojej okolicy
                  </Button>
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
                Nasi partnerzy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Poznaj organizacje, które codziennie pomagają zwierzętom w potrzebie. Wspieraj ich działania!
              </p>
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