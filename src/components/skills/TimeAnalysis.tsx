
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QuizResult } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface TimeAnalysisProps {
  results: QuizResult[];
}

const TimeAnalysis = ({ results }: TimeAnalysisProps) => {
  const { t } = useTranslation();

  const scatterData = useMemo(() => {
    const data: { timePerQuestion: number; accuracy: number; name: string; correct: number; total: number }[] = [];
    
    results.forEach(result => {
      if (result.totalQuestions > 0) {
        const avgTimePerQuestion = result.timeSpent / result.totalQuestions / 1000; // Convert to seconds
        const accuracy = (result.correctAnswers / result.totalQuestions) * 100;
        
        data.push({
          timePerQuestion: Math.round(avgTimePerQuestion),
          accuracy: Math.round(accuracy),
          name: `Quiz ${result.enemyId.slice(0, 4)}`,
          correct: result.correctAnswers,
          total: result.totalQuestions
        });
      }
    });
    
    return data;
  }, [results]);
  
  // Calculate optimal time range based on high accuracy results
  const optimalTimeRange = useMemo(() => {
    const highAccuracyResults = scatterData.filter(item => item.accuracy >= 70);
    if (highAccuracyResults.length === 0) return { min: 0, max: 120 };
    
    const times = highAccuracyResults.map(item => item.timePerQuestion);
    return {
      min: Math.max(0, Math.min(...times) - 10),
      max: Math.max(...times) + 10
    };
  }, [scatterData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.timeVsAccuracy')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="timePerQuestion" 
              name={t('skills.timePerQuestion')} 
              unit="s" 
              domain={['dataMin', 'dataMax']} 
              label={{ value: t('skills.timePerQuestionSeconds'), position: 'bottom', offset: 0 }} 
            />
            <YAxis 
              type="number" 
              dataKey="accuracy" 
              name={t('skills.accuracy')} 
              unit="%" 
              domain={[0, 100]} 
              label={{ value: t('skills.accuracy'), angle: -90, position: 'left' }} 
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => {
                if (name === 'timePerQuestion') return [`${value}s`, t('skills.timePerQuestion')];
                if (name === 'accuracy') return [`${value}%`, t('skills.accuracy')];
                return [value, name];
              }}
            />
            <Scatter name={t('skills.quizResults')} data={scatterData}>
              {scatterData.map((entry, index) => {
                // Color points based on accuracy
                let color = '#ff0000'; // Red for low accuracy
                if (entry.accuracy >= 80) color = '#00ff00'; // Green for high accuracy
                else if (entry.accuracy >= 60) color = '#ffff00'; // Yellow for medium accuracy
                
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Scatter>
            
            {/* Add a highlighted optimal time zone if there's enough data */}
            {scatterData.length > 2 && (
              <rect
                x={optimalTimeRange.min}
                width={optimalTimeRange.max - optimalTimeRange.min}
                y={0}
                height={100}
                fill="green"
                fillOpacity={0.1}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>{t('skills.timeAnalysisExplanation')}</p>
      </div>
    </div>
  );
};

export default React.memo(TimeAnalysis);
