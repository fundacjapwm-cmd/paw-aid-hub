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
import { CookieConsent } from "./components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load - critical for initial render
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load - non-critical pages
const AnimalProfile = lazy(() => import("./pages/AnimalProfile"));
const ONas = lazy(() => import("./pages/ONas"));
const Organizacje = lazy(() => import("./pages/Organizacje"));
const Zwierzeta = lazy(() => import("./pages/Zwierzeta"));
const Kontakt = lazy(() => import("./pages/Kontakt"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const OrganizationPublicProfile = lazy(() => import("./pages/OrganizationPublicProfile"));
const PolitykaPrywatnosci = lazy(() => import("./pages/PolitykaPrywatnosci"));
const Regulamin = lazy(() => import("./pages/Regulamin"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ZalozKonto = lazy(() => import("./pages/ZalozKonto"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const AdminOrganizations = lazy(() => import("./pages/admin/AdminOrganizations"));
const AdminOrganizationDetails = lazy(() => import("./pages/admin/AdminOrganizationDetails"));
const AdminProducers = lazy(() => import("./pages/admin/AdminProducers"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminFinances = lazy(() => import("./pages/admin/AdminFinances"));
const AdminOrganizationStats = lazy(() => import("./pages/admin/AdminOrganizationStats"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminAnimals = lazy(() => import("./pages/admin/AdminAnimals"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const LogisticsMatrix = lazy(() => import("./pages/admin/LogisticsMatrix"));
const AdminDeliveries = lazy(() => import("./pages/admin/AdminDeliveries"));
const AdminLogisticsInProgress = lazy(() => import("./pages/admin/AdminLogisticsInProgress"));
const AdminLogisticsCompleted = lazy(() => import("./pages/admin/AdminLogisticsCompleted"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminErrorLogs = lazy(() => import("./pages/admin/AdminErrorLogs"));

// Org pages - lazy loaded
const OrgDashboard = lazy(() => import("./pages/OrgDashboard"));
const OrgProfile = lazy(() => import("./pages/OrgProfile"));
const OrgWishlist = lazy(() => import("./pages/OrgWishlist"));
const OrgOrders = lazy(() => import("./pages/OrgOrders"));
const OrgOrdersToConfirm = lazy(() => import("./pages/OrgOrdersToConfirm"));
const OrgOrdersArchive = lazy(() => import("./pages/OrgOrdersArchive"));
const OrgDeliveries = lazy(() => import("./pages/OrgDeliveries"));

const queryClient = new QueryClient();

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function AppContent() {
  const { profile } = useAuth();
  const isOrgUser = profile?.role === "ORG";

  return (
    <>
      <Navigation />
      <div className={isOrgUser ? "pb-20 lg:pb-0" : ""}>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/zaloz-konto" element={<ZalozKonto />} />
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
        </Suspense>
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
              <ScrollToTop />
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
