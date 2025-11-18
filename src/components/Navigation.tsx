import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, User, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CartDrawer from "@/components/CartDrawer";

const Navigation = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

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
            <CartDrawer />
            
            {loading ? (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.display_name || 'Użytkownik'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profil?tab=settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ustawienia</span>
                  </DropdownMenuItem>
                  {profile?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel Administratora</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj się</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/auth')}
              >
                Zaloguj się
              </Button>
            )}
            
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