import Footer from "@/components/Footer";
import LeadGenSection from "@/components/LeadGenSection";
import { Logo } from "@/components/Logo";
import kittenTrain from "@/assets/about/kitten-train.png";
import kittensBasket from "@/assets/about/kittens-basket.jpg";
import womanDog from "@/assets/about/woman-dog.png";
import heroKittens from "@/assets/about/hero-kittens.jpg";
import decorativePaws from "@/assets/decorative-paws.png";
import WavyLine from "@/components/icons/WavyLine";
import { ShelterHouseIcon, CatSterileIcon, CharityHandIcon, VaccineIcon } from "@/components/icons/ServiceIcons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Package, Scissors, Stethoscope, Home, PawPrint as PawIcon } from "lucide-react";

const ONas = () => {
  const services = [
    { icon: Package, label: "Karma i akcesoria" },
    { icon: Scissors, label: "Sterylizacja" },
    { icon: Stethoscope, label: "Opieka weterynaryjna" },
    { icon: Home, label: "Adopcje" },
    { icon: PawIcon, label: "Opieka nad zwierzętami" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroKittens}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
          </div>

          {/* Decorative paws as background */}
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-20">
            <img
              src={decorativePaws}
              alt=""
              className="absolute top-10 right-10 w-64 md:w-80 lg:w-96"
            />
            <img
              src={decorativePaws}
              alt=""
              className="absolute bottom-10 left-10 w-48 md:w-64 rotate-180"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left side - Text + CTA */}
              <div>
                {/* Decorative wavy line */}
                <div className="mb-6 md:mb-8">
                  <WavyLine variant="arrow" className="text-primary w-20 md:w-28" />
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Jesteśmy dla tych,<br />którzy najbardziej<br />nas potrzebują.
                </h1>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-8 text-base">
                    <Link to="/zwierzeta">Zobacz zwierzęta</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base bg-background/50 backdrop-blur-sm">
                    <Link to="/organizacje">Nasze organizacje</Link>
                  </Button>
                </div>
              </div>

              {/* Right side - Large Logo */}
              <div className="hidden lg:flex justify-center lg:justify-end">
                <Logo className="h-32 md:h-40 lg:h-48 xl:h-56 w-auto drop-shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Services scroll bar */}
        <section className="bg-primary py-4 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...services, ...services].map((service, index) => (
              <div key={index} className="flex items-center mx-6 md:mx-8">
                <service.icon className="w-5 h-5 text-primary-foreground mr-2" />
                <span className="text-primary-foreground font-medium text-sm md:text-base">
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Czym się zajmujemy Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-12 text-center lg:text-left">
              Zakres naszych działań
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  Icon: ShelterHouseIcon,
                  title: "Organizacja pomocy rzeczowej dla schronisk",
                  desc: "Wspieramy schroniska w całej Polsce, dostarczając karmę, koce, zabawki i niezbędne akcesoria dla zwierząt."
                },
                {
                  Icon: CatSterileIcon,
                  title: "Gminna inicjatywa sterylizacji bezdomnych kotów",
                  desc: "Prowadzimy programy sterylizacji wolno żyjących kotów, by ograniczyć bezdomność zwierząt.",
                  featured: true
                },
                {
                  Icon: CharityHandIcon,
                  title: "Akcje społeczno-charytatywne",
                  desc: "Organizujemy zbiórki, wydarzenia i kampanie społeczne na rzecz zwierząt potrzebujących pomocy."
                },
                {
                  Icon: VaccineIcon,
                  title: "Akcje promujące regularne szczepienia",
                  desc: "Edukujemy opiekunów zwierząt o korzyściach regularnych szczepień i profilaktyki zdrowotnej."
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`rounded-3xl p-6 transition-all ${
                    item.featured 
                      ? 'bg-primary/10 border-2 border-primary/20' 
                      : 'bg-background border border-border/50 hover:border-primary/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    item.featured ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <item.Icon className={`w-7 h-7 ${item.featured ? 'text-primary' : 'text-primary'}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Section - Animal Feature Card */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left - Image gallery */}
              <div className="relative">
                {/* Main image */}
                <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-xl aspect-[4/3]">
                  <img
                    src={kittensBasket}
                    alt="Kocięta w koszyku"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image info badge */}
                  <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fundacja</p>
                        <p className="text-sm font-semibold">Pączki w Maśle</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Thumbnail images */}
                <div className="flex gap-2 mt-4 justify-center">
                  {[kittenTrain, kittensBasket, womanDog, kittenTrain].map((img, i) => (
                    <div 
                      key={i} 
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden cursor-pointer transition-all ${i === 1 ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                
                {/* Decorative paw */}
                <div className="absolute -right-8 -top-8 hidden md:block pointer-events-none opacity-40">
                  <img src={decorativePaws} alt="" className="w-32 h-32 object-contain" />
                </div>
              </div>

              {/* Right - Content */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Kim jesteśmy?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 text-base md:text-lg">
                  Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, 
                  gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji 
                  na terenie całej Polski.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
                  Nasza siła to wieloletnie doświadczenie, pasja do zwierząt oraz ludzie, 
                  którzy z sercem dbają o zwierzęta w potrzebie.
                </p>

                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">50+</p>
                    <p className="text-sm text-muted-foreground">Organizacji</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">1000+</p>
                    <p className="text-sm text-muted-foreground">Zwierząt</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">100%</p>
                    <p className="text-sm text-muted-foreground">Serca</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-6">
                    <Link to="/zwierzeta">Pomóż teraz</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                    <Link to="/kontakt">Kontakt</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-medium mb-2">Krok po kroku</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Jak pomagamy zwierzętom?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Wybierz zwierzę", desc: "Przeglądaj profile podopiecznych" },
                { step: "02", title: "Dodaj do koszyka", desc: "Wybierz produkty z listy życzeń" },
                { step: "03", title: "Opłać zamówienie", desc: "Bezpieczna płatność online" },
                { step: "04", title: "Pomoc dociera", desc: "Przesyłka trafia do schroniska" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="relative mx-auto w-24 h-24 md:w-28 md:h-28 mb-4">
                    <div className={`absolute inset-0 rounded-2xl overflow-hidden shadow-lg ${i % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                      <img 
                        src={i % 2 === 0 ? kittenTrain : womanDog} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Decorative wavy line */}
            <div className="flex justify-center mt-8">
              <WavyLine className="text-primary w-32 md:w-48" />
            </div>
          </div>
        </section>

        {/* Mission Story Card */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Nasza misja
              </h2>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-[1fr,auto] gap-6 items-center">
                <div>
                  <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Od 2020 roku
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Z serca dla zwierząt
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, 
                    który dotyka tysięcy zwierząt każdego roku. Naszą misją jest nieustanna pomoc 
                    wszystkim bezbronnym zwierzętom. Pomagamy bezdomnym czworonogom odzyskać 
                    zdrowie, siły i zaufanie do ludzi.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full border">
                      ←
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full border">
                      →
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md">
                    <img src={kittensBasket} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md mt-4">
                    <img src={womanDog} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with dark background */}
        <section className="py-16 md:py-24 bg-foreground relative overflow-hidden">
          {/* Decorative paws */}
          <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
            <img src={decorativePaws} alt="" className="w-64 md:w-96" />
          </div>
          <div className="absolute top-10 right-10 opacity-10 hidden md:block pointer-events-none">
            <img src={decorativePaws} alt="" className="w-40 rotate-45" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4">
                  Szczęście zwierząt to nasz priorytet.
                </h2>
                <p className="text-background/70 mb-6 text-base md:text-lg">
                  Wszystko czego potrzebują Twoi podopieczni w jednym miejscu. 
                  Dołącz do nas i zacznij pomagać.
                </p>
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/zwierzeta">Zacznij pomagać</Link>
                </Button>
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl">
                    <img src={womanDog} alt="" className="w-full h-full object-cover" />
                  </div>
                  {/* Floating add button */}
                  <div className="absolute -bottom-4 -right-4 bg-background rounded-2xl p-4 shadow-lg">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                      <span className="text-2xl text-muted-foreground">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Gen Form */}
        <LeadGenSection />
      </main>

      <Footer />
    </div>
  );
};

export default ONas;
