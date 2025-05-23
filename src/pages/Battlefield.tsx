import { useState, useEffect } from 'react';
import { 
  Swords, 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  MoveUp,
  Target,
  Flag,
  Filter
} from 'lucide-react';
import { 
  Enemy, 
  Subject, 
  Topic, 
  SubTopic, 
  Question,
  QuizResult 
} from '@/utils/types';
import { 
  getEnemies, 
  getSubjects,
  deleteAllEnemies,
  deleteEnemy,
  saveEnemy,
  promoteEnemyToBattle,
  bulkPromoteEnemies,
  incrementEnemyPromotionPoints,
  getQuizResultsByEnemyId,
  getQuizResults,
  moveEnemyToStrategy
} from '@/utils/storage';
import EnemyCard from '@/components/EnemyCard';
import QuizSession from '@/components/QuizSession';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BattleProgressIndicator from '@/components/progression/BattleProgressIndicator';
import { supabase } from '@/integrations/supabase/client';

const MAX_BATTLEFIELD_ENEMIES = 12;

const Battlefield = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedEnemies, setSelectedEnemies] = useState<Enemy[]>([]);
  const [showEnemySelector, setShowEnemySelector] = useState(false);
  const [activeEnemyQuiz, setActiveEnemyQuiz] = useState<Enemy | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [showPromotionBanner, setShowPromotionBanner] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const checkAuthentication = async () => {
      // Verificar se há um usuário autenticado
      const { data: session } = await supabase.auth.getSession();
      const isAuthenticated = !!session?.session?.user;
      
      if (isAuthenticated) {
        // Se o usuário está autenticado, carregar dados do Supabase
        loadData();
      } else {
        // Se não está autenticado, usar dados do localStorage
        loadData();
      }
    };
    
    checkAuthentication();
    
    // Set up automatic check for enemies that have been in ready state too long
    const interval = setInterval(() => {
      checkForReadyEnemies();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const loadData = () => {
    const loadedEnemies = getEnemies();
    const loadedSubjects = getSubjects();
    
    setEnemies(loadedEnemies);
    setSubjects(loadedSubjects);
    
    // Filter enemies that should be in the battlefield
    // We need to make sure we don't include enemies that are in strategy mode
    const battlefieldEnemies = loadedEnemies.filter(enemy => {
      // Include enemies with status 'battle', 'wounded', or 'ready'
      if (enemy.status === 'battle' || enemy.status === 'wounded' || enemy.status === 'ready') {
        return true;
      }
      
      // For observed enemies, only include those that don't have scheduled review dates
      // (these are the ones not managed by the strategy tab)
      if (enemy.status === 'observed') {
        // If the enemy has nextReviewDates AND currentReviewIndex, it's in strategy tab
        return !enemy.nextReviewDates || enemy.currentReviewIndex === undefined;
      }
      
      // Exclude mastered enemies
      return enemy.status !== 'mastered';
    });
    
    setSelectedEnemies(battlefieldEnemies.slice(0, MAX_BATTLEFIELD_ENEMIES));
    
    // Check if we should show promotion banner
    checkForReadyEnemies();
  };
  
  const checkForReadyEnemies = () => {
    const readyEnemies = enemies.filter(enemy => {
      if (enemy.status !== 'ready' || !enemy.readySince) return false;
      
      const readyDate = new Date(enemy.readySince);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - readyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return diffDays >= 3; // 3+ days in ready status
    });
    
    setShowPromotionBanner(readyEnemies.length > 0);
    
    // Increment promotion points for enemies that have been ready for a while
    readyEnemies.forEach(enemy => {
      incrementEnemyPromotionPoints(enemy.id);
    });
  };
  
  const handleSubjectFilter = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };
  
  const getFilteredEnemies = () => {
    if (selectedSubject === 'all') {
      return enemies.filter(enemy => enemy.status === 'ready');
    }
    return enemies.filter(enemy => enemy.status === 'ready' && enemy.subjectId === selectedSubject);
  };
  
  const handleAddEnemy = async (enemy: Enemy) => {
    if (selectedEnemies.length >= MAX_BATTLEFIELD_ENEMIES) {
      toast.error(`Limite máximo de ${MAX_BATTLEFIELD_ENEMIES} inimigos no campo de batalha atingido!`);
      return;
    }
    
    // Check if enemy is already in battlefield
    if (selectedEnemies.some(e => e.id === enemy.id)) {
      toast.error('Este inimigo já está no campo de batalha!');
      return;
    }
    
    // Update enemy status to battle
    const updatedEnemy = {
      ...enemy,
      status: 'battle' as const
    };
    
    // Save to storage
    try {
      const savedEnemy = await saveEnemy(updatedEnemy);
      
      // Update UI
      setSelectedEnemies([...selectedEnemies, savedEnemy]);
      setEnemies(enemies.map(e => e.id === enemy.id ? savedEnemy : e));
      
      toast.success(`${enemy.name} adicionado ao campo de batalha!`);
      setShowEnemySelector(false);
    } catch (error) {
      console.error('Error adding enemy to battlefield:', error);
      toast.error('Erro ao adicionar inimigo ao campo de batalha');
    }
  };
  
  const handleRemoveEnemy = async (enemyId: string) => {
    // Remove from battlefield but don't delete
    setSelectedEnemies(selectedEnemies.filter(e => e.id !== enemyId));
    
    // Reset enemy status to ready
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy) {
      const updatedEnemy = {
        ...enemy,
        status: 'ready' as const,
        readySince: new Date().toISOString(), // Track when it was set to ready
      };
      
      // Save to storage
      try {
        const savedEnemy = await saveEnemy(updatedEnemy);
        
        // Update UI
        setEnemies(enemies.map(e => e.id === enemyId ? savedEnemy : e));
      } catch (error) {
        console.error('Error removing enemy from battlefield:', error);
        toast.error('Erro ao remover inimigo do campo de batalha');
      }
    }
  };
  
  const handleDeleteEnemy = async (enemyId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este inimigo?')) {
      try {
        // Delete enemy completely
        const remainingEnemies = await deleteEnemy(enemyId);
        
        // Update UI
        setEnemies(remainingEnemies);
        setSelectedEnemies(selectedEnemies.filter(e => e.id !== enemyId));
        
        toast.success('Inimigo excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting enemy:', error);
        toast.error('Erro ao excluir inimigo');
      }
    }
  };
  
  const handleDeleteAllEnemies = async () => {
    if (window.confirm('Tem certeza que deseja excluir todos os inimigos?')) {
      try {
        // Delete all enemies
        await deleteAllEnemies();
        
        // Update UI
        setEnemies([]);
        setSelectedEnemies([]);
        
        toast.success('Todos os inimigos foram excluídos!');
      } catch (error) {
        console.error('Error deleting all enemies:', error);
        toast.error('Erro ao excluir todos os inimigos');
      }
    }
  };
  
  const handlePromoteEnemy = async (enemy: Enemy) => {
    if (enemy.status === 'ready') {
      try {
        const promotedEnemy = await promoteEnemyToBattle(enemy.id);
        
        if (promotedEnemy) {
          // Update UI
          setEnemies(enemies.map(e => e.id === enemy.id ? promotedEnemy : e));
          setSelectedEnemies(selectedEnemies.map(e => e.id === enemy.id ? promotedEnemy : e));
          
          toast.success(`${enemy.name} promovido para Linha de Frente!`);
        }
      } catch (error) {
        console.error('Error promoting enemy:', error);
        toast.error('Erro ao promover inimigo');
      }
    }
  };
  
  const handlePromoteAllReady = async () => {
    const readyEnemies = selectedEnemies.filter(e => e.status === 'ready');
    
    if (readyEnemies.length === 0) {
      toast.info('Não há inimigos prontos para promoção.');
      return;
    }
    
    try {
      const enemyIds = readyEnemies.map(e => e.id);
      const promotedEnemies = await bulkPromoteEnemies(enemyIds);
      
      if (promotedEnemies.length > 0) {
        // Update UI
        const updatedEnemies = enemies.map(e => {
          const promotedEnemy = promotedEnemies.find(pe => pe.id === e.id);
          return promotedEnemy || e;
        });
        
        setEnemies(updatedEnemies);
        setSelectedEnemies(updatedEnemies.filter(e => 
          selectedEnemies.some(se => se.id === e.id)
        ));
        
        setShowPromotionBanner(false);
        toast.success(`${promotedEnemies.length} inimigo(s) promovido(s) para a Linha de Frente!`);
      }
    } catch (error) {
      console.error('Error promoting all ready enemies:', error);
      toast.error('Erro ao promover inimigos');
    }
  };
  
  const handleStartQuiz = async (enemy: Enemy) => {
    // Get the questions for this enemy
    const questions = getQuestionsForEnemy(enemy);
    
    if (questions.length === 0) {
      toast.error('Este inimigo não possui questões!');
      return;
    }
    
    // Get a random selection of questions (max 5)
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    const quizQuestions = shuffledQuestions.slice(0, 5);
    
    setActiveEnemyQuiz(enemy);
    setQuizQuestions(quizQuestions);
  };
  
  const handleQuizComplete = (result: QuizResult) => {
    // Reload data to get updated enemy statuses after quiz completion
    loadData();
    
    // Clear the active quiz
    setActiveEnemyQuiz(null);
  };
  
  const getQuestionsForEnemy = (enemy: Enemy): Question[] => {
    const subject = subjects.find(s => s.id === enemy.subjectId);
    if (!subject) return [];
    
    const topic = subject.topics.find(t => t.id === enemy.topicId);
    if (!topic) return [];
    
    if (enemy.subTopicId) {
      const subTopic = topic.subTopics.find(st => st.id === enemy.subTopicId);
      return subTopic ? subTopic.questions : [];
    } else {
      return topic.questions;
    }
  };
  
  // Group enemies by status
  const redRoomEnemies = selectedEnemies.filter(enemy => enemy.status === 'battle');
  const yellowRoomEnemies = selectedEnemies.filter(enemy => enemy.status === 'wounded');
  // Filter out enemies that should be in strategy tab
  const greenRoomEnemies = selectedEnemies.filter(enemy => {
    if (enemy.status !== 'observed') return false;
    // Only include observed enemies that aren't part of the spaced repetition system
    return !enemy.nextReviewDates || enemy.currentReviewIndex === undefined;
  });
  const readyEnemies = selectedEnemies.filter(enemy => enemy.status === 'ready');
  
  // Calculate stats for BattleProgressIndicator
  const masteredSubjects = enemies.filter(e => e.status === 'observed').length;
  const totalSubjects = enemies.length;
  const completedSimulations = getQuizResults().length;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {activeEnemyQuiz ? (
        <QuizSession 
          enemy={activeEnemyQuiz}
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onCancel={() => setActiveEnemyQuiz(null)}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <h1 className="text-2xl font-bold">Campo de Batalha</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowEnemySelector(true)}
                disabled={selectedEnemies.length >= MAX_BATTLEFIELD_ENEMIES}
                className={`btn-warrior-primary flex items-center text-sm px-3 py-1.5 ${
                  selectedEnemies.length >= MAX_BATTLEFIELD_ENEMIES ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isMobile ? 'Adicionar' : 'Adicionar Inimigo'}
              </button>
              <button
                onClick={handleDeleteAllEnemies}
                className="btn-warrior-danger flex items-center text-sm px-3 py-1.5"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isMobile ? 'Apagar' : 'Apagar Todos'}
              </button>
            </div>
          </div>
          
          {/* Battle Progress Indicator */}
          <BattleProgressIndicator 
            masteredSubjects={masteredSubjects}
            totalSubjects={Math.max(1, totalSubjects)}
            completedSimulations={completedSimulations}
            className="mb-6"
          />
          
          {/* Promotion Banner */}
          {showPromotionBanner && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <Flag className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800">Inimigos prontos para a batalha!</h3>
                  <p className="text-sm text-amber-700">
                    Você tem inimigos que estão na Zona de Segurança há muito tempo. Promova-os para a Linha de Frente.
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePromoteAllReady}
                variant="outline"
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
              >
                <MoveUp className="w-4 h-4 mr-2" /> Promover todos
              </Button>
            </div>
          )}
          
          {selectedEnemies.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Swords className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Campo de Batalha Vazio</h2>
              <p className="text-gray-600 mb-6">Adicione inimigos para começar o treinamento!</p>
              <button
                onClick={() => setShowEnemySelector(true)}
                className="btn-warrior-primary"
              >
                Adicionar Inimigo
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Red Room */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 text-warrior-red mr-2" />
                  <h2 className="text-xl font-semibold">Linha de Frente (Vermelha)</h2>
                </div>
                
                {redRoomEnemies.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum inimigo nesta área.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {redRoomEnemies.map((enemy) => (
                      <EnemyCard
                        key={enemy.id}
                        enemy={enemy}
                        onClick={handleStartQuiz}
                        onDelete={handleRemoveEnemy}
                        className="cursor-pointer hover:-translate-y-1 transition-transform"
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Yellow Room */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-warrior-yellow mr-2" />
                  <h2 className="text-xl font-semibold">Linha Avançada (Amarela)</h2>
                </div>
                
                {yellowRoomEnemies.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum inimigo nesta área.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yellowRoomEnemies.map((enemy) => (
                      <EnemyCard
                        key={enemy.id}
                        enemy={enemy}
                        onClick={handleStartQuiz}
                        onDelete={handleRemoveEnemy}
                        className="cursor-pointer hover:-translate-y-1 transition-transform"
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Green Room */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 text-warrior-green mr-2" />
                  <h2 className="text-xl font-semibold">Linha de Contato (Verde)</h2>
                </div>
                
                {greenRoomEnemies.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum inimigo nesta área.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {greenRoomEnemies.map((enemy) => (
                      <EnemyCard
                        key={enemy.id}
                        enemy={enemy}
                        onClick={handleStartQuiz}
                        onDelete={handleRemoveEnemy}
                        className="cursor-pointer hover:-translate-y-1 transition-transform"
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Ready Enemies */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-warrior-blue mr-2" />
                    <h2 className="text-xl font-semibold">Zona de Segurança (Triagem)</h2>
                  </div>
                  
                  {readyEnemies.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePromoteAllReady}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                    >
                      <MoveUp className="w-3 h-3 mr-1" /> Promover todos
                    </Button>
                  )}
                </div>
                
                {readyEnemies.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum inimigo nesta área.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyEnemies.map((enemy) => (
                      <EnemyCard
                        key={enemy.id}
                        enemy={enemy}
                        onClick={handleStartQuiz}
                        onDelete={handleRemoveEnemy}
                        onPromote={handlePromoteEnemy}
                        className="cursor-pointer hover:-translate-y-1 transition-transform"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Enemy selector modal */}
          {showEnemySelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold">Adicionar Inimigo ao Campo de Batalha</h2>
                    <button 
                      onClick={() => setShowEnemySelector(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      aria-label="Fechar"
                    >
                      &times;
                    </button>
                  </div>
                  
                  {/* Subject filter */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">Filtrar por matéria</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        onClick={() => handleSubjectFilter('all')}
                        className={`cursor-pointer ${selectedSubject === 'all' ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                      >
                        Todas
                      </Badge>
                      {subjects.map(subject => (
                        <Badge
                          key={subject.id}
                          onClick={() => handleSubjectFilter(subject.id)}
                          className={`cursor-pointer ${selectedSubject === subject.id ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {getFilteredEnemies().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p>Nenhum inimigo pronto para o campo de batalha.</p>
                      <p>Crie inimigos na aba Inimigos primeiro!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getFilteredEnemies()
                        .map((enemy) => (
                          <EnemyCard 
                            key={enemy.id}
                            enemy={enemy}
                            onClick={handleAddEnemy}
                            className="cursor-pointer hover:border-warrior-blue"
                            hideActions={true}
                          />
                        ))
                      }
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowEnemySelector(false)}
                      className="btn-warrior-outline text-sm px-3 py-1.5"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Battlefield;
