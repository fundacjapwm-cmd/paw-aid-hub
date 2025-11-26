import { ReactNode, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, PawPrint, ClipboardList, Settings, LogOut, ExternalLink, Package, ShoppingBag } from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrgLayoutProps {
  children: ReactNode;
  organizationName?: string;
}

const menuItems = [
  { title: "Pulpit", url: "/organizacja", icon: Home },
  { title: "Lista potrzeb", url: "/organizacja/lista-potrzeb", icon: ClipboardList },
  { title: "Zamówienia", url: "/organizacja/zamowienia", icon: Package },
  { title: "Ustawienia", url: "/organizacja/profil", icon: Settings },
];

function OrgSidebarContent() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open } = useSidebar();

  const isActive = (path: string) => {
    // For orders, check if current path starts with the orders path
    if (path === "/organizacja/zamowienia") {
      return location.pathname.startsWith("/organizacja/zamowienia");
    }
    return location.pathname === path;
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-lg font-semibold text-primary">
          Panel Organizacji
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
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
  const { user } = useAuth();
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-soft">
          <div className="flex items-center justify-center p-4">
            <h1 className="font-semibold text-lg">{organizationName || "Panel"}</h1>
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
