
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Sword } from "lucide-react";

type AccuracyChartProps = {
  correctAnswers: number;
  totalQuestions: number;
};

const AccuracyChart: React.FC<AccuracyChartProps> = ({ correctAnswers, totalQuestions }) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  
  const data = useMemo(() => [
    { name: t('chart.correct'), value: correctAnswers },
    { name: t('chart.incorrect'), value: totalQuestions - correctAnswers }
  ], [correctAnswers, totalQuestions, t]);

  const chartHeight = isMobile ? 180 : 250;
  
  // Generate accessible description for screen readers
  const accessibleDescription = useMemo(() => {
    if (totalQuestions === 0) return t('skills.noData');
    
    const correctPercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const incorrectPercentage = 100 - correctPercentage;
    
    return `${t('chart.correct')}: ${correctAnswers} (${correctPercentage}%), ` + 
           `${t('chart.incorrect')}: ${totalQuestions - correctAnswers} (${incorrectPercentage}%)`;
  }, [correctAnswers, totalQuestions, t]);
  
  if (totalQuestions === 0) {
    return (
      <Alert 
        className="flex items-center justify-center h-36 sm:h-48 text-center text-gray-500"
        role="status"
        aria-live="polite"
      >
        <AlertDescription>{t('skills.noData')}</AlertDescription>
      </Alert>
    );
  }

  const accuracyPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Spartan battle outcome message based on accuracy
  const getBattleOutcome = () => {
    if (accuracyPercentage >= 90) return t('spartan.gloriousVictory');
    if (accuracyPercentage >= 70) return t('spartan.victory');
    if (accuracyPercentage >= 50) return t('spartan.hardFought');
    if (accuracyPercentage >= 30) return t('spartan.retreat');
    return t('spartan.defeat');
  };

  return (
    <div>
      {/* Hidden description for screen readers */}
      <div className="sr-only" aria-live="polite" tabIndex={0}>
        {accessibleDescription}
      </div>
      
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center mb-2">
          {accuracyPercentage >= 50 ? (
            <Shield className="h-6 w-6 mr-2 text-red-600" />
          ) : (
            <Sword className="h-6 w-6 mr-2 text-red-600" />
          )}
          <h3 className="text-lg font-bold text-red-700">{getBattleOutcome()}</h3>
        </div>
        <p className="text-sm text-gray-600">
          {t('spartan.battleResult', { correct: correctAnswers, total: totalQuestions })}
        </p>
      </div>
      
      <div
        role="img"
        aria-label={`${t('skills.performance')} - ${accessibleDescription}`}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 50 : 80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={!isMobile}
            >
              <Cell fill="#27AE60" />
              <Cell fill="#E74C3C" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Keyboard accessible data table */}
      <table className="sr-only">
        <caption>{t('skills.performance')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('chart.correct')}</th>
            <th scope="col">{t('chart.incorrect')}</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{correctAnswers}</td>
            <td>{totalQuestions - correctAnswers}</td>
            <td>{totalQuestions}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(AccuracyChart);

