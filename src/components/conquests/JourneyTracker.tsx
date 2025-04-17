
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";
import SpartanAvatar from "@/components/spartan/SpartanAvatar";
import { useCharacter } from "@/hooks/useCharacter";
import { useTranslation } from "@/contexts/LanguageContext";

type MilestoneType = {
  title: string;
  description: string;
  icon: React.ReactNode;
  required: number;
  achieved: boolean;
};

type JourneyTrackerProps = {
  currentLevel: number;
  currentRank: string;
  nextLevel: number;
  progressToNext: number;
  milestones: MilestoneType[];
};

const JourneyTracker: React.FC<JourneyTrackerProps> = ({
  currentLevel,
  currentRank,
  nextLevel,
  progressToNext,
  milestones
}) => {
  const { level, rankName, xp, nextLevelXp } = useCharacter();
  const { t } = useTranslation();
  
  // Use character data from hook if available, otherwise fall back to props
  const displayLevel = level || currentLevel;
  const displayRank = rankName || currentRank;
  const displayProgress = xp && nextLevelXp 
    ? (xp / nextLevelXp) * 100 
    : progressToNext;
  
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h3 className="text-xl font-bold text-yellow-500">
            {t('spartan.level', { level: displayLevel }) || `Nível ${displayLevel}: ${displayRank}`}
          </h3>
          <p className="text-gray-300 mt-1">
            {displayLevel < milestones.length ? 
              `${t('spartan.progressTo') || 'Progresso para'} ${milestones[displayLevel]?.title}` : 
              t('spartan.maxLevel') || "Nível máximo atingido!"}
          </p>
        </div>
        
        <SpartanAvatar size="lg" showAttributes />
      </div>
      
      {displayLevel < milestones.length && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span>{t('spartan.progress') || 'Progresso'}</span>
            <span>{Math.round(displayProgress)}%</span>
          </div>
          <ProgressBar 
            progress={displayProgress}
            colorClass="bg-gradient-to-r from-yellow-500 to-yellow-300"
          />
        </div>
      )}
      
      <div className="relative">
        <div className="absolute top-5 left-5 w-[calc(100%-40px)] h-1 bg-gray-700 z-0"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${milestone.achieved ? '' : 'opacity-60'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.achieved ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-gray-700'
              } mb-2`}>
                <div className="text-gray-900">{milestone.icon}</div>
              </div>
              <h4 className="text-center font-medium text-sm">{milestone.title}</h4>
              <p className="text-center text-xs text-gray-400 mt-1">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyTracker;
