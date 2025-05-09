
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getEnemies, getSubjects, getQuizResults, getQuestions } from '@/utils/storage';
import { Enemy, QuizResult, Subject, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Target, BookOpen, BookCheck, Clock } from 'lucide-react';
import NoStatsAvailable from '@/components/skills/NoStatsAvailable';
import SimulationAnalysis from '@/components/skills/SimulationAnalysis';
import SubjectProgress from '@/components/skills/SubjectProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BattleSimulations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // Fix: using the hook directly instead of useState
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
    return questions.filter(q => {
      const relevantResults = filteredResults;
      const questionIds = new Set<string>();
      relevantResults.forEach(result => {
        result.answers.forEach(answer => {
          questionIds.add(answer.questionId);
        });
      });
      return questionIds.has(q.id);
    });
  }, [questions, filteredResults]);
  
  // Get topics for the selected subject
  const currentSubjectTopics = useMemo(() => {
    if (selectedSubject === 'all') return [];
    return subjects.find(s => s.id === selectedSubject)?.topics || [];
  }, [subjects, selectedSubject]);
  
  // Filter enemies by subject
  const subjectEnemies = useMemo(() => {
    if (selectedSubject === 'all') return enemies;
    return enemies.filter(enemy => enemy.subjectId === selectedSubject);
  }, [enemies, selectedSubject]);
  
  // Group enemies by subject for simulation cards
  const groupedEnemiesBySubject = useMemo(() => {
    const grouped: Record<string, { subject: Subject, enemies: Enemy[] }> = {};
    
    subjects.forEach(subject => {
      const subjectEnemies = enemies.filter(enemy => enemy.subjectId === subject.id);
      if (subjectEnemies.length > 0) {
        grouped[subject.id] = {
          subject,
          enemies: subjectEnemies
        };
      }
    });
    
    return grouped;
  }, [subjects, enemies]);
  
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
  
  // Start simulation with ALL enemies from the selected subject
  const startSimulation = (subjectId: string) => {
    // Get all enemies for this subject
    const subjectEnemies = enemies.filter(enemy => enemy.subjectId === subjectId);
    
    if (subjectEnemies.length === 0) {
      toast.error('Não há temas disponíveis para esta matéria');
      return;
    }
    
    // Use ALL enemies for this subject
    const selectedEnemyIds = subjectEnemies.map(e => e.id).join(',');
    
    // Navigate to battlefield with ALL the selected enemies
    navigate(`/battlefield?subjectId=${subjectId}&mode=simulation&enemyIds=${selectedEnemyIds}`);
  };

  // Calculate statistics for each subject
  const getSubjectStats = (subjectId: string) => {
    const subjectEnemies = enemies.filter(e => e.subjectId === subjectId);
    const subjectResults = results.filter(r => {
      const enemy = enemies.find(e => e.id === r.enemyId);
      return enemy && enemy.subjectId === subjectId;
    });
    
    const totalQuestions = subjectResults.reduce((sum, r) => sum + r.totalQuestions, 0);
    const correctAnswers = subjectResults.reduce((sum, r) => sum + r.correctAnswers, 0);
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    const totalTime = subjectResults.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
    
    return {
      totalEnemies: subjectEnemies.length,
      defeatedEnemies: subjectEnemies.filter(e => e.status === 'mastered' || e.progress >= 80).length,
      accuracy,
      avgTime,
      totalQuestions,
      lastSimulation: subjectResults.length > 0 ? 
        new Date(Math.max(...subjectResults.map(r => new Date(r.date).getTime()))).toLocaleDateString() : 
        null
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{t('battleSimulations.title') || 'Simulados'}</h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
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
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {subjects.length > 0 ? (
                subjects.map(subject => {
                  const stats = getSubjectStats(subject.id);
                  const subjectTopics = subject.topics || [];
                  const topicProgresses = subjectTopics.map(topic => ({
                    name: topic.name,
                    progress: topic.progress || 0
                  }));
                  
                  return (
                    <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{subject.name}</span>
                          <BookOpen className="h-5 w-5 text-primary" />
                        </CardTitle>
                        <CardDescription>
                          Simulado com questões de todos os temas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex space-x-4">
                            <div className="flex-1 text-center">
                              <div className="text-2xl font-bold">{stats.totalEnemies}</div>
                              <div className="text-xs text-gray-500">Temas</div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-2xl font-bold">{stats.accuracy}%</div>
                              <div className="text-xs text-gray-500">Precisão</div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="text-2xl font-bold">{stats.totalQuestions || 0}</div>
                              <div className="text-xs text-gray-500">Questões</div>
                            </div>
                          </div>
                          
                          {topicProgresses.length > 0 && (
                            <SubjectProgress 
                              subjects={topicProgresses} 
                              colors={["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-purple-500", "bg-pink-500"]}
                              maxItems={3}
                            />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => startSimulation(subject.id)}
                        >
                          <Target className="mr-1" /> 
                          Iniciar Simulado com Todos os Temas
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma matéria encontrada</h3>
                  <p className="text-gray-500">Adicione matérias e temas para criar simulados</p>
                </div>
              )}
            </div>
            
            {filteredResults.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Histórico de Simulados</h2>
                <SimulationAnalysis 
                  results={filteredResults}
                  questions={filteredQuestions}
                  enemies={enemies}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BattleSimulations;
