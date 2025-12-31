import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import OrgBottomNav from "./components/OrgBottomNav";
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
import AdminOrganizationDetails from "./pages/admin/AdminOrganizationDetails";
import AdminProducers from "./pages/admin/AdminProducers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminOrganizationStats from "./pages/admin/AdminOrganizationStats";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminAnimals from "./pages/admin/AdminAnimals";
import AdminOrders from "./pages/admin/AdminOrders";
import LogisticsMatrix from "./pages/admin/LogisticsMatrix";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminLogisticsInProgress from "./pages/admin/AdminLogisticsInProgress";
import AdminLogisticsCompleted from "./pages/admin/AdminLogisticsCompleted";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminErrorLogs from "./pages/admin/AdminErrorLogs";
import OrgOrders from "./pages/OrgOrders";
import OrgDashboard from "./pages/OrgDashboard";

import OrgProfile from "./pages/OrgProfile";
import OrgWishlist from "./pages/OrgWishlist";
import OrgOrdersToConfirm from "./pages/OrgOrdersToConfirm";
import OrgOrdersArchive from "./pages/OrgOrdersArchive";
import OrgDeliveries from "./pages/OrgDeliveries";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import SetPassword from "./pages/SetPassword";
import OrganizationPublicProfile from "./pages/OrganizationPublicProfile";
import PolitykaPrywatnosci from "./pages/PolitykaPrywatnosci";
import Regulamin from "./pages/Regulamin";
import FAQ from "./pages/FAQ";
import { CookieConsent } from "./components/CookieConsent";

const queryClient = new QueryClient();

function AppContent() {
  const { profile } = useAuth();
  const isOrgUser = profile?.role === "ORG";

  return (
    <>
      <Navigation />
      <div className={isOrgUser ? "pb-20 lg:pb-0" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/zwierze/:id" element={<AnimalProfile />} />
          <Route path="/o-nas" element={<ONas />} />
          
          <Route path="/organizacje" element={<Organizacje />} />
          <Route path="/organizacje/:slug" element={<OrganizationPublicProfile />} />
          <Route path="/zwierzeta" element={<Zwierzeta />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/prywatnosc" element={<PolitykaPrywatnosci />} />
          <Route path="/regulamin" element={<Regulamin />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/profil" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStats />} />
            <Route path="zamowienia" element={<AdminOrders />} />
            <Route path="logistyka/matrix" element={<LogisticsMatrix />} />
            <Route path="logistyka/w-realizacji" element={<AdminLogisticsInProgress />} />
            <Route path="logistyka/dostawy" element={<AdminDeliveries />} />
            <Route path="logistyka/zakonczone" element={<AdminLogisticsCompleted />} />
            <Route path="organizacje" element={<AdminOrganizations />} />
            <Route path="organizacje/:id" element={<AdminOrganizationDetails />} />
            <Route path="zgloszenia" element={<AdminLeads />} />
            <Route path="zwierzeta" element={<AdminAnimals />} />
            <Route path="producenci" element={<AdminProducers />} />
            <Route path="partnerzy" element={<AdminPartners />} />
            <Route path="uzytkownicy" element={<AdminUsers />} />
            <Route path="statystyki-organizacji" element={<AdminOrganizationStats />} />
            <Route path="finanse" element={<AdminFinances />} />
            <Route path="logi" element={<AdminLogs />} />
            <Route path="bledy" element={<AdminErrorLogs />} />
          </Route>
          
          {/* Organization Routes */}
          <Route path="/organizacja" element={<OrgDashboard />} />
          
          <Route path="/organizacja/lista-potrzeb" element={<OrgWishlist />} />
          <Route path="/organizacja/dostawy" element={<OrgDeliveries />} />
          <Route path="/organizacja/zamowienia" element={<OrgOrders />} />
          <Route path="/organizacja/profil" element={<OrgProfile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <OrgBottomNav />
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
