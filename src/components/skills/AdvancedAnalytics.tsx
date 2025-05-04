
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
import { BookOpen, BarChart2, Clock, AlertCircle, TrendingUp, Compass } from 'lucide-react';

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
          <TabsTrigger value="questionTypes" className="flex items-center gap-1 px-3 py-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.questionTypes')}</span>
          </TabsTrigger>
          
          <TabsTrigger value="difficulty" className="flex items-center gap-1 px-3 py-1.5">
            <BarChart2 className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.difficulty')}</span>
          </TabsTrigger>
          
          <TabsTrigger value="time" className="flex items-center gap-1 px-3 py-1.5">
            <Clock className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.timeAnalysis')}</span>
          </TabsTrigger>
          
          <TabsTrigger value="errors" className="flex items-center gap-1 px-3 py-1.5">
            <AlertCircle className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.errorPatterns')}</span>
          </TabsTrigger>
          
          <TabsTrigger value="progress" className="flex items-center gap-1 px-3 py-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.progress')}</span>
          </TabsTrigger>
          
          <TabsTrigger value="strategy" className="flex items-center gap-1 px-3 py-1.5">
            <Compass className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline">{t('skills.strategy')}</span>
          </TabsTrigger>
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
