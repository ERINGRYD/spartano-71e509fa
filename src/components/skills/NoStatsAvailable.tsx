
import React from "react";
import { Cpu } from "lucide-react";

const NoStatsAvailable: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow text-center">
      <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Nenhuma estatística disponível</h2>
      <p className="text-gray-600">
        Complete batalhas e revisões para visualizar suas skills e progressos!
      </p>
    </div>
  );
};

export default NoStatsAvailable;
