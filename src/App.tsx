import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import AnimalProfile from "./pages/AnimalProfile";
import NotFound from "./pages/NotFound";
import ONas from "./pages/ONas";

import Organizacje from "./pages/Organizacje";
import Zwierzeta from "./pages/Zwierzeta";
import Kontakt from "./pages/Kontakt";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminLayout from "./components/admin/AdminLayout";
import AdminStats from "./pages/admin/AdminStats";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminProducers from "./pages/admin/AdminProducers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminOrganizationStats from "./pages/admin/AdminOrganizationStats";
import AdminLogistics from "./pages/admin/AdminLogistics";
import AdminLogisticsArchive from "./pages/admin/AdminLogisticsArchive";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminLeadsArchive from "./pages/admin/AdminLeadsArchive";
import AdminProductRequests from "./pages/admin/AdminProductRequests";
import AdminOrders from "./pages/admin/AdminOrders";
import OrgDashboard from "./pages/OrgDashboard";
import OrgAnimals from "./pages/OrgAnimals";
import OrgProfile from "./pages/OrgProfile";
import OrgRequests from "./pages/OrgRequests";
import OrgWishlist from "./pages/OrgWishlist";
import OrgOrders from "./pages/OrgOrders";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import SetPassword from "./pages/SetPassword";
import OrganizationPublicProfile from "./pages/OrganizationPublicProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/zwierze/:id" element={<AnimalProfile />} />
            <Route path="/o-nas" element={<ONas />} />
            
            <Route path="/organizacje" element={<Organizacje />} />
            <Route path="/organizacje/:slug" element={<OrganizationPublicProfile />} />
            <Route path="/zwierzeta" element={<Zwierzeta />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/profil" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminStats />} />
              <Route path="organizacje" element={<AdminOrganizations />} />
              <Route path="zgloszenia" element={<AdminLeads />} />
              <Route path="zgloszenia/archiwum" element={<AdminLeadsArchive />} />
              <Route path="zgloszenia-produktow" element={<AdminProductRequests />} />
              <Route path="producenci" element={<AdminProducers />} />
              <Route path="uzytkownicy" element={<AdminUsers />} />
              <Route path="statystyki-organizacji" element={<AdminOrganizationStats />} />
              <Route path="finanse" element={<AdminFinances />} />
              <Route path="zamowienia" element={<AdminOrders />} />
              <Route path="logistyka/oczekujace" element={<AdminLogistics />} />
              <Route path="logistyka/archiwum" element={<AdminLogisticsArchive />} />
              <Route path="logi" element={<AdminLogs />} />
            </Route>
            
            {/* Organization Routes */}
            <Route path="/organizacja" element={<OrgDashboard />} />
            <Route path="/organizacja/zwierzeta" element={<OrgAnimals />} />
            <Route path="/organizacja/lista-potrzeb" element={<OrgWishlist />} />
            <Route path="/organizacja/zamowienia" element={<OrgOrders />} />
            <Route path="/organizacja/profil" element={<OrgProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
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
