import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [cartCount] = useState(0);

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Heart className="h-8 w-8 text-primary fill-current" />
              <Heart className="h-6 w-6 text-accent fill-current -ml-2" />
            </div>
            <span className="text-xl font-bold text-primary">Pączki w Maśle</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Strona główna
            </a>
            <a href="/o-nas" className="text-foreground hover:text-primary transition-colors font-medium">
              O nas
            </a>
            <a href="/jak-to-dziala" className="text-foreground hover:text-primary transition-colors font-medium">
              Jak to działa?
            </a>
            <a href="/organizacje" className="text-foreground hover:text-primary transition-colors font-medium">
              Organizacje
            </a>
            <a href="/zwierzeta" className="text-foreground hover:text-primary transition-colors font-medium">
              Zwierzęta
            </a>
            <a href="/kontakt" className="text-foreground hover:text-primary transition-colors font-medium">
              Kontakt
            </a>
          </div>

          {/* Cart and Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="hero" size="sm">
              Pomagaj
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;