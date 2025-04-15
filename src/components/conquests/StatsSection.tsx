
import React from "react";
import { Trophy, Target, Check, CheckCheck } from "lucide-react";
import StatsCard from "./StatsCard";

type StatsSectionProps = {
  stats: {
    totalEnemies: number;
    defeatedEnemies: number;
    totalQuestions: number;
    correctAnswers: number;
    observedEnemies: number;
    totalReviews: number;
    completedReviews: number;
    averageAccuracy: number;
    averageConfidence: number;
    studyDays: number;
    perfectDays: number;
    topicsWithHighConfidence: number;
    masteredSubjects: number;
    consecutiveDays: number;
    totalTopics: number;
    topicsCompleted: number;
    questionsPerDay: number;
  };
};

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Inimigos Derrotados"
        icon={<Trophy className="w-5 h-5 mr-2 text-yellow-500" />}
        value={stats.defeatedEnemies}
        description={`de ${stats.totalEnemies} inimigos`}
        progress={stats.totalEnemies > 0 ? (stats.defeatedEnemies / stats.totalEnemies) * 100 : 0}
        colorClass="bg-yellow-500"
      />

      <StatsCard
        title="Precisão de Combate"
        icon={<Target className="w-5 h-5 mr-2 text-red-500" />}
        value={`${stats.averageAccuracy.toFixed(1)}%`}
        description={`${stats.correctAnswers} acertos em ${stats.totalQuestions} questões`}
        progress={stats.averageAccuracy}
        colorClass="bg-red-500"
      />

      <StatsCard
        title="Nível de Confiança"
        icon={<Check className="w-5 h-5 mr-2 text-green-500" />}
        value={`${stats.averageConfidence.toFixed(1)}%`}
        description="média nas respostas corretas"
        progress={stats.averageConfidence}
        colorClass="bg-green-500"
      />

      <StatsCard
        title="Revisões Completas"
        icon={<CheckCheck className="w-5 h-5 mr-2 text-blue-500" />}
        value={`${stats.totalReviews > 0 
          ? Math.round((stats.completedReviews / stats.totalReviews) * 100) 
          : 0}%`}
        description={`${stats.completedReviews} de ${stats.totalReviews} revisões`}
        progress={stats.totalReviews > 0 ? (stats.completedReviews / stats.totalReviews) * 100 : 0}
        colorClass="bg-blue-500"
      />
    </div>
  );
};

export default StatsSection;
