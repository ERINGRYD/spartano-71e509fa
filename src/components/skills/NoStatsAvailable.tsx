
import React from "react";
import { Cpu, Target, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";

interface NoStatsAvailableProps {
  isLoading?: boolean;
}

const NoStatsAvailable: React.FC<NoStatsAvailableProps> = ({ isLoading = false }) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const location = useLocation();
  
  // Check if we're on the battle simulations page
  const isBattleSimulations = location.pathname === '/battle-simulations';
  
  const Icon = isBattleSimulations ? Shield : Cpu;
  const title = isBattleSimulations 
    ? (t("skills.noSimulationsYet") || "Nenhum simulado encontrado") 
    : (t("skills.noStats") || "Nenhuma estatística disponível");
  const description = isBattleSimulations
    ? (t("skills.completeSimulation") || "Complete um simulado (10+ questões) para ver suas métricas de desempenho.")
    : (t("skills.completeToSee") || "Complete alguns exercícios para ver suas estatísticas.");
  
  return (
    <div 
      className={`bg-white p-6 md:p-8 rounded-lg shadow text-center transition-all duration-300 animate-fade-in ${isLoading ? 'opacity-75' : ''}`}
      role="region" 
      aria-label={title}
    >
      <Icon 
        className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400 mx-auto mb-4 transition-transform duration-300 ${isLoading ? 'animate-pulse' : 'hover:scale-110'}`} 
        aria-hidden="true"
      />
      <h2 
        className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2 transition-colors duration-300`} 
        tabIndex={0}
      >
        {title}
      </h2>
      <p className="text-gray-600 text-sm md:text-base transition-opacity duration-300" tabIndex={0}>
        {description}
      </p>
    </div>
  );
};

export default React.memo(NoStatsAvailable);
