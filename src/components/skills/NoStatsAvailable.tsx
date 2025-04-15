
import React from "react";
import { Cpu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/LanguageContext";

const NoStatsAvailable: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  
  return (
    <div 
      className="bg-white p-6 md:p-8 rounded-lg shadow text-center"
      role="region" 
      aria-label="No statistics available"
    >
      <Cpu 
        className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400 mx-auto mb-4`} 
        aria-hidden="true"
      />
      <h2 
        className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2`} 
        tabIndex={0}
      >
        {t("skills.noStats")}
      </h2>
      <p className="text-gray-600 text-sm md:text-base" tabIndex={0}>
        {t("skills.completeToSee")}
      </p>
    </div>
  );
};

export default React.memo(NoStatsAvailable);
