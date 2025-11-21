import { Logo } from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="bg-foreground/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo className="h-14 w-auto md:h-16 mb-4" />
            <p className="text-muted-foreground max-w-md">
              Platforma umożliwiająca wspieranie zwierząt i organizacji poprzez zakup potrzebnych produktów. 
              Każdy zakup to realna pomoc.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Nawigacja</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/o-nas" className="hover:text-primary transition-colors">O nas</a></li>
              <li><a href="/jak-to-dziala" className="hover:text-primary transition-colors">Jak to działa?</a></li>
              <li><a href="/organizacje" className="hover:text-primary transition-colors">Organizacje</a></li>
              <li><a href="/kontakt" className="hover:text-primary transition-colors">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Pomoc</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="/regulamin" className="hover:text-primary transition-colors">Regulamin</a></li>
              <li><a href="/prywatnosc" className="hover:text-primary transition-colors">Prywatność</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Pączki w Maśle. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
