
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "./components/Layout";
import Enemies from "./pages/Enemies";
import Battlefield from "./pages/Battlefield";
import BattleStrategy from "./pages/BattleStrategy";
import Skills from "./pages/Skills";
import NotFound from "./pages/NotFound";
import Conquests from "./pages/Conquests";
import Summary from "./pages/Summary";
import SpartanProgress from "./pages/SpartanProgress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Enemies />} />
              <Route path="/battlefield" element={<Battlefield />} />
              <Route path="/battle-strategy" element={<BattleStrategy />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/conquests" element={<Conquests />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/spartan-progress" element={<SpartanProgress />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
