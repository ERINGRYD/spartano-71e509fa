
import React from "react";
import { Shield, Sword, Trophy, Crown, Medal, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { progressionLevels } from "@/utils/progressionSystem";

interface LevelProgressionDisplayProps {
  currentLevel: string;
}

const LevelProgressionDisplay: React.FC<LevelProgressionDisplayProps> = ({ currentLevel }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "sword": return <Sword className="h-6 w-6" />;
      case "shield": return <Shield className="h-6 w-6" />;
      case "target": return <Target className="h-6 w-6" />;
      case "trophy": return <Trophy className="h-6 w-6" />;
      case "medal": return <Medal className="h-6 w-6" />;
      case "crown": return <Crown className="h-6 w-6" />;
      default: return <Sword className="h-6 w-6" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Target className="w-5 h-5 mr-2 text-amber-500" />
          Níveis de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 h-full w-0.5 bg-amber-500/30"></div>
          
          {progressionLevels.map((level, index) => {
            const isCurrentLevel = level.id === currentLevel;
            const isPastLevel = progressionLevels.findIndex(l => l.id === currentLevel) > index;
            
            return (
              <div key={level.id} className="relative mb-6 ml-6 pl-6">
                <div className={`absolute left-0 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center 
                  ${isCurrentLevel ? 'bg-amber-500' : isPastLevel ? 'bg-amber-300' : 'bg-gray-300'}`}
                >
                  {getIcon(level.icon)}
                </div>
                
                <div className={`p-3 rounded-lg border 
                  ${isCurrentLevel ? 'border-amber-500 bg-amber-50' : 
                    isPastLevel ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${isCurrentLevel ? 'text-amber-800' : isPastLevel ? 'text-amber-700' : 'text-gray-700'}`}>
                      {level.name}
                    </h3>
                    <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {level.minXP} - {level.maxXP === Infinity ? "∞" : level.maxXP} XP
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressionDisplay;
