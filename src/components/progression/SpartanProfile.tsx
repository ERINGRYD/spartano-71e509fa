
import React from "react";
import { Shield, Sword, Shirt, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressionLevel } from "@/utils/progressionSystem";
import { Badge } from "@/components/ui/badge";

interface SpartanProfileProps {
  level: ProgressionLevel;
  xp: number;
  progressToNext: number;
  nextLevel?: ProgressionLevel | null;
}

const SpartanProfile: React.FC<SpartanProfileProps> = ({ 
  level, 
  xp, 
  progressToNext, 
  nextLevel 
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-700 to-red-900 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white/10 p-4 rounded-full mr-4">
            {level.id === "king" ? (
              <Crown className="h-8 w-8 text-amber-300" />
            ) : (
              <Sword className="h-8 w-8 text-amber-300" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{level.name}</h1>
            <p className="text-amber-200">{level.description}</p>
            <Badge variant="outline" className="bg-amber-900/40 border-amber-500 text-amber-300 mt-2">
              {xp} XP Total
            </Badge>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          {nextLevel && (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span>Nível Atual: {level.name}</span>
                <span>Próximo: {nextLevel.name}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full" 
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-amber-300 mt-1 text-right">
                {xp} / {nextLevel.minXP} XP ({Math.round(progressToNext)}%)
              </p>
            </>
          )}
          {!nextLevel && (
            <div className="text-center p-2 bg-amber-600/20 rounded-lg border border-amber-500/30">
              <Crown className="inline-block h-5 w-5 text-amber-300 mr-1" />
              <span>Nível Máximo Alcançado!</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-amber-950/40 border-amber-800 text-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shirt className="w-5 h-5 mr-2 text-amber-400" />
              <span>Equipamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-semibold text-amber-400 mr-2">Armadura:</span>
                <span>{level.equipment.armor}</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-amber-400 mr-2">Arma:</span>
                <span>{level.equipment.weapon}</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-amber-400 mr-2">Escudo:</span>
                <span>{level.equipment.shield}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-950/40 border-amber-800 text-amber-100 col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-400" />
              <span>Habilidades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {level.abilities.map((ability, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-amber-500 mr-2">•</span>
                  {ability}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpartanProfile;
