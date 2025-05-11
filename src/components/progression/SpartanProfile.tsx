
import React from "react";
import { Shield, Sword, Shirt, Crown, Award, Target, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressionLevel } from "@/utils/progressionSystem";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  // Helper function to render the correct level icon
  const renderLevelIcon = (levelId: string) => {
    switch (levelId) {
      case "king":
        return <Crown className="h-8 w-8 text-amber-300" />;
      case "commander":
        return <Award className="h-8 w-8 text-amber-300" />;
      case "elite":
        return <Shield className="h-8 w-8 text-amber-300" />;
      case "hoplite":
        return <Target className="h-8 w-8 text-amber-300" />;
      case "soldier":
        return <Sword className="h-8 w-8 text-amber-300" />;
      default:
        return <BookOpen className="h-8 w-8 text-amber-300" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-700 to-red-900 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white/10 p-4 rounded-full mr-4">
            {renderLevelIcon(level.id)}
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
              <Progress 
                value={progressToNext} 
                className={cn("h-2.5 bg-white/10", "before:bg-gradient-to-r before:from-amber-500 before:to-red-500")} 
              />
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

      {/* Jornada completa do guerreiro */}
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Jornada do Guerreiro</h3>
        <div className="w-full bg-white/10 rounded-full h-2.5 mb-6">
          <div 
            className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full" 
            style={{ width: `${(xp / 1500) * 100}%` }}
          />
        </div>
        <div className="flex justify-between">
          {["apprentice", "soldier", "hoplite", "elite", "commander", "king"].map((levelId, index) => {
            const isCurrentOrPast = level.id === levelId || 
              ["apprentice", "soldier", "hoplite", "elite", "commander", "king"]
                .indexOf(level.id) >= 
              ["apprentice", "soldier", "hoplite", "elite", "commander", "king"]
                .indexOf(levelId);
            
            return (
              <div key={levelId} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrentOrPast ? 'bg-amber-500' : 'bg-white/20'}`}>
                  {isCurrentOrPast ? (
                    level.id === levelId ? (
                      <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-white" />
                    )
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                  )}
                </div>
                <span className={`text-xs mt-1 ${level.id === levelId ? 'text-white font-bold' : isCurrentOrPast ? 'text-amber-300' : 'text-amber-300/50'}`}>
                  {levelId === "apprentice" ? "Aprendiz" : 
                   levelId === "soldier" ? "Soldado" : 
                   levelId === "hoplite" ? "Hoplita" : 
                   levelId === "elite" ? "Elite" : 
                   levelId === "commander" ? "Comandante" : "Rei"}
                </span>
              </div>
            );
          })}
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

        {/* Nova seção: Próximo nível */}
        {nextLevel && (
          <Card className="bg-amber-950/40 border-amber-800 text-amber-100 col-span-1 md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-400" />
                <span>Próximo Nível: {nextLevel.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Descrição</h4>
                  <p className="text-sm">{nextLevel.description}</p>
                  <div className="mt-3">
                    <h4 className="font-medium text-amber-300 mb-1">XP Necessário</h4>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={progressToNext} 
                        className={cn("h-2.5 flex-grow bg-white/10", "before:bg-gradient-to-r before:from-amber-500 before:to-red-500")} 
                      />
                      <span className="text-sm">{Math.round(progressToNext)}%</span>
                    </div>
                    <p className="text-xs mt-1">
                      Faltam {nextLevel.minXP - xp} XP para o próximo nível
                    </p>
                  </div>
                </div>
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Equipamento Desbloqueado</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center">
                      <span className="text-amber-500 mr-2">•</span>
                      Armadura: {nextLevel.equipment.armor}
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-500 mr-2">•</span>
                      Arma: {nextLevel.equipment.weapon}
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-500 mr-2">•</span>
                      Escudo: {nextLevel.equipment.shield}
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Novas Habilidades</h4>
                  <ul className="text-sm space-y-1">
                    {nextLevel.abilities.map((ability, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-amber-500 mr-2">•</span>
                        {ability}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpartanProfile;
