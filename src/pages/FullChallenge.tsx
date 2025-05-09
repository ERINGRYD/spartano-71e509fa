
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnemies, getSubjects, getQuestions } from '@/utils/storage';
import { Enemy, Subject, Question } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import NoStatsAvailable from '@/components/skills/NoStatsAvailable';

const FullChallenge = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Load all necessary data
  const loadData = () => {
    setIsLoading(true);
    try {
      const loadedSubjects = getSubjects();
      const loadedEnemies = getEnemies();
      const loadedQuestions = getQuestions();
      
      setSubjects(loadedSubjects);
      setEnemies(loadedEnemies);
      setQuestions(loadedQuestions || []);
    } catch (err) {
      toast.error(t('common.errorLoadingData') || 'Erro ao carregar dados');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter questions by selected subject
  const filteredQuestions = useMemo(() => {
    if (selectedSubject === 'all') {
      return questions;
    }
    
    return questions.filter(question => {
      const questionEnemy = enemies.find(enemy => {
        // Find the enemy that contains this question
        const enemyTopicId = enemy.topicId;
        const enemySubjectId = enemy.subjectId;
        
        // Check if the question belongs to this enemy's topic
        return enemySubjectId === selectedSubject;
      });
      
      return !!questionEnemy;
    });
  }, [questions, enemies, selectedSubject]);
  
  // Group questions by subject
  const questionsBySubject = useMemo(() => {
    const grouped: Record<string, { subject: Subject, count: number }> = {};
    
    subjects.forEach(subject => {
      const subjectQuestions = questions.filter(question => {
        const questionEnemy = enemies.find(enemy => {
          return enemy.subjectId === subject.id;
        });
        return !!questionEnemy;
      });
      
      if (subjectQuestions.length > 0) {
        grouped[subject.id] = {
          subject,
          count: subjectQuestions.length
        };
      }
    });
    
    return grouped;
  }, [questions, enemies, subjects]);
  
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
      // Get questions for specific subject
      targetQuestions = questions.filter(question => {
        const questionEnemy = enemies.find(enemy => {
          return enemy.subjectId === subjectId;
        });
        return !!questionEnemy;
      });
      
      // Get enemies for this subject
      enemyIds = enemies
        .filter(enemy => enemy.subjectId === subjectId)
        .map(e => e.id);
    }
    
    // Check if we have questions
    if (targetQuestions.length === 0) {
      toast.error('Não há questões disponíveis para esse desafio');
      return;
    }
    
    // Get question IDs
    questionIds = targetQuestions.map(q => q.id);
    
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
                disabled={filteredQuestions.length === 0}
              >
                <Target className="mr-1" /> 
                Iniciar Desafio ({filteredQuestions.length} questões)
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
                  <h3 className="text-lg font-semibold mb-2">Nenhuma questão encontrada</h3>
                  <p className="text-gray-500">Adicione questões para criar desafios</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullChallenge;
