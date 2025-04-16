
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { QuizResult } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface StrategyAnalysisProps {
  results: QuizResult[];
}

const StrategyAnalysis = ({ results }: StrategyAnalysisProps) => {
  const { t } = useTranslation();

  const strategyData = useMemo(() => {
    if (results.length === 0) return { data: [], quadrants: [] };
    
    // Extract all questions with time and confidence data
    const questionData: {
      confidence: number;
      time: number;
      correct: boolean;
      index: number;
    }[] = [];
    
    results.forEach(result => {
      result.answers.forEach((answer, index) => {
        if (answer.confidenceLevel && answer.timeSpent !== undefined) {
          // Convert confidence level to numeric value
          let confidenceValue = 0;
          if (answer.confidenceLevel === 'certainty') confidenceValue = 100;
          else if (answer.confidenceLevel === 'doubt') confidenceValue = 50;
          
          questionData.push({
            confidence: confidenceValue,
            time: answer.timeSpent / 1000, // Convert to seconds
            correct: answer.isCorrect || false,
            index
          });
        }
      });
    });
    
    // Calculate median time
    const times = questionData.map(q => q.time).sort((a, b) => a - b);
    const medianTime = times.length > 0 
      ? times[Math.floor(times.length / 2)]
      : 0;
    
    // Calculate quadrant descriptions
    const quadrants = [
      { x: 25, y: 25, label: t('skills.slowLowConfidence'), description: t('skills.quadrant1Desc') },
      { x: 75, y: 25, label: t('skills.fastLowConfidence'), description: t('skills.quadrant2Desc') },
      { x: 25, y: 75, label: t('skills.slowHighConfidence'), description: t('skills.quadrant3Desc') },
      { x: 75, y: 75, label: t('skills.fastHighConfidence'), description: t('skills.quadrant4Desc') }
    ];
    
    return { 
      data: questionData,
      medianTime,
      quadrants
    };
  }, [results, t]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.strategyMatrix')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="confidence" 
              name={t('skills.confidence')} 
              domain={[0, 100]} 
              label={{ value: t('skills.confidence'), position: 'bottom' }} 
            />
            <YAxis 
              type="number" 
              dataKey="time" 
              name={t('skills.timeSpent')} 
              label={{ value: t('skills.timeSpentSeconds'), angle: -90, position: 'left' }} 
            />
            <ZAxis range={[60, 400]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number | string, name: string) => {
                if (name === 'confidence') return [`${value}%`, t('skills.confidence')];
                if (name === 'time') {
                  // Handle value type safely
                  const numValue = typeof value === 'number' ? value : parseFloat(value);
                  return [`${isNaN(numValue) ? value : numValue.toFixed(1)}s`, t('skills.timeSpent')];
                }
                return [value, name];
              }}
            />
            <Legend />
            
            {/* Quadrant divider lines */}
            <line x1={50} y1={0} x2={50} y2={strategyData.medianTime * 2} stroke="#ccc" strokeWidth={1} />
            <line x1={0} y1={strategyData.medianTime} x2={100} y2={strategyData.medianTime} stroke="#ccc" strokeWidth={1} />
            
            {/* Scatter plot */}
            <Scatter 
              name={t('skills.correctAnswers')} 
              data={strategyData.data.filter(q => q.correct)} 
              fill="#00C49F" 
            />
            <Scatter 
              name={t('skills.incorrectAnswers')} 
              data={strategyData.data.filter(q => !q.correct)} 
              fill="#FF8042" 
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Quadrant explanations */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {strategyData.quadrants.map((q, i) => (
          <div key={i} className="p-2 border rounded">
            <h4 className="font-bold">{q.label}</h4>
            <p>{q.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(StrategyAnalysis);
