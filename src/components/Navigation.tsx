import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUserOrganization } from "@/hooks/useUserOrganization";
import CartDrawer from "@/components/CartDrawer";
import MobileMenu from "@/components/MobileMenu";
import { Logo } from "@/components/Logo";
import arquivetLogo from "@/assets/logo-arquivet.svg";
const Navigation = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { hasOrganization } = useUserOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logos */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Logo className="h-10 w-auto sm:h-12 md:h-14" />
            </Link>
            <a 
              href="https://arquivet.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={arquivetLogo} 
                alt="Arquivet" 
                className="h-[34px] w-auto sm:h-[38px] md:h-[42px]"
              />
              <span className="text-muted-foreground text-[4px] sm:text-[6px] font-medium uppercase tracking-wide mt-0.5">Partner strategiczny</span>
            </a>
          </div>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`relative py-1 text-foreground hover:text-primary-dark transition-colors font-medium ${
                isActive('/') ? 'text-primary-dark' : ''
              }`}
            >
              Strona główna
              {isActive('/') && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary-dark/70 rounded-full" />
              )}
            </Link>
            <Link 
              to="/o-nas" 
              className={`relative py-1 text-foreground hover:text-primary-dark transition-colors font-medium ${
                isActive('/o-nas') ? 'text-primary-dark' : ''
              }`}
            >
              O nas
              {isActive('/o-nas') && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary-dark/70 rounded-full" />
              )}
            </Link>
            <Link 
              to="/organizacje" 
              className={`relative py-1 text-foreground hover:text-primary-dark transition-colors font-medium ${
                isActive('/organizacje') ? 'text-primary-dark' : ''
              }`}
            >
              Organizacje
              {isActive('/organizacje') && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary-dark/70 rounded-full" />
              )}
            </Link>
            <Link 
              to="/zwierzeta" 
              className={`relative py-1 text-foreground hover:text-primary-dark transition-colors font-medium ${
                isActive('/zwierzeta') ? 'text-primary-dark' : ''
              }`}
            >
              Zwierzęta
              {isActive('/zwierzeta') && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary-dark/70 rounded-full" />
              )}
            </Link>
            <Link 
              to="/kontakt" 
              className={`relative py-1 text-foreground hover:text-primary-dark transition-colors font-medium ${
                isActive('/kontakt') ? 'text-primary-dark' : ''
              }`}
            >
              Kontakt
              {isActive('/kontakt') && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary-dark/70 rounded-full" />
              )}
            </Link>
          </div>

          {/* Cart and Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile cart - always visible */}
            <div className="lg:hidden">
              <CartDrawer />
            </div>
            
            {/* Desktop only cart & user menu */}
            <div className="hidden lg:flex items-center space-x-4">
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
                  {/* Show organization panel for ORG role OR any user assigned to an organization */}
                  {(profile?.role === 'ORG' || hasOrganization) && (
                    <DropdownMenuItem onClick={() => navigate('/organizacja')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Panel Organizacji</span>
                    </DropdownMenuItem>
                  )}
                  {/* Show profile/settings for non-ORG users */}
                  {profile?.role !== 'ORG' && (
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/zaloz-konto')}
                >
                  Załóż konto organizacji
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="px-5"
                  onClick={() => navigate('/auth')}
                >
                  Zaloguj się
                </Button>
              </div>
            )}
            </div>
            
            {/* Mobile Menu */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;