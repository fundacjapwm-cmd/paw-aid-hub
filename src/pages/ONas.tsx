import Footer from "@/components/Footer";
import LeadGenSection from "@/components/LeadGenSection";
import { Logo } from "@/components/Logo";
import kittenTrain from "@/assets/about/kitten-train.png";
import kittensBasket from "@/assets/about/kittens-basket.jpg";
import womanDog from "@/assets/about/woman-dog.png";
import WavyLine from "@/components/icons/WavyLine";
import PawPrint from "@/components/icons/PawPrint";
import HeartPawIcon from "@/components/icons/HeartPawIcon";
import HandshakePawIcon from "@/components/icons/HandshakePawIcon";
import ShieldPawIcon from "@/components/icons/ShieldPawIcon";
import { Heart, Users, Truck, Stethoscope } from "lucide-react";

const ONas = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-10 text-primary/10">
            <PawPrint className="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <div className="absolute bottom-20 right-10 text-primary/10">
            <PawPrint className="w-20 h-20 md:w-32 md:h-32 rotate-12" />
          </div>
          <div className="absolute top-32 right-1/4 text-primary/20 hidden md:block">
            <PawPrint className="w-12 h-12" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Wavy line decoration */}
            <div className="flex justify-center mb-8">
              <WavyLine className="text-primary w-32 md:w-48" />
            </div>

            {/* Logo and tagline */}
            <div className="text-center mb-12 md:mb-16">
              <div className="flex justify-center mb-6">
                <Logo className="h-16 md:h-24" />
              </div>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-xl mx-auto">
                Jesteśmy dla tych, którzy najbardziej nas potrzebują
              </p>
            </div>

            {/* Hero images grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto">
              <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg">
                <img
                  src={kittenTrain}
                  alt="Ludzie głaszczący kociaka"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg mt-8">
                <img
                  src={kittensBasket}
                  alt="Kocięta w koszyku"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg">
                <img
                  src={womanDog}
                  alt="Kobieta przytulająca psa"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Decorative arrow */}
            <div className="flex justify-center mt-8">
              <WavyLine variant="arrow" className="text-primary w-20 md:w-28 rotate-45" />
            </div>
          </div>
        </section>

        {/* Kim jesteśmy Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Kim jesteśmy?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
                  Fundacja Pączki w Maśle powstała z miłości do zwierząt i potrzeby działania tam, 
                  gdzie jest to najbardziej potrzebne. Współpracujemy z siecią schronisk i organizacji 
                  na terenie całej Polski.
                </p>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  Nasza siła to wieloletnie doświadczenie, pasja do zwierząt oraz ludzie, 
                  którzy z sercem dbają o zwierzęta w potrzebie.
                </p>
              </div>
              <div className="relative">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-xl">
                  <img
                    src={kittensBasket}
                    alt="Kocięta w koszyku"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                {/* Decorative paw */}
                <div className="absolute -bottom-6 -right-6 text-primary/20">
                  <PawPrint className="w-24 h-24" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nasza misja Section - Full width with primary background */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 text-primary-foreground/10">
            <PawPrint className="w-32 h-32" />
          </div>
          <div className="absolute bottom-10 right-10 text-primary-foreground/10">
            <PawPrint className="w-40 h-40 rotate-[-20deg]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center">
              Nasza misja
            </h2>
            <p className="text-primary-foreground/90 leading-relaxed mb-6 text-base md:text-lg text-center">
              Wszystko zaczęło się od jednego telefonu. Bezdomność zwierzęca to problem, 
              który dotyka tysięcy zwierząt każdego roku. Naszym celem jest walka z tym 
              zjawiskiem poprzez konkretne działania.
            </p>
            <p className="text-primary-foreground/90 leading-relaxed text-base md:text-lg text-center">
              Naszą misją jest nieustanna pomoc wszystkim bezbronnym zwierzętom. 
              Pomagamy bezdomnym czworonogom odzyskać zdrowie, siły i zaufanie do ludzi.
            </p>
          </div>
        </section>

        {/* Zakres działań Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Zakres naszych działań
              </h2>
              <WavyLine className="text-primary mx-auto" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50 text-center">
                <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto mb-4">
                  <HeartPawIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Pomoc rzeczowa</h3>
                <p className="text-sm text-muted-foreground">
                  Organizujemy pomoc rzeczową dla schronisk w postaci karmy, legowisk i akcesoriów.
                </p>
              </div>

              {/* Card 2 - Highlighted */}
              <div className="bg-primary rounded-3xl p-6 md:p-8 shadow-card text-primary-foreground text-center">
                <div className="bg-primary-foreground/20 rounded-2xl p-4 w-fit mx-auto mb-4">
                  <HandshakePawIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-3">Sterylizacja kotów</h3>
                <p className="text-sm text-primary-foreground/80">
                  Prowadzimy inicjatywę sterylizacji bezdomnych kotów wolnożyjących.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50 text-center">
                <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto mb-4">
                  <ShieldPawIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Akcje charytatywne</h3>
                <p className="text-sm text-muted-foreground">
                  Organizujemy akcje społeczno-charytatywne na rzecz bezdomnych zwierząt.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50 text-center">
                <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">Opieka weterynaryjna</h3>
                <p className="text-sm text-muted-foreground">
                  Wspieramy regularne szczepienia i opiekę weterynaryjną dla podopiecznych.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nasze wartości Section */}
        <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-primary/5">
            <PawPrint className="w-64 h-64" />
          </div>
          <div className="absolute bottom-0 right-0 text-primary/5">
            <PawPrint className="w-48 h-48 rotate-45" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Nasze wartości
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Kierujemy się wartościami, które pomagają nam każdego dnia w naszej misji
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Value 1 */}
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50">
                <div className="bg-primary rounded-2xl p-4 w-fit mb-6">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Miłość</h3>
                <p className="text-muted-foreground">
                  Każde zwierzę zasługuje na bezwarunkową miłość i troskę. To miłość napędza nasze działania każdego dnia.
                </p>
              </div>

              {/* Value 2 */}
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50">
                <div className="bg-secondary rounded-2xl p-4 w-fit mb-6">
                  <Users className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Współpraca</h3>
                <p className="text-muted-foreground">
                  Razem możemy więcej. Łączymy siły z organizacjami, wolontariuszami i darczyńcami.
                </p>
              </div>

              {/* Value 3 */}
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50">
                <div className="bg-accent rounded-2xl p-4 w-fit mb-6">
                  <Truck className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Działanie</h3>
                <p className="text-muted-foreground">
                  Nie czekamy - działamy. Każdy dzień to szansa, by pomóc kolejnemu zwierzęciu w potrzebie.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA with image Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="relative order-2 md:order-1">
                <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-xl">
                  <img
                    src={womanDog}
                    alt="Kobieta przytulająca psa"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                {/* Decorative wavy line */}
                <div className="absolute -top-4 -left-4">
                  <WavyLine variant="arrow" className="text-primary w-16" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Dołącz do naszej misji
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
                  Jesteś organizacją, która chce dołączyć do naszej sieci? Schroniskiem potrzebującym 
                  wsparcia? A może wolontariuszem z sercem do zwierząt?
                </p>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  Wypełnij formularz poniżej, a my skontaktujemy się z Tobą, aby omówić 
                  możliwości współpracy.
                </p>
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
