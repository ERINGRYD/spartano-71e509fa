
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Flag, Castle, Compass, Mountain, Tent, Skull } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BattleLocation {
  name: string;
  description: string;
  icon: React.ReactNode;
  reached: boolean;
  type: 'city' | 'battlefield' | 'landmark';
  progress?: number;
}

interface BattleProgressProps {
  masteredSubjects: number;
  totalSubjects: number;
  completedSimulations: number;
  daysToExam?: number;
  className?: string;
}

const BattleProgressIndicator: React.FC<BattleProgressProps> = ({ 
  masteredSubjects, 
  totalSubjects, 
  completedSimulations,
  daysToExam,
  className 
}) => {
  // Calculate overall progress towards Thermopylae (0-100%)
  const overallProgress = Math.min(100, Math.round((masteredSubjects / Math.max(1, totalSubjects)) * 70 + (completedSimulations / 10) * 30));
  
  // Define battle locations on the path to Thermopylae
  const battleLocations: BattleLocation[] = [
    {
      name: "Esparta",
      description: "Início da jornada",
      icon: <Castle className="w-5 h-5 text-amber-700" />,
      type: 'city',
      reached: true
    },
    {
      name: "Planícies de Treino",
      description: `${completedSimulations} simulados realizados`,
      icon: <Tent className="w-5 h-5 text-amber-700" />,
      type: 'battlefield',
      reached: completedSimulations >= 1,
      progress: completedSimulations > 0 ? Math.min(100, completedSimulations * 10) : 0
    },
    {
      name: "Corinto",
      description: "25% do caminho",
      icon: <Flag className="w-5 h-5 text-amber-700" />,
      type: 'city',
      reached: overallProgress >= 25
    },
    {
      name: "Campo de Batalha",
      description: `${masteredSubjects} de ${totalSubjects} disciplinas dominadas`,
      icon: <Skull className="w-5 h-5 text-amber-700" />,
      type: 'battlefield',
      reached: masteredSubjects >= 1,
      progress: totalSubjects > 0 ? (masteredSubjects / totalSubjects) * 100 : 0
    },
    {
      name: "Atenas",
      description: "50% do caminho",
      icon: <Castle className="w-5 h-5 text-amber-700" />,
      type: 'city',
      reached: overallProgress >= 50
    },
    {
      name: "Monte Parnaso",
      description: "75% do caminho",
      icon: <Mountain className="w-5 h-5 text-amber-700" />,
      type: 'landmark',
      reached: overallProgress >= 75
    },
    {
      name: "Termópilas",
      description: "Batalha final",
      icon: <Flag className="w-5 h-5 text-red-700" />,
      type: 'battlefield',
      reached: overallProgress >= 100
    }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-amber-500" />
          Mapa de Termópilas
          {daysToExam && (
            <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-700 border-amber-200">
              {daysToExam} dias para a batalha
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-amber-500 to-red-600 h-2.5 rounded-full" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Esparta</span>
            <span>Termópilas ({overallProgress}%)</span>
          </div>
        </div>

        {/* Battle Locations */}
        <div className="relative">
          <div className="absolute top-5 left-5 w-[calc(100%-40px)] h-1 bg-gray-200 z-0"></div>
          <div className="grid grid-cols-7 gap-1 relative z-10">
            {battleLocations.map((location, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${location.reached 
                    ? location.type === 'battlefield' 
                      ? 'bg-gradient-to-r from-red-500 to-red-700' 
                      : location.type === 'landmark'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                        : 'bg-gradient-to-r from-amber-500 to-amber-700'
                    : 'bg-gray-300'
                  } mb-2`}
                >
                  <div className="text-white">{location.icon}</div>
                </div>
                <h4 className="text-center font-medium text-xs">{location.name}</h4>
                <p className="text-center text-xs text-gray-500 mt-0.5 hidden md:block">{location.description}</p>
                
                {location.progress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1 max-w-[40px]">
                    <div 
                      className="bg-amber-500 h-1 rounded-full" 
                      style={{ width: `${location.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleProgressIndicator;
