
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const chartHeight = isMobile ? 200 : 250;
  
  // Generate accessible description for screen readers
  const accessibleDescription = useMemo(() => {
    if (totalQuestions === 0) return t('skills.notEnoughData');
    
    const correctPercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const incorrectPercentage = 100 - correctPercentage;
    
    return `${t('chart.correct')}: ${correctAnswers} (${correctPercentage}%), ` + 
           `${t('chart.incorrect')}: ${totalQuestions - correctAnswers} (${incorrectPercentage}%)`;
  }, [correctAnswers, totalQuestions, t]);
  
  if (totalQuestions === 0) {
    return (
      <Alert 
        className="flex items-center justify-center h-48 text-center text-gray-500"
        role="status"
        aria-live="polite"
      >
        <AlertDescription>{t('skills.notEnoughData')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {/* Hidden description for screen readers */}
      <div className="sr-only" aria-live="polite" tabIndex={0}>
        {accessibleDescription}
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
              outerRadius={isMobile ? 60 : 80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
