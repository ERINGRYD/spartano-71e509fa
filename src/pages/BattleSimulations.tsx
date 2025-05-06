
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEnemies, getSubjects, getQuizResults, getQuestions } from '@/utils/storage';
import { Enemy, QuizResult, Subject, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import NoStatsAvailable from '@/components/skills/NoStatsAvailable';
import SimulationAnalysis from '@/components/skills/SimulationAnalysis';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const BattleSimulations = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Get the subjectId and topicId from URL parameters
  useEffect(() => {
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');
    
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
    
    if (topicId) {
      setSelectedTopic(topicId);
    }
    
    loadData();
  }, [searchParams]);

  const loadData = () => {
    setIsLoading(true);
    try {
      const loadedSubjects = getSubjects();
      const loadedResults = getQuizResults();
      const loadedEnemies = getEnemies();
      const loadedQuestions = getQuestions();
      
      // Debug logs to check data
      console.log('Loaded subjects:', loadedSubjects);
      console.log('Loaded quiz results:', loadedResults);
      console.log('Loaded enemies:', loadedEnemies);
      console.log('Loaded questions:', loadedQuestions);
      
      setSubjects(loadedSubjects);
      setResults(loadedResults);
      setEnemies(loadedEnemies);
      setQuestions(loadedQuestions || []);
    } catch (err) {
      toast.error(t('common.errorLoadingData') || 'Erro ao carregar dados');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    // Make sure we have data to filter
    if (!results || results.length === 0 || !enemies || enemies.length === 0) {
      console.log('No results or enemies to filter');
      return [];
    }
    
    // Start with all results
    let simulations = results;
    
    console.log('Filtering from', results.length, 'results', 'with', enemies.length, 'enemies');
    
    // Filter by subject if selected
    if (selectedSubject !== 'all') {
      simulations = simulations.filter(result => {
        const enemy = enemies.find(e => e.id === result.enemyId);
        return enemy && enemy.subjectId === selectedSubject;
      });
      console.log('After subject filter:', simulations.length, 'results');
    }
    
    // Filter by topic if selected
    if (selectedTopic) {
      simulations = simulations.filter(result => {
        const enemy = enemies.find(e => e.id === result.enemyId);
        return enemy && enemy.topicId === selectedTopic;
      });
      console.log('After topic filter:', simulations.length, 'results');
    }
    
    return simulations;
  }, [results, enemies, selectedSubject, selectedTopic]);
  
  const filteredQuestions = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    
    // Get the relevant quiz results
    let relevantResults = filteredResults;
    
    // Extract question IDs from these results
    const questionIds = new Set<string>();
    relevantResults.forEach(result => {
      result.answers.forEach(answer => {
        questionIds.add(answer.questionId);
      });
    });
    
    // Find those questions in the questions array
    return questions.filter(q => questionIds.has(q.id));
  }, [questions, filteredResults]);
  
  // Get topics for the selected subject
  const currentSubjectTopics = useMemo(() => {
    if (selectedSubject === 'all') return [];
    return subjects.find(s => s.id === selectedSubject)?.topics || [];
  }, [subjects, selectedSubject]);
  
  // Update URL when filters change
  const updateUrlParams = (subjectId: string, topicId: string | null) => {
    const params = new URLSearchParams();
    
    if (subjectId !== 'all') {
      params.set('subjectId', subjectId);
    }
    
    if (topicId) {
      params.set('topicId', topicId);
    }
    
    setSearchParams(params);
  };
  
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedTopic(null);
    updateUrlParams(value, null);
  };
  
  const handleTopicChange = (value: string | null) => {
    setSelectedTopic(value);
    updateUrlParams(selectedSubject, value);
  };

  // Check if we have real data to display
  const hasData = useMemo(() => {
    return !isLoading && enemies.length > 0 && results.length > 0;
  }, [isLoading, enemies, results]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{t('battleSimulations.title') || 'Batalhas Simuladas'}</h1>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium mb-1">{t('skills.subject') || 'Matéria'}</label>
              <Select
                value={selectedSubject}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('skills.allSubjects') || 'Todas as matérias'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('skills.allSubjects') || 'Todas as matérias'}</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSubject !== 'all' && currentSubjectTopics.length > 0 && (
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium mb-1">{t('skills.topic') || 'Tema'}</label>
                <Select
                  value={selectedTopic || "all_topics"}
                  onValueChange={(value) => handleTopicChange(value === "all_topics" ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('skills.allTopics') || 'Todos os temas'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_topics">{t('skills.allTopics') || 'Todos os temas'}</SelectItem>
                    {currentSubjectTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="w-full sm:w-1/3 sm:self-end">
              <Button 
                variant="outline" 
                onClick={() => loadData()}
                className="w-full"
              >
                {t('common.refresh') || 'Atualizar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {hasData ? (
            <SimulationAnalysis 
              results={filteredResults}
              questions={filteredQuestions}
              enemies={enemies}
            />
          ) : (
            <NoStatsAvailable />
          )}
        </>
      )}
    </div>
  );
};

export default BattleSimulations;
