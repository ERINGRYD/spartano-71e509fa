
import React from "react";
import { Cpu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const NoStatsAvailable: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow text-center">
      <Cpu className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400 mx-auto mb-4`} />
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2`}>
        Nenhuma estatística disponível
      </h2>
      <p className="text-gray-600 text-sm md:text-base">
        Complete batalhas e revisões para visualizar suas skills e progressos!
      </p>
    </div>
  );
};

export default React.memo(NoStatsAvailable);
