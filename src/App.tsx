import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AnimalProfile from "./pages/AnimalProfile";
import NotFound from "./pages/NotFound";
import ONas from "./pages/ONas";
import JakToDziala from "./pages/JakToDziala";
import Organizacje from "./pages/Organizacje";
import Zwierzeta from "./pages/Zwierzeta";
import Kontakt from "./pages/Kontakt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
