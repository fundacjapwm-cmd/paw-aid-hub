import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: 'Strona główna', path: '/' },
    { label: 'O nas', path: '/o-nas' },
    { label: 'Jak to działa?', path: '/jak-to-dziala' },
    { label: 'Organizacje', path: '/organizacje' },
    { label: 'Zwierzęta', path: '/zwierzeta' },
    { label: 'Kontakt', path: '/kontakt' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex items-center space-x-2 mb-8">
          <div className="flex items-center space-x-1">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <Heart className="h-6 w-6 text-accent fill-current -ml-2" />
          </div>
          <span className="text-xl font-bold text-primary">Pączki w Maśle</span>
        </div>
        
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`relative text-left text-lg font-medium transition-colors py-2 ${
                isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-scale-in" />
              )}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
