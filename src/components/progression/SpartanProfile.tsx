
import React from "react";
import { Shield, Sword, Shirt, Crown, Award, Target, BookOpen, Star } from "lucide-react";
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

  // Helper para estilizar a exibição de nível com base no progresso
  const getLevelIndicatorStyle = (levelId: string, currentLevelId: string) => {
    const levelOrder = ["apprentice", "soldier", "hoplite", "elite", "commander", "king"];
    const currentIndex = levelOrder.indexOf(currentLevelId);
    const levelIndex = levelOrder.indexOf(levelId);
    
    // Nível atual
    if (levelId === currentLevelId) {
      return {
        indicator: "w-12 h-12 border-4 border-amber-400 bg-gradient-to-r from-amber-500 to-red-600",
        icon: "text-white",
        pulse: true
      };
    }
    // Níveis já alcançados
    else if (levelIndex < currentIndex) {
      return {
        indicator: "w-10 h-10 bg-amber-500",
        icon: "text-white",
        pulse: false
      };
    }
    // Níveis futuros
    else {
      return {
        indicator: "w-10 h-10 bg-gray-300",
        icon: "text-gray-500",
        pulse: false
      };
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-700 to-red-900 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
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
                className="h-2.5 bg-white/10" 
                indicatorClassName="bg-gradient-to-r from-amber-500 to-red-500" 
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

      {/* Visualização detalhada da jornada do guerreiro */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Jornada do Guerreiro</h3>
        
        {/* Timeline avançada com estágios de progressão */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-900/50 -translate-y-1/2 rounded-full"></div>
          
          <div className="grid grid-cols-6 relative">
            {["apprentice", "soldier", "hoplite", "elite", "commander", "king"].map((levelId, index) => {
              const style = getLevelIndicatorStyle(levelId, level.id);
              
              return (
                <div key={levelId} className="flex flex-col items-center">
                  <div className={`${style.indicator} rounded-full mb-2 flex items-center justify-center relative z-10`}>
                    {style.pulse && (
                      <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30"></div>
                    )}
                    {levelId === "apprentice" && <BookOpen className={`h-5 w-5 ${style.icon}`} />}
                    {levelId === "soldier" && <Sword className={`h-5 w-5 ${style.icon}`} />}
                    {levelId === "hoplite" && <Shield className={`h-5 w-5 ${style.icon}`} />}
                    {levelId === "elite" && <Target className={`h-5 w-5 ${style.icon}`} />}
                    {levelId === "commander" && <Award className={`h-5 w-5 ${style.icon}`} />}
                    {levelId === "king" && <Crown className={`h-5 w-5 ${style.icon}`} />}
                  </div>
                  
                  <h4 className="font-medium text-sm">
                    {levelId === "apprentice" ? "Aprendiz" : 
                     levelId === "soldier" ? "Soldado" : 
                     levelId === "hoplite" ? "Hoplita" : 
                     levelId === "elite" ? "Elite" : 
                     levelId === "commander" ? "Comandante" : "Rei"}
                  </h4>
                  
                  <div className="text-xs text-amber-300/80 text-center mt-1">
                    {levelId === "apprentice" ? "0 XP" : 
                     levelId === "soldier" ? "101 XP" : 
                     levelId === "hoplite" ? "301 XP" : 
                     levelId === "elite" ? "601 XP" : 
                     levelId === "commander" ? "1001 XP" : "1501+ XP"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Informações detalhadas do nível atual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="bg-amber-950/40 border-amber-800 text-amber-100 md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shirt className="w-5 h-5 mr-2 text-amber-400" />
              <span>Equipamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                  <Shirt className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-semibold text-amber-400">Armadura:</span>
                  <p className="text-amber-200">{level.equipment.armor}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                  <Sword className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-semibold text-amber-400">Arma:</span>
                  <p className="text-amber-200">{level.equipment.weapon}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-semibold text-amber-400">Escudo:</span>
                  <p className="text-amber-200">{level.equipment.shield}</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-950/40 border-amber-800 text-amber-100 md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-400" />
              <span>Habilidades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {level.abilities.map((ability, index) => (
                <li key={index} className="flex items-center bg-amber-900/30 rounded-lg p-3">
                  <Star className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
                  <span className="text-amber-200">{ability}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Nova seção: Status de Guerreiro */}
        <Card className="bg-amber-950/40 border-amber-800 text-amber-100 md:col-span-12">
          <CardHeader className="pb-2 border-b border-amber-800/50">
            <CardTitle className="text-lg font-medium flex items-center">
              <Award className="w-5 h-5 mr-2 text-amber-400" />
              <span>Status de Guerreiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-amber-800/50">
              <div className="p-4 md:w-1/4">
                <h4 className="font-medium text-amber-300 text-sm uppercase tracking-wide mb-2">Força</h4>
                <div className="flex items-center">
                  <div className="w-full mr-3">
                    <Progress 
                      value={60 + level.id === "apprentice" ? 0 : 
                              level.id === "soldier" ? 10 : 
                              level.id === "hoplite" ? 20 : 
                              level.id === "elite" ? 30 : 
                              level.id === "commander" ? 35 : 40} 
                      className="h-2.5 bg-amber-900/50" 
                      indicatorClassName="bg-red-500" 
                    />
                  </div>
                  <span className="text-sm">
                    {60 + (level.id === "apprentice" ? 0 : 
                           level.id === "soldier" ? 10 : 
                           level.id === "hoplite" ? 20 : 
                           level.id === "elite" ? 30 : 
                           level.id === "commander" ? 35 : 40)}
                  </span>
                </div>
              </div>
              
              <div className="p-4 md:w-1/4">
                <h4 className="font-medium text-amber-300 text-sm uppercase tracking-wide mb-2">Defesa</h4>
                <div className="flex items-center">
                  <div className="w-full mr-3">
                    <Progress 
                      value={40 + (level.id === "apprentice" ? 0 : 
                              level.id === "soldier" ? 15 : 
                              level.id === "hoplite" ? 25 : 
                              level.id === "elite" ? 35 : 
                              level.id === "commander" ? 45 : 55)} 
                      className="h-2.5 bg-amber-900/50" 
                      indicatorClassName="bg-amber-500" 
                    />
                  </div>
                  <span className="text-sm">
                    {40 + (level.id === "apprentice" ? 0 : 
                           level.id === "soldier" ? 15 : 
                           level.id === "hoplite" ? 25 : 
                           level.id === "elite" ? 35 : 
                           level.id === "commander" ? 45 : 55)}
                  </span>
                </div>
              </div>
              
              <div className="p-4 md:w-1/4">
                <h4 className="font-medium text-amber-300 text-sm uppercase tracking-wide mb-2">Estratégia</h4>
                <div className="flex items-center">
                  <div className="w-full mr-3">
                    <Progress 
                      value={50 + (level.id === "apprentice" ? 0 : 
                             level.id === "soldier" ? 5 : 
                             level.id === "hoplite" ? 15 : 
                             level.id === "elite" ? 25 : 
                             level.id === "commander" ? 40 : 50)} 
                      className="h-2.5 bg-amber-900/50" 
                      indicatorClassName="bg-blue-500" 
                    />
                  </div>
                  <span className="text-sm">
                    {50 + (level.id === "apprentice" ? 0 : 
                          level.id === "soldier" ? 5 : 
                          level.id === "hoplite" ? 15 : 
                          level.id === "elite" ? 25 : 
                          level.id === "commander" ? 40 : 50)}
                  </span>
                </div>
              </div>
              
              <div className="p-4 md:w-1/4">
                <h4 className="font-medium text-amber-300 text-sm uppercase tracking-wide mb-2">Liderança</h4>
                <div className="flex items-center">
                  <div className="w-full mr-3">
                    <Progress 
                      value={30 + (level.id === "apprentice" ? 0 : 
                             level.id === "soldier" ? 10 : 
                             level.id === "hoplite" ? 20 : 
                             level.id === "elite" ? 35 : 
                             level.id === "commander" ? 55 : 70)} 
                      className="h-2.5 bg-amber-900/50" 
                      indicatorClassName="bg-purple-500" 
                    />
                  </div>
                  <span className="text-sm">
                    {30 + (level.id === "apprentice" ? 0 : 
                          level.id === "soldier" ? 10 : 
                          level.id === "hoplite" ? 20 : 
                          level.id === "elite" ? 35 : 
                          level.id === "commander" ? 55 : 70)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximo nível */}
        {nextLevel && (
          <Card className="bg-amber-950/40 border-amber-800 text-amber-100 col-span-1 md:col-span-12">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Target className="w-5 h-5 mr-2 text-amber-400" />
                <span>Próximo Nível: {nextLevel.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Descrição</h4>
                  <p className="text-sm text-amber-100">{nextLevel.description}</p>
                  <div className="mt-3">
                    <h4 className="font-medium text-amber-300 mb-1">XP Necessário</h4>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={progressToNext} 
                        className="h-2.5 flex-grow bg-amber-900/50" 
                        indicatorClassName="bg-gradient-to-r from-amber-500 to-red-500" 
                      />
                      <span className="text-sm">{Math.round(progressToNext)}%</span>
                    </div>
                    <p className="text-xs mt-1 text-amber-300/80">
                      Faltam {nextLevel.minXP - xp} XP para o próximo nível
                    </p>
                  </div>
                </div>
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Equipamento Desbloqueado</h4>
                  <ul className="text-sm space-y-3">
                    <li className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                        <Shirt className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-amber-400">Armadura:</span>
                        <p className="text-amber-200">{nextLevel.equipment.armor}</p>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                        <Sword className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-amber-400">Arma:</span>
                        <p className="text-amber-200">{nextLevel.equipment.weapon}</p>
                      </div>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center mr-3">
                        <Shield className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-amber-400">Escudo:</span>
                        <p className="text-amber-200">{nextLevel.equipment.shield}</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/3">
                  <h4 className="font-medium text-amber-300 mb-2">Novas Habilidades</h4>
                  <ul className="text-sm space-y-2">
                    {nextLevel.abilities.map((ability, index) => (
                      <li key={index} className="flex items-center bg-amber-900/30 rounded-lg p-3">
                        <Star className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
                        <span className="text-amber-200">{ability}</span>
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
