
import React from "react";
import { Trophy, Target, Check, CheckCheck } from "lucide-react";
import StatsCard from "./StatsCard";
import { useTranslation } from "@/contexts/LanguageContext";
import { useCharacter } from "@/hooks/useCharacter";

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
  const { t } = useTranslation();
  const { attributes } = useCharacter();
  
  return (
    <div>
      {/* Spartan Attributes */}
      <div className="p-4 mb-6 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          {t('spartan.attributes') || 'Atributos do Guerreiro'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {attributes && Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="bg-red-800 bg-opacity-50 rounded-lg p-3">
              <h3 className="text-sm font-bold mb-1 capitalize">{t(`attributes.${key}.name`) || key}</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-yellow-500" 
                  style={{ width: `${value}%` }}
                />
              </div>
              <div className="mt-1 text-xs font-bold">{value}/100</div>
              <p className="text-xs mt-1 text-gray-300">{t(`attributes.${key}.shortDesc`) || ''}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Original Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('conquests.defeatedEnemies') || "Inimigos Derrotados"}
          icon={<Trophy className="w-5 h-5 mr-2 text-yellow-500" />}
          value={stats.defeatedEnemies}
          description={`${t('conquests.of') || 'de'} ${stats.totalEnemies} ${t('conquests.enemies') || 'inimigos'}`}
          progress={stats.totalEnemies > 0 ? (stats.defeatedEnemies / stats.totalEnemies) * 100 : 0}
          colorClass="bg-yellow-500"
        />

        <StatsCard
          title={t('conquests.combatAccuracy') || "Precisão de Combate"}
          icon={<Target className="w-5 h-5 mr-2 text-red-500" />}
          value={`${stats.averageAccuracy.toFixed(1)}%`}
          description={`${stats.correctAnswers} ${t('conquests.hits') || 'acertos'} ${t('conquests.in') || 'em'} ${stats.totalQuestions} ${t('conquests.questions') || 'questões'}`}
          progress={stats.averageAccuracy}
          colorClass="bg-red-500"
        />

        <StatsCard
          title={t('conquests.confidenceLevel') || "Nível de Confiança"}
          icon={<Check className="w-5 h-5 mr-2 text-green-500" />}
          value={`${stats.averageConfidence.toFixed(1)}%`}
          description={t('conquests.avgCorrectAnswers') || "média nas respostas corretas"}
          progress={stats.averageConfidence}
          colorClass="bg-green-500"
        />

        <StatsCard
          title={t('conquests.completedReviews') || "Revisões Completas"}
          icon={<CheckCheck className="w-5 h-5 mr-2 text-blue-500" />}
          value={`${stats.totalReviews > 0 
            ? Math.round((stats.completedReviews / stats.totalReviews) * 100) 
            : 0}%`}
          description={`${stats.completedReviews} ${t('conquests.of') || 'de'} ${stats.totalReviews} ${t('conquests.reviews') || 'revisões'}`}
          progress={stats.totalReviews > 0 ? (stats.completedReviews / stats.totalReviews) * 100 : 0}
          colorClass="bg-blue-500"
        />
      </div>
    </div>
  );
};

export default StatsSection;
