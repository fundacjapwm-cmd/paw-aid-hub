import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Package, Settings, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { title: "Pulpit", url: "/organizacja", icon: Home },
  { title: "Lista potrzeb", url: "/organizacja/lista-potrzeb", icon: ClipboardList },
  { title: "Dostawy", url: "/organizacja/dostawy", icon: Truck },
  { title: "Zamówienia", url: "/organizacja/zamowienia", icon: Package },
  { title: "Ustawienia", url: "/organizacja/profil", icon: Settings },
];

export default function OrgBottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only show for ORG users on mobile
  if (!isMobile || profile?.role !== "ORG") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
