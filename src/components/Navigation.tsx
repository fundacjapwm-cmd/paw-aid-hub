import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, User, LogOut, Settings, Shield, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CartDrawer from "@/components/CartDrawer";
import MobileMenu from "@/components/MobileMenu";

const Navigation = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileMenu />
          </div>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary fill-current" />
              <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-accent fill-current -ml-2" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-primary">Pączki w Maśle</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/') ? 'text-primary' : ''
              }`}
            >
              Strona główna
              {isActive('/') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
            </a>
            <a 
              href="/o-nas" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/o-nas') ? 'text-primary' : ''
              }`}
            >
              O nas
              {isActive('/o-nas') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
            </a>
            <a 
              href="/jak-to-dziala" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/jak-to-dziala') ? 'text-primary' : ''
              }`}
            >
              Jak to działa?
              {isActive('/jak-to-dziala') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
            </a>
            <a 
              href="/organizacje" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/organizacje') ? 'text-primary' : ''
              }`}
            >
              Organizacje
              {isActive('/organizacje') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
            </a>
            <a 
              href="/zwierzeta" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/zwierzeta') ? 'text-primary' : ''
              }`}
            >
              Zwierzęta
              {isActive('/zwierzeta') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
            </a>
            <a 
              href="/kontakt" 
              className={`relative text-foreground hover:text-primary transition-colors font-medium ${
                isActive('/kontakt') ? 'text-primary' : ''
              }`}
            >
              Kontakt
              {isActive('/kontakt') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary animate-scale-in" />
              )}
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
                  {profile?.role === 'ORG' ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/organizacja')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Panel Organizacji</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/profil')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profil?tab=settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Ustawienia</span>
                      </DropdownMenuItem>
                    </>
                  )}
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
                variant="default" 
                size="sm" 
                onClick={() => navigate('/auth')}
              >
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;