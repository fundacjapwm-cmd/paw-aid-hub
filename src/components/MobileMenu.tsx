import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Building2, Shield } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrganization } from '@/hooks/useUserOrganization';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { hasOrganization } = useUserOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const menuItems = [
    { label: 'Strona główna', path: '/' },
    { label: 'O nas', path: '/o-nas' },
    
    { label: 'Organizacje', path: '/organizacje' },
    { label: 'Zwierzęta', path: '/zwierzeta' },
    { label: 'Kontakt', path: '/kontakt' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleNavigateToForm = () => {
    setOpen(false);
    navigate('/zaloz-konto');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex items-center space-x-2 mb-8">
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-bold text-primary">Pączki w Maśle</span>
        </div>
        
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`relative text-left text-lg font-medium transition-colors py-2 ${
                isActive(item.path) 
                  ? 'text-primary pl-4' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full animate-scale-in" />
              )}
            </button>
          ))}
          
          <Separator className="my-4" />
          
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.display_name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.display_name || 'Użytkownik'}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              
              {/* Show organization panel for ORG role OR any user assigned to an organization */}
              {(profile?.role === 'ORG' || hasOrganization) && (
                <button
                  onClick={() => handleNavigation('/organizacja')}
                  className="flex items-center space-x-2 text-left text-lg font-medium transition-colors py-2 text-foreground hover:text-primary"
                >
                  <Building2 className="h-5 w-5" />
                  <span>Panel organizacji</span>
                </button>
              )}
              
              {profile?.role === 'ADMIN' && (
                <button
                  onClick={() => handleNavigation('/admin')}
                  className="flex items-center space-x-2 text-left text-lg font-medium transition-colors py-2 text-foreground hover:text-primary"
                >
                  <Shield className="h-5 w-5" />
                  <span>Panel administratora</span>
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-left text-lg font-medium transition-colors py-2 text-foreground hover:text-primary"
              >
                <LogOut className="h-5 w-5" />
                <span>Wyloguj się</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Button asChild variant="default" className="w-full">
                <Link to="/auth" onClick={() => setOpen(false)}>Zaloguj się</Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={handleNavigateToForm}
              >
                <Building2 className="h-4 w-4" />
                Załóż konto organizacji
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
