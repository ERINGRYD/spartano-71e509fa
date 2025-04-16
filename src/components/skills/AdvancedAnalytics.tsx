
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizResult, Question, Enemy } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import QuestionTypeAnalysis from './QuestionTypeAnalysis';
import DifficultyAnalysis from './DifficultyAnalysis';
import TimeAnalysis from './TimeAnalysis';
import ErrorPatternAnalysis from './ErrorPatternAnalysis';
import LearningCurveAnalysis from './LearningCurveAnalysis';
import StrategyAnalysis from './StrategyAnalysis';

interface AdvancedAnalyticsProps {
  results: QuizResult[];
  questions: Question[];
  enemies: Enemy[];
  isLoading: boolean;
}

const AdvancedAnalytics = ({ results, questions, enemies, isLoading }: AdvancedAnalyticsProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h2 className="text-xl font-bold mb-6">{t('skills.advancedAnalytics')}</h2>
      
      <Tabs defaultValue="questionTypes" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="questionTypes">{t('skills.questionTypes')}</TabsTrigger>
          <TabsTrigger value="difficulty">{t('skills.difficulty')}</TabsTrigger>
          <TabsTrigger value="time">{t('skills.timeAnalysis')}</TabsTrigger>
          <TabsTrigger value="errors">{t('skills.errorPatterns')}</TabsTrigger>
          <TabsTrigger value="progress">{t('skills.progress')}</TabsTrigger>
          <TabsTrigger value="strategy">{t('skills.strategy')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questionTypes" className="animate-fade-in">
          <QuestionTypeAnalysis results={results} questions={questions} />
        </TabsContent>
        
        <TabsContent value="difficulty" className="animate-fade-in">
          <DifficultyAnalysis results={results} questions={questions} />
        </TabsContent>
        
        <TabsContent value="time" className="animate-fade-in">
          <TimeAnalysis results={results} />
        </TabsContent>
        
        <TabsContent value="errors" className="animate-fade-in">
          <ErrorPatternAnalysis results={results} enemies={enemies} />
        </TabsContent>
        
        <TabsContent value="progress" className="animate-fade-in">
          <LearningCurveAnalysis results={results} enemies={enemies} />
        </TabsContent>
        
        <TabsContent value="strategy" className="animate-fade-in">
          <StrategyAnalysis results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default React.memo(AdvancedAnalytics);
