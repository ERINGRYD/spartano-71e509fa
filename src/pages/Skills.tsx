import { useState, useEffect, useMemo } from 'react';
import { getSubjects, getQuizResults, getEnemies, getQuestions } from '@/utils/storage';
import { Subject, QuizResult, Enemy, Topic, Question } from '@/utils/types';
import StatsCard from '@/components/skills/StatsCard';
import SubjectProgress from '@/components/skills/SubjectProgress';
import ActivityChart from '@/components/skills/ActivityChart';
import AccuracyChart from '@/components/skills/AccuracyChart';
import ConfidenceChart from '@/components/skills/ConfidenceChart';
import NoStatsAvailable from '@/components/skills/NoStatsAvailable';
import ErrorState from '@/components/skills/ErrorState';
import SkillsRadarChart from '@/components/skills/SkillsRadarChart';
import SkeletonChart from '@/components/skills/SkeletonChart';
import ThemeFilter from '@/components/skills/ThemeFilter';
import { useTranslation } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';
import AdvancedAnalytics from '@/components/skills/AdvancedAnalytics';

const COLORS = ['#27AE60', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C'];

const Skills = () => {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Stats
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<{name: string, progress: number}[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{date: string, count: number}[]>([]);
  
  // Get topics for the selected subject
  const currentSubjectTopics = selectedSubject !== 'all' 
    ? subjects.find(s => s.id === selectedSubject)?.topics || []
    : [];
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (!error && !isLoading) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        calculateStats();
        setIsCalculating(false);
      }, 100); // Small delay for UI feedback
      
      return () => clearTimeout(timer);
    }
  }, [results, subjects, enemies, questions, selectedSubject, selectedTopic, error, isLoading]);
  
  const loadData = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedSubjects = getSubjects();
      const loadedResults = getQuizResults();
      const loadedEnemies = getEnemies();
      const loadedQuestions = getQuestions();
      
      setSubjects(loadedSubjects);
      setResults(loadedResults);
      setEnemies(loadedEnemies);
      setQuestions(loadedQuestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTopicChange = (topicId: string | null) => {
    setSelectedTopic(topicId);
  };
  
  const calculateStats = () => {
    // Filter results by selected subject if needed
    let filteredResults = results;
    
    if (selectedSubject !== 'all') {
      filteredResults = results.filter(r => {
        const enemy = enemies.find(e => e.id === r.enemyId);
        return enemy && enemy.subjectId === selectedSubject;
      });
    }
    
    // Further filter by topic if selected
    if (selectedTopic) {
      filteredResults = filteredResults.filter(r => {
        const enemy = enemies.find(e => e.id === r.enemyId);
        return enemy && enemy.topicId === selectedTopic;
      });
    }
    
    // Total and correct questions
    let totalQ = 0;
    let correctQ = 0;
    
    filteredResults.forEach(result => {
      totalQ += result.totalQuestions;
      correctQ += result.correctAnswers;
    });
    
    setTotalQuestions(totalQ);
    setCorrectAnswers(correctQ);
    
    // Total time spent
    const timeSum = filteredResults.reduce((sum, r) => sum + r.timeSpent, 0);
    setTotalTime(timeSum);
    
    // Average confidence
    const avgConfidence = filteredResults.length > 0 
      ? filteredResults.reduce((sum, r) => sum + r.confidenceScore, 0) / filteredResults.length 
      : 0;
    setAverageConfidence(avgConfidence);
    
    // Subject progress
    const progress = subjects.map(subject => ({
      name: subject.name,
      progress: subject.progress
    }));
    setSubjectProgress(progress);
    
    // Daily activity
    const activityMap = new Map<string, number>();
    
    filteredResults.forEach(result => {
      const date = new Date(result.date).toLocaleDateString();
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });
    
    const activity = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
    
    // Sort by date
    activity.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
    
    setDailyActivity(activity);
  };
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const getCurrentSubjectName = () => {
    if (selectedSubject === 'all') return null;
    return subjects.find(s => s.id === selectedSubject)?.name;
  };

  // Filter questions based on selected subject and topic
  const filteredQuestions = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    
    // Get the relevant quiz results
    let relevantResults = results;
    if (selectedSubject !== 'all') {
      relevantResults = results.filter(r => {
        const enemy = enemies.find(e => e.id === r.enemyId);
        return enemy && enemy.subjectId === selectedSubject;
      });
    }
    
    if (selectedTopic) {
      relevantResults = relevantResults.filter(r => {
        const enemy = enemies.find(e => e.id === r.enemyId);
        return enemy && enemy.topicId === selectedTopic;
      });
    }
    
    // Extract question IDs from these results
    const questionIds = new Set<string>();
    relevantResults.forEach(result => {
      result.answers.forEach(answer => {
        questionIds.add(answer.questionId);
      });
    });
    
    // Find those questions in the questions array
    return questions.filter(q => questionIds.has(q.id));
  }, [questions, results, enemies, selectedSubject, selectedTopic]);
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="space-y-6">
          {/* Skeleton stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          
          {/* Skeleton charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart title={t('skills.subjectProgress')} />
            <SkeletonChart title={t('skills.dailyActivity')} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart title={t('skills.performance')} />
            <SkeletonChart title={t('skills.confidenceDistribution')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold" tabIndex={0}>{t('skills.title')}</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          {isCalculating && (
            <div className="flex items-center text-sm text-gray-500 animate-pulse">
              <Loader className="animate-spin mr-1 h-4 w-4" />
              <span>{t('common.calculating')}</span>
            </div>
          )}
          
          <select 
            className="border rounded-md px-3 py-2 text-sm"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic(null); // Reset topic when subject changes
            }}
            disabled={isCalculating}
            aria-label={t('skills.selectSubject') || "Select subject"}
          >
            <option value="all">{t('skills.allSubjects')}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Theme filter */}
      {selectedSubject !== 'all' && currentSubjectTopics.length > 0 && (
        <ThemeFilter
          topics={currentSubjectTopics}
          selectedTopic={selectedTopic}
          onSelectTopic={handleTopicChange}
          subjectName={getCurrentSubjectName()}
        />
      )}
      
      {results.length === 0 ? (
        <NoStatsAvailable />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('skills.questionsResolved')}
              value={totalQuestions}
              subtitle={`${t('skills.accuracyRate')}: ${totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%`}
              icon="questions"
            />
            
            <StatsCard
              title={t('skills.totalTime')}
              value={formatTime(totalTime)}
              subtitle={`${t('skills.averagePerQuestion')}: ${totalQuestions > 0 ? formatTime(totalTime / totalQuestions) : '0s'}`}
              icon="time"
            />
            
            <StatsCard
              title={t('skills.averageConfidence')}
              value={`${Math.round(averageConfidence)}%`}
              subtitle={t('skills.basedOn')}
              icon="confidence"
            />
            
            <StatsCard
              title={t('skills.observedEnemies')}
              value={enemies.filter(e => e.status === 'observed').length}
              subtitle={`${t('skills.ofTotal')} ${enemies.length} ${t('skills.enemies')}`}
              icon="enemies"
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubjectProgress subjects={subjectProgress} colors={COLORS} />
            
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
              <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.dailyActivity')}</h3>
              <ActivityChart data={dailyActivity} />
            </div>
          </div>
          
          {/* Radar chart for skill distribution */}
          <SkillsRadarChart subjects={subjects} />
          
          {/* Additional charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
              <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.performance')}</h3>
              <AccuracyChart correctAnswers={correctAnswers} totalQuestions={totalQuestions} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
              <h3 className="text-lg font-semibold mb-4" tabIndex={0}>{t('skills.confidenceDistribution')}</h3>
              <ConfidenceChart results={results} />
            </div>
          </div>
          
          {/* Advanced Analytics */}
          <AdvancedAnalytics 
            results={results} 
            questions={filteredQuestions} 
            enemies={enemies} 
            isLoading={isCalculating} 
          />
        </div>
      )}
    </div>
  );
};

export default Skills;
