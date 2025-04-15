
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Crown, Rocket } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

type JourneyStatsProps = {
  stats: {
    topicsCompleted: number;
    totalTopics: number;
    topicsWithHighConfidence: number;
    masteredSubjects: number;
  };
  subjectsLength: number;
};

const JourneyStatsCards: React.FC<JourneyStatsProps> = ({ stats, subjectsLength }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
            Tópicos Dominados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.topicsCompleted}</div>
          <p className="text-sm text-gray-500">de {stats.totalTopics} tópicos</p>
          <ProgressBar 
            progress={stats.totalTopics > 0 ? (stats.topicsCompleted / stats.totalTopics) * 100 : 0}
            className="mt-2"
            colorClass="bg-blue-500"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Crown className="w-5 h-5 mr-2 text-amber-500" />
            Tópicos com Alta Confiança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.topicsWithHighConfidence}</div>
          <p className="text-sm text-gray-500">
            {Math.round(stats.totalTopics > 0 ? (stats.topicsWithHighConfidence / stats.totalTopics) * 100 : 0)}% do total
          </p>
          <ProgressBar 
            progress={stats.totalTopics > 0 ? (stats.topicsWithHighConfidence / stats.totalTopics) * 100 : 0}
            className="mt-2"
            colorClass="bg-amber-500"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-purple-500" />
            Matérias Dominadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.masteredSubjects}</div>
          <p className="text-sm text-gray-500">
            {subjectsLength > 0 ? Math.round((stats.masteredSubjects / subjectsLength) * 100) : 0}% do total
          </p>
          <ProgressBar 
            progress={subjectsLength > 0 ? (stats.masteredSubjects / subjectsLength) * 100 : 0}
            className="mt-2"
            colorClass="bg-purple-500"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneyStatsCards;
