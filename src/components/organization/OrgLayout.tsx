import { ReactNode, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ClipboardList, Settings, LogOut, ExternalLink, Package, ChevronDown, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";

interface OrgLayoutProps {
  children: ReactNode;
  organizationName?: string;
}

const menuStructure = [
  { title: "Pulpit", url: "/organizacja", icon: Home },
  { title: "Lista potrzeb", url: "/organizacja/lista-potrzeb", icon: ClipboardList },
  { title: "Zamówienia", url: "/organizacja/zamowienia", icon: Package },
  { title: "Ustawienia", url: "/organizacja/profil", icon: Settings },
];

function OrgSidebarContent() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-lg font-semibold text-primary">
          Panel Organizacji
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuStructure.map((item, idx) => (
              <SidebarMenuItem key={idx}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  className={isActive(item.url) ? "bg-primary/10 text-primary font-medium" : ""}
                >
                  <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {open && <span>Wyloguj</span>}
        </Button>
      </div>
    </SidebarContent>
  );
}

export default function OrgLayout({ children, organizationName }: OrgLayoutProps) {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [orgSlug, setOrgSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgSlug = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("organization_users")
        .select("organizations(slug)")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.organizations) {
        setOrgSlug((data.organizations as any).slug);
      }
    };
    
    fetchOrgSlug();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (items: any[]) => items.some(item => isActive(item.url));

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/organizacja") return "Pulpit";
    if (path === "/organizacja/lista-potrzeb") return "Lista potrzeb";
    if (path === "/organizacja/dostawy") return "Dostawy";
    if (path === "/organizacja/zamowienia") return "Zamówienia - Do potwierdzenia";
    if (path === "/organizacja/zamowienia/archiwum") return "Zamówienia - Archiwum";
    if (path === "/organizacja/profil") return "Ustawienia";
    return organizationName || "Panel Organizacji";
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-50 bg-background border-b border-border shadow-md">
          <div className="flex items-center gap-3 p-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Otwórz menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <Logo className="h-8 w-auto" />
                    <h2 className="text-lg font-semibold text-primary">
                      Panel Organizacji
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {menuStructure.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                          isActive(item.url)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  {orgSlug && (
                    <div className="p-4 border-t border-border">
                      <Link to={`/organizacje/${orgSlug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Podgląd profilu
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="p-4 border-t border-border">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={signOut}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Wyloguj</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg text-foreground">{getPageTitle()}</h1>
          </div>
        </header>
        <main className="md:p-4">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar collapsible="icon" className="border-r border-border">
          <div className="p-4 border-b border-border">
            <SidebarTrigger className="ml-auto" />
          </div>
          <OrgSidebarContent />
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 bg-white border-b border-border shadow-soft">
            <div className="flex items-center justify-between p-6">
              <h1 className="text-2xl font-bold text-foreground">
                {organizationName || "Panel Organizacji"}
              </h1>
              {orgSlug && (
                <Link to={`/organizacje/${orgSlug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Podgląd profilu publicznego
                  </Button>
                </Link>
              )}
            </div>
          </header>
          <div className="md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
