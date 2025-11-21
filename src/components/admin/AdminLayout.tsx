import { ReactNode } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, Factory, Users, Activity, LogOut, TrendingUp, Truck, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children?: ReactNode;
}

const menuStructure = [
  { title: "Pulpit", url: "/admin", icon: LayoutDashboard },
  {
    label: "Baza Danych",
    items: [
      { title: "Organizacje", url: "/admin/organizacje", icon: Building2 },
      { title: "Producenci i Produkty", url: "/admin/producenci", icon: Factory },
      { title: "Użytkownicy", url: "/admin/uzytkownicy", icon: Users },
    ]
  },
  {
    title: "Logistyka",
    icon: Truck,
    items: [
      { title: "Oczekujące", url: "/admin/logistyka/oczekujace" },
      { title: "Archiwum", url: "/admin/logistyka/archiwum" },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Wyniki Finansowe", url: "/admin/finanse", icon: TrendingUp },
      { title: "Statystyki Organizacji", url: "/admin/statystyki-organizacji", icon: TrendingUp },
      { title: "Logi", url: "/admin/logi", icon: Activity },
    ]
  },
];

function AdminSidebarContent() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open } = useSidebar();

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (items: any[]) => items.some(item => isActive(item.url));

  return (
    <SidebarContent>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {menuStructure.map((section, idx) => {
            // Simple link (like "Pulpit")
            if ('url' in section && !('items' in section)) {
              return (
                <SidebarGroup key={idx}>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(section.url)}
                        >
                          <Link to={section.url} className="flex items-center gap-3">
                            <section.icon className="h-5 w-5" />
                            {open && <span>{section.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }

            // Group with label (like "Baza Danych")
            if ('label' in section) {
              return (
                <SidebarGroup key={idx}>
                  <SidebarGroupLabel className="text-xs uppercase text-muted-foreground">
                    {section.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <Link to={item.url} className="flex items-center gap-3">
                              <item.icon className="h-5 w-5" />
                              {open && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }

            // Collapsible group (like "Logistyka")
            if ('items' in section && 'icon' in section) {
              return (
                <SidebarGroup key={idx}>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <Collapsible
                        defaultOpen={isGroupActive(section.items)}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <section.icon className="h-5 w-5" />
                              {open && <span>{section.title}</span>}
                              {open && (
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              )}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {section.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subItem.url)}
                                  >
                                    <Link to={subItem.url}>
                                      {subItem.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }

            return null;
          })}
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Wyloguj</span>}
          </Button>
        </div>
      </div>
    </SidebarContent>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Pulpit";
    if (path === "/admin/organizacje") return "Organizacje";
    if (path === "/admin/producenci") return "Producenci i Produkty";
    if (path === "/admin/uzytkownicy") return "Użytkownicy";
    if (path === "/admin/finanse") return "Wyniki Finansowe";
    if (path === "/admin/statystyki-organizacji") return "Statystyki Organizacji";
    if (path === "/admin/logi") return "Logi Systemowe";
    if (path === "/admin/logistyka/oczekujace") return "Zamówienia Oczekujące";
    if (path === "/admin/logistyka/archiwum") return "Archiwum Logistyki";
    return "Panel Administratora";
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
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Otwórz menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarProvider>
                  <Sidebar className="w-full border-none">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                      <Logo className="h-8 w-auto" />
                      <h2 className="text-lg font-semibold text-primary">
                        Panel Admina
                      </h2>
                    </div>
                    <AdminSidebarContent />
                  </Sidebar>
                </SidebarProvider>
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg text-foreground">{getPageTitle()}</h1>
          </div>
        </header>
        <main className="p-4">
          {children || <Outlet />}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar collapsible="icon" className="border-r border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Logo className="h-8 w-auto" />
            <SidebarTrigger className="ml-auto" />
          </div>
          <AdminSidebarContent />
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 bg-white border-b border-border shadow-soft">
            <div className="flex items-center justify-between p-6">
              <h1 className="text-2xl font-bold text-foreground">
                {getPageTitle()}
              </h1>
            </div>
          </header>
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
