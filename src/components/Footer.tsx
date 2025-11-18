import { Heart, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Heart className="h-8 w-8 text-primary fill-current" />
                <Heart className="h-6 w-6 text-accent fill-current -ml-2" />
              </div>
              <span className="text-xl font-bold text-primary">Pączki w Maśle</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pomagamy bezdomnym zwierzętom znaleźć dom i otrzymać niezbędne wsparcie.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Szybkie linki</h3>
            <nav className="space-y-2">
              <a href="/o-nas" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                O nas
              </a>
              <a href="/jak-to-dziala" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Jak to działa?
              </a>
              <a href="/organizacje" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Organizacje
              </a>
              <a href="/zwierzeta" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Zwierzęta
              </a>
              <a href="/kontakt" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Kontakt
              </a>
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Śledź nas</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-primary/10 p-3 rounded-full hover:bg-primary hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary/10 p-3 rounded-full hover:bg-primary hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Prawa autorskie © 2025 Fundacja Pączki w maśle. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;