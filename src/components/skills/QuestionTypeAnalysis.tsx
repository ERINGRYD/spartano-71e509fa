
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QuizResult, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface QuestionTypeAnalysisProps {
  results: QuizResult[];
  questions: Question[];
}

const QuestionTypeAnalysis = ({ results, questions }: QuestionTypeAnalysisProps) => {
  const { t } = useTranslation();

  const analysisData = useMemo(() => {
    // Initialize counters
    const typeCounts = {
      multiple_choice: { total: 0, correct: 0 },
      true_false: { total: 0, correct: 0 }
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
          const type = question.type;
          if (typeCounts[type]) {
            typeCounts[type].total += 1;
            if (answer.isCorrect) {
              typeCounts[type].correct += 1;
            }
          }
        }
      });
    });

    // Format data for chart
    return [
      {
        name: t('skills.multipleChoice'),
        total: typeCounts.multiple_choice.total,
        correct: typeCounts.multiple_choice.correct,
        accuracy: typeCounts.multiple_choice.total > 0
          ? Math.round((typeCounts.multiple_choice.correct / typeCounts.multiple_choice.total) * 100)
          : 0
      },
      {
        name: t('skills.trueOrFalse'),
        total: typeCounts.true_false.total,
        correct: typeCounts.true_false.correct,
        accuracy: typeCounts.true_false.total > 0
          ? Math.round((typeCounts.true_false.correct / typeCounts.true_false.total) * 100)
          : 0
      }
    ];
  }, [results, questions, t]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.questionTypeAccuracy')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analysisData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip formatter={(value, name) => {
              if (name === 'accuracy') return [`${value}%`, t('skills.accuracy')];
              return [value, name === 'correct' ? t('skills.correct') : t('skills.total')];
            }} />
            <Legend />
            <Bar yAxisId="left" dataKey="total" name={t('skills.totalQuestions')} fill="#8884d8" />
            <Bar yAxisId="left" dataKey="correct" name={t('skills.correctAnswers')} fill="#82ca9d" />
            <Bar yAxisId="right" dataKey="accuracy" name={t('skills.accuracy')} fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(QuestionTypeAnalysis);
