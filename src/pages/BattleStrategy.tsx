
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle } from 'lucide-react';
import { Enemy, Question, QuizResult } from '@/utils/types';
import { 
  getEnemies, 
  getSubjects,
  getEnemiesToReviewToday, 
  getEnemiesForFutureReview,
  updateEnemyAfterReview
} from '@/utils/storage';
import EnemyCard from '@/components/EnemyCard';
import QuizSession from '@/components/QuizSession';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const BattleStrategy = () => {
  const [todayReviews, setTodayReviews] = useState<Enemy[]>([]);
  const [futureReviews, setFutureReviews] = useState<Enemy[]>([]);
  const [activeEnemyQuiz, setActiveEnemyQuiz] = useState<Enemy | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setTodayReviews(getEnemiesToReviewToday());
    setFutureReviews(getEnemiesForFutureReview());
  };
  
  const handleStartReview = (enemy: Enemy) => {
    // Get the subject and topic for this enemy
    const subjects = getSubjects();
    const subject = subjects.find(s => s.id === enemy.subjectId);
    if (!subject) {
      toast.error('Não foi possível encontrar as questões para este inimigo.');
      return;
    }
    
    const topic = subject.topics.find(t => t.id === enemy.topicId);
    if (!topic) {
      toast.error('Não foi possível encontrar as questões para este inimigo.');
      return;
    }
    
    // Get questions based on subtopic or topic
    let questions: Question[] = [];
    if (enemy.subTopicId) {
      const subTopic = topic.subTopics.find(st => st.id === enemy.subTopicId);
      if (subTopic) {
        questions = [...subTopic.questions];
      }
    } else {
      questions = [...topic.questions];
    }
    
    if (questions.length === 0) {
      toast.error('Este inimigo não possui questões para revisão!');
      return;
    }
    
    // Shuffle questions and take up to 5
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 5);
    
    setQuizQuestions(shuffledQuestions);
    setActiveEnemyQuiz(enemy);
  };
  
  const handleReviewComplete = (result: QuizResult) => {
    if (!activeEnemyQuiz) return;
    
    // Update enemy's review status
    updateEnemyAfterReview(activeEnemyQuiz.id, result);
    
    // Reset active enemy
    setActiveEnemyQuiz(null);
    
    // Reload data to get updated review lists
    loadData();
    
    toast.success('Revisão concluída!');
  };

  // Navigate to battle simulations with subject and topic filters
  const goToSimulationsWithFilter = (subjectId?: string, topicId?: string) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (topicId) params.append('topicId', topicId);
    
    navigate(`/battle-simulations?${params.toString()}`);
  };
  
  // Modified to handle string dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="container mx-auto px-1 sm:px-4 py-3 sm:py-6">
      {activeEnemyQuiz ? (
        <QuizSession 
          enemy={activeEnemyQuiz}
          questions={quizQuestions}
          onComplete={handleReviewComplete}
          onCancel={() => setActiveEnemyQuiz(null)}
          isReview={true}
        />
      ) : (
        <>
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6">Estratégia de Batalha</h1>
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Simulados</h2>
            <p className="text-gray-600 mb-4">
              Teste seus conhecimentos com simulados completos. 
              Você pode filtrar por matéria e tema para focar nos assuntos que precisa revisar.
            </p>
            <Button 
              onClick={() => goToSimulationsWithFilter()}
              className="w-full sm:w-auto"
            >
              Ver Simulados
            </Button>
          </div>
          
          {todayReviews.length === 0 && futureReviews.length === 0 ? (
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow text-center">
              <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Nenhuma Revisão Pendente</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Quando você completar batalhas com sucesso, os inimigos serão movidos para 
                revisão espaçada para consolidar seu conhecimento.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-8">
              {/* Today's reviews */}
              <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-warrior-blue mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold">Espiando (Revisões de hoje)</h2>
                </div>
                
                {todayReviews.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 text-gray-500 text-sm sm:text-base">
                    Nenhuma revisão para hoje.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    {todayReviews.map((enemy) => (
                      <div key={enemy.id} className="flex flex-col">
                        <EnemyCard
                          enemy={enemy}
                          onClick={handleStartReview}
                          className="cursor-pointer hover:-translate-y-1 transition-transform flex-grow"
                          hideActions={true}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2" 
                          onClick={() => goToSimulationsWithFilter(enemy.subjectId, enemy.topicId)}
                        >
                          Ver Simulados
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Future reviews */}
              <div className="bg-white p-3 sm:p-6 rounded-lg shadow mb-16 sm:mb-0">
                <div className="flex items-center mb-3 sm:mb-4">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warrior-yellow mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold">Rebelião (Revisões futuras)</h2>
                </div>
                
                {futureReviews.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 text-gray-500 text-sm sm:text-base">
                    Nenhuma revisão futura agendada.
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Group by date */}
                    {Array.from(new Set(futureReviews.map(enemy => {
                      if (enemy.nextReviewDates && enemy.currentReviewIndex !== undefined) {
                        return formatDate(enemy.nextReviewDates[enemy.currentReviewIndex]);
                      }
                      return '';
                    }))).filter(date => date).sort().map(date => (
                      <div key={date} className="border-t pt-3 sm:pt-4">
                        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Data: {date}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                          {futureReviews
                            .filter(enemy => {
                              if (enemy.nextReviewDates && enemy.currentReviewIndex !== undefined) {
                                return formatDate(enemy.nextReviewDates[enemy.currentReviewIndex]) === date;
                              }
                              return false;
                            })
                            .map(enemy => (
                              <div key={enemy.id} className="flex flex-col">
                                <EnemyCard
                                  enemy={enemy}
                                  className="opacity-75 flex-grow"
                                  hideActions={true}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2 opacity-75" 
                                  onClick={() => goToSimulationsWithFilter(enemy.subjectId, enemy.topicId)}
                                >
                                  Ver Simulados
                                </Button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BattleStrategy;
