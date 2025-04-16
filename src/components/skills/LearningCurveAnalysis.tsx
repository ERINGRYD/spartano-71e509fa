
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QuizResult, Enemy } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface LearningCurveAnalysisProps {
  results: QuizResult[];
  enemies: Enemy[];
}

const LearningCurveAnalysis = ({ results, enemies }: LearningCurveAnalysisProps) => {
  const { t } = useTranslation();

  const progressData = useMemo(() => {
    if (results.length === 0) return [];
    
    // Sort results by date
    const sortedResults = [...results].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Create rolling accuracy data
    const rollingWindow = 5; // Consider 5 quizzes for rolling average
    const data = [];
    let cumulativeCorrect = 0;
    let cumulativeTotal = 0;
    
    for (let i = 0; i < sortedResults.length; i++) {
      const result = sortedResults[i];
      const enemy = enemies.find(e => e.id === result.enemyId);
      const enemyName = enemy ? enemy.name.split(':')[0].trim() : "Unknown";
      
      cumulativeCorrect += result.correctAnswers;
      cumulativeTotal += result.totalQuestions;
      
      // Calculate rolling average accuracy if we have enough data
      let rollingAccuracy = null;
      if (i >= rollingWindow - 1) {
        let windowCorrect = 0;
        let windowTotal = 0;
        for (let j = i; j > i - rollingWindow; j--) {
          windowCorrect += sortedResults[j].correctAnswers;
          windowTotal += sortedResults[j].totalQuestions;
        }
        rollingAccuracy = windowTotal > 0 ? (windowCorrect / windowTotal) * 100 : 0;
      }
      
      const date = new Date(result.date).toLocaleDateString();
      data.push({
        name: date,
        quizNumber: i + 1,
        accuracy: Math.round((result.correctAnswers / result.totalQuestions) * 100),
        cumulativeAccuracy: Math.round((cumulativeCorrect / cumulativeTotal) * 100),
        rollingAccuracy: rollingAccuracy !== null ? Math.round(rollingAccuracy) : null,
        topic: enemyName
      });
    }
    
    return data;
  }, [results, enemies]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.learningCurve')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={progressData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quizNumber" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value, name) => {
              if (name === 'accuracy' || name === 'cumulativeAccuracy' || name === 'rollingAccuracy') {
                return [`${value}%`, name === 'accuracy' 
                  ? t('skills.quizAccuracy')
                  : (name === 'cumulativeAccuracy' 
                    ? t('skills.cumulativeAccuracy') 
                    : t('skills.rollingAverage'))];
              }
              return [value, name];
            }} labelFormatter={(label) => `Quiz ${label}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              name={t('skills.quizAccuracy')} 
              stroke="#ff7300" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeAccuracy" 
              name={t('skills.cumulativeAccuracy')} 
              stroke="#82ca9d" 
              dot={false}
            />
            {progressData.length >= 5 && (
              <Line 
                type="monotone" 
                dataKey="rollingAccuracy" 
                name={t('skills.rollingAverage')} 
                stroke="#8884d8" 
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>{t('skills.learningCurveExplanation')}</p>
      </div>
    </div>
  );
};

export default React.memo(LearningCurveAnalysis);
