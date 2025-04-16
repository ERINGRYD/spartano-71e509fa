
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QuizResult, Enemy } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface ErrorPatternAnalysisProps {
  results: QuizResult[];
  enemies: Enemy[];
}

const ErrorPatternAnalysis = ({ results, enemies }: ErrorPatternAnalysisProps) => {
  const { t } = useTranslation();

  const errorData = useMemo(() => {
    // Map to track errors by topic
    const topicErrors = new Map<string, { name: string, errors: number, total: number }>();
    
    // Process all results
    results.forEach(result => {
      const enemy = enemies.find(e => e.id === result.enemyId);
      if (!enemy) return;
      
      const topicId = enemy.topicId;
      let topicData = topicErrors.get(topicId);
      
      if (!topicData) {
        // Find a result that has this enemy to get the name
        const enemyName = enemy.name.split(':')[0].trim(); // Extract topic name from enemy name
        topicData = { name: enemyName, errors: 0, total: 0 };
        topicErrors.set(topicId, topicData);
      }
      
      // Update error count
      topicData.errors += (result.totalQuestions - result.correctAnswers);
      topicData.total += result.totalQuestions;
    });
    
    // Convert to array and sort by error count (for Pareto analysis)
    let errorArray = Array.from(topicErrors.values())
      .sort((a, b) => b.errors - a.errors);
    
    // Calculate percentages for Pareto analysis
    const totalErrors = errorArray.reduce((sum, item) => sum + item.errors, 0);
    let cumulativePercent = 0;
    
    return errorArray.map(item => {
      const percent = (item.errors / totalErrors) * 100;
      cumulativePercent += percent;
      
      return {
        name: item.name,
        errors: item.errors,
        errorRate: item.total > 0 ? Math.round((item.errors / item.total) * 100) : 0,
        cumulativePercent: Math.round(cumulativePercent)
      };
    });
  }, [results, enemies]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.errorPatterns')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={errorData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip formatter={(value, name) => {
              if (name === 'errorRate') return [`${value}%`, t('skills.errorRate')];
              if (name === 'cumulativePercent') return [`${value}%`, t('skills.cumulativePercent')];
              return [value, t('skills.errorCount')];
            }} />
            <Legend />
            <Bar yAxisId="left" dataKey="errors" name={t('skills.errors')} fill="#ff7300" />
            <Bar yAxisId="right" dataKey="errorRate" name={t('skills.errorRate')} fill="#ff0000" />
            <Bar yAxisId="right" dataKey="cumulativePercent" name={t('skills.cumulativePercent')} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>{t('skills.paretoExplanation')}</p>
      </div>
    </div>
  );
};

export default React.memo(ErrorPatternAnalysis);
