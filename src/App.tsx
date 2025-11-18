import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import AnimalProfile from "./pages/AnimalProfile";
import NotFound from "./pages/NotFound";
import ONas from "./pages/ONas";
import JakToDziala from "./pages/JakToDziala";
import Organizacje from "./pages/Organizacje";
import Zwierzeta from "./pages/Zwierzeta";
import Kontakt from "./pages/Kontakt";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/zwierze/:id" element={<AnimalProfile />} />
            <Route path="/o-nas" element={<ONas />} />
            <Route path="/jak-to-dziala" element={<JakToDziala />} />
            <Route path="/organizacje" element={<Organizacje />} />
            <Route path="/zwierzeta" element={<Zwierzeta />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
