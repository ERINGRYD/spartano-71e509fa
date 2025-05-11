
import React from "react";
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
import BattleSimulations from "./pages/BattleSimulations";
import FullChallenge from "./pages/FullChallenge";
import Skills from "./pages/Skills";
import NotFound from "./pages/NotFound";
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

// Separating the routes to avoid React context issues
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
      <Route path="/battle-simulations" element={
        <ProtectedRoute>
          <BattleSimulations />
        </ProtectedRoute>
      } />
      <Route path="/full-challenge" element={
        <ProtectedRoute>
          <FullChallenge />
        </ProtectedRoute>
      } />
      <Route path="/skills" element={
        <ProtectedRoute>
          <Skills />
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
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
