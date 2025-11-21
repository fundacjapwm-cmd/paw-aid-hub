import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Building2, Factory, Users, Activity, LogOut, TrendingUp, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

interface AdminLayoutProps {
  children: ReactNode;
}

  const menuItems = [
    { title: "Pulpit", url: "/admin", icon: LayoutDashboard },
    { title: "Organizacje", url: "/admin/organizacje", icon: Building2 },
    { title: "Producenci i Produkty", url: "/admin/producenci", icon: Factory },
    { title: "Użytkownicy", url: "/admin/uzytkownicy", icon: Users },
    { title: "Statystyki Organizacji", url: "/admin/statystyki-organizacji", icon: TrendingUp },
    { title: "Wyniki Finansowe", url: "/admin/finanse", icon: TrendingUp },
    { title: "Logistyka", url: "/admin/logistyka", icon: Truck },
    { title: "Logi Systemowe", url: "/admin/logi", icon: Activity },
  ];

function AdminSidebarContent() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-lg font-semibold text-primary">
          Panel Administratora
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const getPageTitle = () => {
    const item = menuItems.find(m => m.url === location.pathname);
    return item?.title || "Panel Administratora";
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-soft">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarProvider>
                    <Sidebar className="w-full border-none">
                      <AdminSidebarContent />
                    </Sidebar>
                  </SidebarProvider>
                </SheetContent>
              </Sheet>
              <h1 className="font-semibold text-lg">{getPageTitle()}</h1>
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
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
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
