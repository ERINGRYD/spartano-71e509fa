
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QuizResult, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface DifficultyAnalysisProps {
  results: QuizResult[];
  questions: Question[];
}

const DifficultyAnalysis = ({ results, questions }: DifficultyAnalysisProps) => {
  const { t } = useTranslation();

  const difficultyData = useMemo(() => {
    // Initialize counters for each difficulty
    const difficultyCounts = {
      easy: { total: 0, correct: 0, avgTime: 0 },
      medium: { total: 0, correct: 0, avgTime: 0 },
      hard: { total: 0, correct: 0, avgTime: 0 }
    };

    // Map questions by ID for quick lookup
    const questionsMap = questions.reduce((map, question) => {
      map.set(question.id, question);
      return map;
    }, new Map<string, Question>());

    // Process all answers from results
    results.forEach(result => {
      result.answers.forEach(answer => {
        const question = questionsMap.get(answer.questionId);
        if (question) {
          const difficulty = question.difficulty;
          if (difficultyCounts[difficulty]) {
            difficultyCounts[difficulty].total += 1;
            if (answer.isCorrect) {
              difficultyCounts[difficulty].correct += 1;
            }
            if (answer.timeSpent) {
              difficultyCounts[difficulty].avgTime += answer.timeSpent;
            }
          }
        }
      });
    });

    // Calculate averages and format data for chart
    return Object.entries(difficultyCounts).map(([key, data]) => {
      const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      const avgTimeInSeconds = data.total > 0 ? data.avgTime / data.total / 1000 : 0;
      
      return {
        name: t(`skills.${key}`),
        total: data.total,
        correct: data.correct,
        accuracy: Math.round(accuracy),
        avgTime: Math.round(avgTimeInSeconds)
      };
    });
  }, [results, questions, t]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.difficultyAnalysis')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={difficultyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip formatter={(value, name) => {
              if (name === 'accuracy') return [`${value}%`, t('skills.accuracy')];
              if (name === 'avgTime') return [`${value}s`, t('skills.avgTime')];
              return [value, name === 'correct' ? t('skills.correct') : t('skills.total')];
            }} />
            <Legend />
            <Bar yAxisId="left" dataKey="total" name={t('skills.totalQuestions')} fill="#8884d8" />
            <Bar yAxisId="left" dataKey="correct" name={t('skills.correctAnswers')} fill="#82ca9d" />
            <Bar yAxisId="right" dataKey="accuracy" name={t('skills.accuracy')} fill="#ff7300" />
            <Bar yAxisId="left" dataKey="avgTime" name={t('skills.avgTime')} fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(DifficultyAnalysis);
