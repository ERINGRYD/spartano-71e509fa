
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";

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
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-warrior-primary">Nível {currentLevel}: {currentRank}</h3>
          <p className="text-gray-500 mt-1">
            {currentLevel < milestones.length ? 
              `Progresso para ${milestones[currentLevel]?.title}` : 
              "Nível máximo atingido!"}
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
          {currentLevel}
        </div>
      </div>
      
      {currentLevel < milestones.length && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <ProgressBar 
            progress={progressToNext}
            colorClass="bg-gradient-to-r from-purple-500 to-indigo-600"
          />
        </div>
      )}
      
      <div className="relative">
        <div className="absolute top-5 left-5 w-[calc(100%-40px)] h-1 bg-gray-200 z-0"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${milestone.achieved ? '' : 'opacity-60'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.achieved ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gray-300'
              } mb-2`}>
                <div className="text-white">{milestone.icon}</div>
              </div>
              <h4 className="text-center font-medium text-sm">{milestone.title}</h4>
              <p className="text-center text-xs text-gray-500 mt-1">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyTracker;
