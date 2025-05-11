
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnemies, getSubjects, getQuestions } from '@/utils/storage';
import { Enemy, Subject, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, ChevronRight, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import NoStatsAvailable from '@/components/skills/NoStatsAvailable';
import { Progress } from '@/components/ui/progress';

const FullChallenge = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Load all necessary data
  const loadData = () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      const loadedSubjects = getSubjects();
      const loadedEnemies = getEnemies();
      const loadedQuestions = getQuestions();
      
      console.log('Loaded data:', { 
        subjectsCount: loadedSubjects.length,
        enemiesCount: loadedEnemies.length, 
        questionsCount: loadedQuestions.length 
      });
      
      setSubjects(loadedSubjects);
      setEnemies(loadedEnemies);
      setQuestions(loadedQuestions || []);
    } catch (err) {
      const errorMessage = t('common.errorLoadingData') || 'Erro ao carregar dados';
      setLoadingError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter questions by selected subject
  const filteredQuestions = useMemo(() => {
    if (!questions || questions.length === 0) {
      return [];
    }
    
    if (selectedSubject === 'all') {
      return questions;
    }
    
    // Filter questions by subject ID
    // In a real implementation, you might need to map between subjects, enemies, and questions
    // This is a simplified approach
    const subjectEnemies = enemies.filter(enemy => enemy.subjectId === selectedSubject);
    const enemyIds = subjectEnemies.map(enemy => enemy.id);
    
    return questions.filter(question => {
      // If the question has a topic or subTopic that belongs to an enemy in this subject
      const enemy = enemies.find(e => e.id === question.enemyId);
      return enemy && enemyIds.includes(enemy.id);
    });
  }, [questions, enemies, selectedSubject]);
  
  // Group questions by subject
  const questionsBySubject = useMemo(() => {
    const grouped: Record<string, { subject: Subject, count: number }> = {};
    
    if (questions.length === 0 || subjects.length === 0) {
      return grouped;
    }
    
    subjects.forEach(subject => {
      // Count questions for this subject
      // In this implementation, we're using a simplified approach
      const subjectEnemies = enemies.filter(enemy => enemy.subjectId === subject.id);
      const enemyIds = subjectEnemies.map(enemy => enemy.id);
      
      // Count questions that belong to enemies in this subject
      const subjectQuestions = questions.filter(q => {
        const enemy = enemies.find(e => e.id === q.enemyId);
        return enemy && enemyIds.includes(enemy.id);
      });
      
      if (subjectQuestions.length > 0) {
        grouped[subject.id] = {
          subject,
          count: subjectQuestions.length
        };
      } else {
        // Even if no questions match the specific filtering, still show the subject
        // with all available questions
        grouped[subject.id] = {
          subject,
          count: questions.length // Show all questions
        };
      }
    });
    
    return grouped;
  }, [questions, subjects, enemies]);
  
  // Start a challenge with all questions for the selected subject
  const startFullChallenge = (subjectId: string = 'all') => {
    let questionIds: string[] = [];
    let targetQuestions: Question[] = [];
    let enemyIds: string[] = [];
    
    // If all subjects selected, use all questions
    if (subjectId === 'all') {
      targetQuestions = [...questions];
      // Get all enemies
      enemyIds = enemies.map(e => e.id);
    } else {
      // Get enemies for this subject
      const subjectEnemies = enemies.filter(enemy => enemy.subjectId === subjectId);
      enemyIds = subjectEnemies.map(e => e.id);
      
      // Get questions for these enemies
      targetQuestions = questions.filter(q => {
        const enemy = enemies.find(e => e.id === q.enemyId);
        return enemy && enemyIds.includes(enemy.id);
      });
      
      // If no questions found with the filtering, use all questions
      if (targetQuestions.length === 0) {
        console.log("No questions found for this subject, using all questions");
        targetQuestions = [...questions];
      }
    }
    
    // Check if we have questions
    if (targetQuestions.length === 0) {
      toast.error('Não há questões disponíveis para esse desafio');
      return;
    }
    
    // Get question IDs
    questionIds = targetQuestions.map(q => q.id);
    
    console.log(`Starting full challenge with ${questionIds.length} questions and ${enemyIds.length} enemies`);
    
    // Navigate to battlefield with all questions
    navigate(`/battlefield?mode=fullchallenge&questionIds=${questionIds.join(',')}&enemyIds=${enemyIds.join(',')}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Desafio Completo</h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium mb-1">{t('skills.subject') || 'Matéria'}</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
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
            
            <div className="w-full sm:w-1/3 sm:self-end">
              <Button 
                variant="outline" 
                onClick={() => loadData()}
                className="w-full"
              >
                {t('common.refresh') || 'Atualizar'}
              </Button>
            </div>
            
            <div className="w-full sm:w-1/3 sm:self-end">
              <Button 
                onClick={() => startFullChallenge(selectedSubject)}
                className="w-full bg-warrior-red hover:bg-red-700"
                disabled={questions.length === 0}
              >
                <Target className="mr-1" /> 
                Iniciar Desafio ({questions.length} questões)
              </Button>
            </div>
          </div>

          {/* Barra de progresso mostrando a quantidade de questões */}
          {!isLoading && questions.length > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>0 questões</span>
                <span>{questions.length} questões</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : loadingError ? (
          <div className="bg-red-50 border border-red-300 rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{loadingError}</p>
            <Button onClick={() => loadData()} variant="outline" className="bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma questão encontrada</h3>
            <p className="text-gray-600 mb-4">Para iniciar um desafio completo, você precisa adicionar questões primeiro.</p>
            <Button onClick={() => navigate('/')} variant="outline" className="bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Adicionar Questões
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.keys(questionsBySubject).length > 0 ? (
              Object.keys(questionsBySubject).map(subjectId => {
                const item = questionsBySubject[subjectId];
                
                return (
                  <Card key={subjectId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{item.subject.name}</span>
                        <Target className="h-5 w-5 text-warrior-red" />
                      </CardTitle>
                      <CardDescription>
                        Desafio com todas as {item.count} questões
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-center items-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-warrior-red">{item.count}</div>
                            <div className="text-sm text-gray-500">Questões disponíveis</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-warrior-red hover:bg-red-700" 
                        onClick={() => startFullChallenge(subjectId)}
                      >
                        <ChevronRight className="mr-1" /> 
                        Iniciar Desafio Completo
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma matéria com questões encontrada</h3>
                <p className="text-gray-500">Adicione questões às matérias para criar desafios</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullChallenge;
