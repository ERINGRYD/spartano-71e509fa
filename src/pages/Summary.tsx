
import { useState, useEffect } from "react";
import { ChartBar, Brain, Trophy, Calendar, Target, BookOpen, Award, Medal, Star } from "lucide-react";
import { getSubjects, getEnemies, getQuizResults } from "@/utils/storage";
import { Subject, Enemy, QuizResult } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "@/components/ProgressBar";
import JourneyTracker from "@/components/conquests/JourneyTracker";
import { StreakCard } from "@/components/conquests/StreakDisplay";

const Summary = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estatísticas calculadas
  const [stats, setStats] = useState({
    totalEnemies: 0,
    defeatedEnemies: 0,
    observedEnemies: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0,
    averageConfidence: 0,
    studyDays: 0,
    consecutiveDays: 0,
    totalTopics: 0,
    topicsCompleted: 0,
    topicsWithHighConfidence: 0,
    masteredSubjects: 0
  });
  
  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setLoading(true);
    
    try {
      const fetchedSubjects = getSubjects();
      const fetchedEnemies = getEnemies();
      const fetchedResults = getQuizResults();
      
      setSubjects(fetchedSubjects);
      setEnemies(fetchedEnemies);
      setQuizResults(fetchedResults);
      
      calculateStats(fetchedSubjects, fetchedEnemies, fetchedResults);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (
    fetchedSubjects: Subject[], 
    fetchedEnemies: Enemy[], 
    fetchedResults: QuizResult[]
  ) => {
    // Inimigos derrotados (progress >= 80%)
    const defeatedEnemies = fetchedEnemies.filter(enemy => enemy.progress >= 80).length;
    
    // Inimigos observados
    const observedEnemies = fetchedEnemies.filter(enemy => enemy.status === 'observed').length;
    
    // Perguntas e respostas
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalConfidence = 0;
    
    // Dias de estudo
    const studyDays = new Set<string>();
    
    fetchedResults.forEach(result => {
      totalQuestions += result.totalQuestions;
      correctAnswers += result.correctAnswers;
      
      if (result.confidenceScore > 0) {
        totalConfidence += result.confidenceScore;
      }
      
      // Registrar dia de estudo
      if (result.date) {
        const dateStr = new Date(result.date).toDateString();
        studyDays.add(dateStr);
      }
    });
    
    // Calcular tópicos com alta confiança (>80%)
    const topicsWithHighConfidence = fetchedSubjects.reduce((count, subject) => {
      return count + subject.topics.filter(topic => 
        topic.progress >= 80
      ).length;
    }, 0);
    
    // Calcular matérias dominadas (>90%)
    const masteredSubjects = fetchedSubjects.filter(subject => 
      subject.progress >= 90
    ).length;
    
    // Calcular total de tópicos e tópicos completados
    const totalTopics = fetchedSubjects.reduce((sum, subject) => 
      sum + subject.topics.length, 0);
    
    const topicsCompleted = fetchedSubjects.reduce((sum, subject) => 
      sum + subject.topics.filter(topic => topic.progress >= 85).length, 0);
    
    // Calcular dias consecutivos (streak)
    let consecutiveDays = 0;
    if (studyDays.size > 0) {
      const sortedDates = Array.from(studyDays)
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime());
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sortedDates[0].toDateString() === today.toDateString()) {
        consecutiveDays = 1;
        
        const oneDayMs = 24 * 60 * 60 * 1000;
        let currentDate = today;
        let checking = true;
        
        while (checking) {
          currentDate = new Date(currentDate.getTime() - oneDayMs);
          const dateString = currentDate.toDateString();
          
          if (studyDays.has(dateString)) {
            consecutiveDays++;
          } else {
            checking = false;
          }
        }
      }
    }
    
    setStats({
      totalEnemies: fetchedEnemies.length,
      defeatedEnemies,
      observedEnemies,
      totalQuestions,
      correctAnswers,
      averageAccuracy: totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0,
      averageConfidence: fetchedResults.length ? totalConfidence / fetchedResults.length : 0,
      studyDays: studyDays.size,
      consecutiveDays,
      totalTopics,
      topicsCompleted,
      topicsWithHighConfidence,
      masteredSubjects
    });
  };
  
  // Obter dados da jornada com base no progresso
  const getJourneyData = () => {
    // Definir marcos da jornada
    const milestones = [
      {
        title: "Aprendiz",
        description: "Você começou sua jornada",
        icon: <Brain className="w-6 h-6 text-gray-500" />,
        required: 0,
        achieved: true
      },
      {
        title: "Escudeiro",
        description: "5 inimigos derrotados",
        icon: <Target className="w-6 h-6 text-green-500" />,
        required: 5,
        achieved: stats.defeatedEnemies >= 5
      },
      {
        title: "Guerreiro",
        description: "10 inimigos derrotados com confiança",
        icon: <Trophy className="w-6 h-6 text-blue-500" />,
        required: 10,
        achieved: stats.topicsWithHighConfidence >= 10
      },
      {
        title: "Comandante",
        description: "3 matérias dominadas",
        icon: <Medal className="w-6 h-6 text-purple-500" />,
        required: 3,
        achieved: stats.masteredSubjects >= 3
      },
      {
        title: "General",
        description: "15 tópicos com alta confiança",
        icon: <Award className="w-6 h-6 text-yellow-500" />,
        required: 15,
        achieved: stats.topicsWithHighConfidence >= 15
      },
      {
        title: "Lendário",
        description: "5 matérias completamente dominadas",
        icon: <Star className="w-6 h-6 text-amber-500" />,
        required: 5,
        achieved: stats.masteredSubjects >= 5
      }
    ];
    
    // Calcular nível atual com base nos marcos alcançados
    const achievedCount = milestones.filter(m => m.achieved).length;
    const currentLevel = Math.max(1, achievedCount);
    const nextLevel = currentLevel < milestones.length ? currentLevel + 1 : currentLevel;
    
    // Calcular progresso para o próximo nível
    let progressToNext = 100;
    if (currentLevel < milestones.length) {
      const nextMilestone = milestones[currentLevel];
      
      // Escolher a estatística relevante para este marco
      let relevantStat = 0;
      let requiredStat = nextMilestone.required;
      
      if (nextMilestone.title === "Escudeiro") {
        relevantStat = stats.defeatedEnemies;
      } else if (nextMilestone.title === "Guerreiro") {
        relevantStat = stats.topicsWithHighConfidence;
      } else if (nextMilestone.title === "Comandante" || nextMilestone.title === "Lendário") {
        relevantStat = stats.masteredSubjects;
      } else if (nextMilestone.title === "General") {
        relevantStat = stats.topicsWithHighConfidence;
      }
      
      progressToNext = Math.min(100, (relevantStat / requiredStat) * 100);
    }
    
    return {
      milestones,
      currentLevel,
      nextLevel,
      progressToNext,
      currentRank: milestones[currentLevel - 1]?.title || "Aprendiz"
    };
  };
  
  const journeyData = getJourneyData();
  
  // Obter conselhos estratégicos com base nas estatísticas
  const getStrategicAdvice = () => {
    const advices = [];
    
    // Conselho baseado na precisão
    if (stats.averageAccuracy < 70) {
      advices.push({
        title: "Precisão Baixa",
        description: "Considere revisar os conceitos básicos antes de avançar para temas mais complexos.",
        icon: <Target className="w-5 h-5 text-red-500" />
      });
    }
    
    // Conselho baseado na confiança
    if (stats.averageConfidence < 60) {
      advices.push({
        title: "Confiança Baixa",
        description: "Pratique mais nos tópicos que você já estudou para aumentar sua confiança.",
        icon: <Award className="w-5 h-5 text-amber-500" />
      });
    }
    
    // Conselho baseado nos tópicos completados
    if (stats.totalTopics > 0 && (stats.topicsCompleted / stats.totalTopics) < 0.3) {
      advices.push({
        title: "Poucos Tópicos Dominados",
        description: "Foque em dominar completamente alguns tópicos antes de avançar para novos.",
        icon: <BookOpen className="w-5 h-5 text-blue-500" />
      });
    }
    
    // Conselho baseado na consistência
    if (stats.consecutiveDays < 3) {
      advices.push({
        title: "Consistência",
        description: "Estude mais regularmente para melhorar sua retenção de conhecimento.",
        icon: <Calendar className="w-5 h-5 text-purple-500" />
      });
    }
    
    // Conselho geral se nenhum problema específico
    if (advices.length === 0) {
      advices.push({
        title: "Estratégia Efetiva",
        description: "Continue com sua estratégia atual. Você está no caminho certo!",
        icon: <ChartBar className="w-5 h-5 text-green-500" />
      });
    }
    
    return advices;
  };
  
  // Principais áreas de foco (matérias com menor progresso)
  const getFocusAreas = () => {
    if (subjects.length === 0) return [];
    
    return [...subjects]
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3)
      .map(subject => ({
        name: subject.name,
        progress: subject.progress,
        topicsCount: subject.topics.length,
        completedTopics: subject.topics.filter(t => t.progress >= 85).length
      }));
  };
  
  // Principais conquistas
  const getTopAchievements = () => {
    const achievements = [];
    
    // Maior sequência de dias
    if (stats.consecutiveDays >= 3) {
      achievements.push({
        title: `${stats.consecutiveDays} dias consecutivos`,
        description: "Você manteve uma sequência de estudos consistente",
        icon: <Calendar className="w-5 h-5 text-purple-500" />
      });
    }
    
    // Matérias dominadas
    if (stats.masteredSubjects > 0) {
      achievements.push({
        title: `${stats.masteredSubjects} ${stats.masteredSubjects === 1 ? 'matéria dominada' : 'matérias dominadas'}`,
        description: "Você alcançou mais de 90% de domínio nestas matérias",
        icon: <BookOpen className="w-5 h-5 text-blue-500" />
      });
    }
    
    // Inimigos derrotados
    if (stats.defeatedEnemies > 0) {
      achievements.push({
        title: `${stats.defeatedEnemies} inimigos derrotados`,
        description: `${Math.round((stats.defeatedEnemies / stats.totalEnemies) * 100)}% do total de inimigos`,
        icon: <Trophy className="w-5 h-5 text-amber-500" />
      });
    }
    
    // Alta precisão
    if (stats.averageAccuracy >= 80) {
      achievements.push({
        title: `${Math.round(stats.averageAccuracy)}% de precisão`,
        description: "Sua taxa de acerto está excelente",
        icon: <Target className="w-5 h-5 text-green-500" />
      });
    }
    
    return achievements;
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Resumo Estratégico</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Nível da Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-warrior-primary">
                  Nível {journeyData.currentLevel}: {journeyData.currentRank}
                </h3>
                <p className="text-gray-500 text-sm">
                  {journeyData.currentLevel < journeyData.milestones.length ? 
                    `Progresso para ${journeyData.milestones[journeyData.currentLevel]?.title}` : 
                    "Nível máximo atingido!"}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                {journeyData.currentLevel}
              </div>
            </div>
            
            {journeyData.currentLevel < journeyData.milestones.length && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(journeyData.progressToNext)}%</span>
                </div>
                <ProgressBar 
                  progress={journeyData.progressToNext}
                  colorClass="bg-gradient-to-r from-purple-500 to-indigo-600"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Precisão</span>
                  <span className="text-sm font-medium">{Math.round(stats.averageAccuracy)}%</span>
                </div>
                <ProgressBar 
                  progress={stats.averageAccuracy}
                  colorClass="bg-green-500"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Confiança</span>
                  <span className="text-sm font-medium">{Math.round(stats.averageConfidence)}%</span>
                </div>
                <ProgressBar 
                  progress={stats.averageConfidence}
                  colorClass="bg-blue-500"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Tópicos Dominados</span>
                  <span className="text-sm font-medium">
                    {stats.topicsCompleted}/{stats.totalTopics}
                  </span>
                </div>
                <ProgressBar 
                  progress={stats.totalTopics > 0 ? (stats.topicsCompleted / stats.totalTopics) * 100 : 0}
                  colorClass="bg-purple-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="strategy" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="strategy">Estratégia</TabsTrigger>
          <TabsTrigger value="focus">Áreas de Foco</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getStrategicAdvice().map((advice, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    {advice.icon}
                    <span className="ml-2">{advice.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {advice.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="focus">
          <div className="space-y-4">
            {getFocusAreas().map((area, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {area.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso Geral</span>
                      <span>{Math.round(area.progress)}%</span>
                    </div>
                    <ProgressBar 
                      progress={area.progress}
                      colorClass="bg-blue-500"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{area.completedTopics} de {area.topicsCount} tópicos dominados</p>
                    <p className="mt-2">
                      Foque em completar mais tópicos nesta matéria para aumentar seu domínio geral.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getFocusAreas().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                <p>Nenhuma matéria cadastrada ainda.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getTopAchievements().map((achievement, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    {achievement.icon}
                    <span className="ml-2">{achievement.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {getTopAchievements().length === 0 && (
              <Card className="col-span-1 md:col-span-2">
                <CardContent className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Continue estudando para desbloquear conquistas!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakCard
          icon={<Calendar className="w-5 h-5 mr-2 text-purple-500" />}
          title="Dias de Estudo"
          value={stats.studyDays}
          description="dias de estudo"
          progress={50}
          colorClass="bg-purple-500"
        />
        
        <StreakCard
          icon={<Target className="w-5 h-5 mr-2 text-green-500" />}
          title="Precisão"
          value={`${Math.round(stats.averageAccuracy)}%`}
          description={`${stats.correctAnswers} de ${stats.totalQuestions} questões`}
          progress={stats.averageAccuracy}
          colorClass="bg-green-500"
        />
        
        <StreakCard
          icon={<Trophy className="w-5 h-5 mr-2 text-amber-500" />}
          title="Inimigos Derrotados"
          value={stats.defeatedEnemies}
          description={`de ${stats.totalEnemies} inimigos`}
          progress={stats.totalEnemies > 0 ? (stats.defeatedEnemies / stats.totalEnemies) * 100 : 0}
          colorClass="bg-amber-500"
        />
      </div>
    </div>
  );
};

export default Summary;
