
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Enemies from "./pages/Enemies";
import Battlefield from "./pages/Battlefield";
import BattleStrategy from "./pages/BattleStrategy";
import Skills from "./pages/Skills";
import NotFound from "./pages/NotFound";
import Conquests from "./pages/Conquests";
import Summary from "./pages/Summary";
import SpartanProgress from "./pages/SpartanProgress";
import Auth from "./pages/Auth";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Layout />}>
      <Route index element={
        <ProtectedRoute>
          <Enemies />
        </ProtectedRoute>
      } />
      <Route path="/battlefield" element={
        <ProtectedRoute>
          <Battlefield />
        </ProtectedRoute>
      } />
      <Route path="/battle-strategy" element={
        <ProtectedRoute>
          <BattleStrategy />
        </ProtectedRoute>
      } />
      <Route path="/skills" element={
        <ProtectedRoute>
          <Skills />
        </ProtectedRoute>
      } />
      <Route path="/conquests" element={
        <ProtectedRoute>
          <Conquests />
        </ProtectedRoute>
      } />
      <Route path="/summary" element={
        <ProtectedRoute>
          <Summary />
        </ProtectedRoute>
      } />
      <Route path="/spartan-progress" element={
        <ProtectedRoute>
          <SpartanProgress />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
