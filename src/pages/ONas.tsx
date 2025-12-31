import Footer from "@/components/Footer";
import LeadGenSection from "@/components/LeadGenSection";
import heroKittens from "@/assets/about/hero-kittens.jpg";
import womanDog from "@/assets/about/woman-dog.png";
import decorativePaws from "@/assets/decorative-paws.png";
import HandwrittenUnderline from "@/components/icons/HandwrittenUnderline";
import PawPattern from "@/components/icons/PawPattern";
import { ShelterHouseIcon, CatSterileIcon, CharityHandIcon, VaccineIcon } from "@/components/icons/ServiceIcons";
import { HeartPawHelpIcon, GiftBoxIcon, VetCareIcon, AdoptionHomeIcon } from "@/components/icons/HelpIcons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Package, Scissors, Stethoscope, Home, PawPrint as PawIcon } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useState, useEffect } from "react";

const ONas = () => {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  
  const services = [
    { icon: Package, label: "Karma i akcesoria" },
    { icon: Scissors, label: "Sterylizacja" },
    { icon: Stethoscope, label: "Opieka weterynaryjna" },
    { icon: Home, label: "Adopcje" },
    { icon: PawIcon, label: "Opieka nad zwierzętami" },
  ];

  const scopeItems = [
    {
      Icon: ShelterHouseIcon,
      title: "Organizacja pomocy rzeczowej dla schronisk",
      desc: "Wspieramy schroniska w całej Polsce, dostarczając karmę, koce, zabawki i niezbędne akcesoria dla zwierząt."
    },
    {
      Icon: CatSterileIcon,
      title: "Gminna inicjatywa sterylizacji bezdomnych kotów",
      desc: "Prowadzimy programy sterylizacji wolno żyjących kotów, by ograniczyć bezdomność zwierząt."
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
  ];

  // Auto-rotate active service card
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveServiceIndex((prev) => (prev + 1) % scopeItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const helpSteps = [
    { 
      Icon: HeartPawHelpIcon, 
      title: "Wybierz zwierzę", 
      desc: "Przeglądaj profile podopiecznych i wybierz tego, któremu chcesz pomóc",
      color: "text-primary"
    },
    { 
      Icon: GiftBoxIcon, 
      title: "Dodaj produkty do koszyka", 
      desc: "Wybierz produkty z listy życzeń zwierzaka i dodaj je do koszyka",
      color: "text-secondary"
    },
    { 
      Icon: VetCareIcon, 
      title: "Opłać zamówienie", 
      desc: "Bezpieczna płatność online - szybko i wygodnie",
      color: "text-accent"
    },
    { 
      Icon: AdoptionHomeIcon, 
      title: "Pomoc dociera", 
      desc: "Przesyłka trafia bezpośrednio do schroniska, a zwierzak jest szczęśliwy",
      color: "text-primary"
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global paw pattern background */}
      <PawPattern />
      
      <main className="relative z-10">
        {/* Hero Section - matching home page height and style */}
        <section className="relative pt-8 pb-12 md:py-12 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden flex items-center">
          {/* Background image with gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroKittens}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Soft dark gradient: darker on left, fading to transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          {/* Decorative paws as subtle background */}
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-5">
            <img
              src={decorativePaws}
              alt=""
              className="absolute top-10 right-10 w-64 md:w-80 lg:w-96"
            />
          </div>

          <div className="md:container md:mx-auto md:max-w-6xl md:px-8 relative z-10 px-4">
            {/* Content - Left aligned, matching home page layout */}
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Jesteśmy dla tych,<br />którzy najbardziej<br />
                nas{" "}
                <span className="relative inline-block">
                  potrzebują.
                  <HandwrittenUnderline className="absolute -bottom-2 left-0 w-full text-primary" />
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/95 mb-4 md:mb-8 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                Fundacja Pączki w Maśle - wspieramy schroniska i organizacje w całej Polsce.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Primary CTA - matching home page style */}
                <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-white md:hover:bg-accent/90 md:hover:shadow-[0_0_30px_rgba(233,165,46,0.4)] shadow-card md:hover:-translate-y-1 transition-all duration-300 rounded-3xl px-8 h-14 text-lg font-bold md:hover:scale-105">
                  <Link to="/zwierzeta">Zobacz zwierzęta</Link>
                </Button>
                {/* Secondary CTA */}
                <Button asChild size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground md:hover:bg-secondary/90 md:hover:shadow-[0_0_30px_rgba(159,185,115,0.3)] shadow-card md:hover:-translate-y-1 transition-all duration-300 rounded-3xl px-8 h-14 text-lg font-bold md:hover:scale-105">
                  <Link to="/organizacje">Nasze organizacje</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services scroll bar - heavier icons */}
        <section className="bg-primary py-5 overflow-hidden relative z-20">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...services, ...services].map((service, index) => (
              <div key={index} className="flex items-center mx-8 md:mx-10">
                <service.icon className="w-6 h-6 text-primary-foreground mr-3" strokeWidth={2.5} />
                <span className="text-primary-foreground font-semibold text-sm md:text-base">
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Kim jesteśmy Section - Simplified */}
        <section className="py-16 md:py-24 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left - Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-full max-w-md aspect-square flex items-center justify-center bg-muted/50 rounded-[3rem] p-8 border border-border/30">
                  <img
                    src={logo}
                    alt="Pączki w Maśle - logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Right - Content */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
                  Kim jesteśmy?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 text-base md:text-lg">
                  Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, 
                  gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji 
                  na terenie całej Polski.
                </p>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  Nasza siła to wieloletnie doświadczenie, pasja do zwierząt oraz ludzie, 
                  którzy z sercem dbają o zwierzęta w potrzebie.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Zakres naszych działań Section */}
        <section className="py-16 md:py-24 bg-muted/50 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-medium mb-2">Nasza działalność</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
                Zakres naszych działań
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {scopeItems.map((item, i) => (
                <div 
                  key={i} 
                  className={`rounded-3xl p-6 transition-all duration-500 cursor-pointer ${
                    activeServiceIndex === i 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                      : 'bg-background border border-border/50 hover:border-primary/30 shadow-sm'
                  }`}
                  onClick={() => setActiveServiceIndex(i)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    activeServiceIndex === i ? 'bg-primary-foreground/20' : 'bg-muted'
                  }`}>
                    <item.Icon className={`w-7 h-7 ${activeServiceIndex === i ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <h3 className={`font-semibold mb-2 text-lg leading-tight ${
                    activeServiceIndex === i ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    activeServiceIndex === i ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jak pomagamy zwierzętom Section */}
        <section className="py-16 md:py-24 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-medium mb-2">Krok po kroku</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
                Jak pomagamy zwierzętom?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {helpSteps.map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 mb-6 flex items-center justify-center">
                    {/* Background circle */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all`} />
                    {/* Icon */}
                    <item.Icon className={`relative z-10 w-16 h-16 ${item.color} transition-transform group-hover:scale-110`} />
                    {/* Step number badge */}
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                      0{i + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nasza misja Section */}
        <section className="py-16 md:py-24 bg-muted/50 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-8">
              <p className="text-primary font-medium mb-2">Cel naszej pracy</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
                Nasza misja
              </h2>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-10 shadow-lg border border-border/50 max-w-3xl mx-auto">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 text-center">
                Z serca dla zwierząt
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-center">
                Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, 
                który dotyka tysięcy zwierząt każdego roku. Naszą misją jest nieustanna pomoc 
                wszystkim bezbronnym zwierzętom. Pomagamy bezdomnym czworonogom odzyskać 
                zdrowie, siły i zaufanie do ludzi.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section - Simplified, removed plus icon */}
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
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-background mb-4">
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
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl">
                  <img src={womanDog} alt="" className="w-full h-full object-cover" />
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
