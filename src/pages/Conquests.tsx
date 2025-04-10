
import { useEffect, useState } from "react";
import { getEnemies, getQuizResults, getSubjects } from "@/utils/storage";
import { Enemy, QuizResult, Subject } from "@/utils/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BookOpen, Check, CheckCheck, Flag, Medal, Target, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ProgressBar from "@/components/ProgressBar";

const Conquests = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState({
    totalEnemies: 0,
    defeatedEnemies: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    observedEnemies: 0,
    totalReviews: 0,
    completedReviews: 0,
    averageAccuracy: 0,
    averageConfidence: 0,
    studyDays: 0,
    perfectDays: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const fetchedSubjects = getSubjects();
    const fetchedEnemies = getEnemies();
    const fetchedResults = getQuizResults();

    setSubjects(fetchedSubjects);
    setEnemies(fetchedEnemies);
    setQuizResults(fetchedResults);

    // Calculate statistics
    const defeatedEnemies = fetchedEnemies.filter(enemy => enemy.progress >= 80).length;
    const observedEnemies = fetchedEnemies.filter(enemy => enemy.status === 'observed').length;

    // Get total questions and correct answers
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    // Get unique study days
    const studyDays = new Set();
    const perfectDays = new Set();

    fetchedResults.forEach(result => {
      totalQuestions += result.totalQuestions;
      correctAnswers += result.correctAnswers;
      
      if (result.confidenceScore > 0) {
        totalConfidence += result.confidenceScore;
        confidenceCount++;
      }

      // Track study days
      const dateStr = new Date(result.date).toDateString();
      studyDays.add(dateStr);
      
      // Perfect days (100% accuracy)
      if (result.correctAnswers === result.totalQuestions) {
        perfectDays.add(dateStr);
      }
    });

    // Calculate completion rate for reviews
    const totalReviews = fetchedEnemies.reduce((sum, enemy) => {
      return sum + (enemy.nextReviewDates?.length || 0);
    }, 0);

    const completedReviews = fetchedEnemies.reduce((sum, enemy) => {
      return sum + (enemy.currentReviewIndex || 0);
    }, 0);

    setStats({
      totalEnemies: fetchedEnemies.length,
      defeatedEnemies,
      totalQuestions,
      correctAnswers,
      observedEnemies,
      totalReviews,
      completedReviews,
      averageAccuracy: totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0,
      averageConfidence: confidenceCount ? (totalConfidence / confidenceCount) : 0,
      studyDays: studyDays.size,
      perfectDays: perfectDays.size
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Get most recent achievements
  const getRecentAchievements = () => {
    const achievements = [];

    // Most recent defeated enemy
    const recentDefeated = [...enemies]
      .filter(e => e.status === 'observed' && e.lastReviewed)
      .sort((a, b) => new Date(b.lastReviewed!).getTime() - new Date(a.lastReviewed!).getTime())[0];

    if (recentDefeated) {
      achievements.push({
        title: "Inimigo Derrotado",
        description: `Você derrotou "${recentDefeated.name}"`,
        icon: <Trophy className="w-6 h-6 text-yellow-500" />,
        date: recentDefeated.lastReviewed
      });
    }

    // Best quiz result
    const bestQuiz = [...quizResults]
      .filter(r => r.correctAnswers / r.totalQuestions >= 0.8)
      .sort((a, b) => 
        (b.correctAnswers / b.totalQuestions) - (a.correctAnswers / a.totalQuestions)
      )[0];

    if (bestQuiz) {
      const enemy = enemies.find(e => e.id === bestQuiz.enemyId);
      achievements.push({
        title: "Melhor Resultado",
        description: `${bestQuiz.correctAnswers}/${bestQuiz.totalQuestions} acertos em "${enemy?.name || 'Quiz'}"`,
        icon: <Medal className="w-6 h-6 text-amber-600" />,
        date: bestQuiz.date
      });
    }

    // Most improved subject
    if (subjects.length > 0) {
      const mostImproved = [...subjects].sort((a, b) => b.progress - a.progress)[0];
      
      achievements.push({
        title: "Matéria mais dominada",
        description: `${mostImproved.name} com ${Math.round(mostImproved.progress)}% de progresso`,
        icon: <BookOpen className="w-6 h-6 text-blue-500" />,
        date: new Date()
      });
    }

    return achievements;
  };

  // Get streaks and consistency data
  const getStreakData = () => {
    if (quizResults.length === 0) return null;

    // Sort results by date
    const sortedResults = [...quizResults].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedResults[0].date);
    const lastDate = new Date(sortedResults[sortedResults.length - 1].date);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysSinceStart = Math.round(
      (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if studied today
    const studiedToday = quizResults.some(result => {
      const resultDate = new Date(result.date);
      resultDate.setHours(0, 0, 0, 0);
      return resultDate.getTime() === today.getTime();
    });

    return {
      daysSinceStart,
      studiedToday,
      consistency: stats.studyDays > 0 ? (stats.studyDays / daysSinceStart) * 100 : 0
    };
  };

  const achievements = getRecentAchievements();
  const streakData = getStreakData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-warrior-primary mb-2">Jornada e Conquistas</h1>
        <p className="text-gray-600">Acompanhe seu progresso e celebre suas vitórias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Inimigos Derrotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.defeatedEnemies}</div>
            <p className="text-sm text-gray-500">de {stats.totalEnemies} inimigos</p>
            <ProgressBar 
              progress={stats.totalEnemies > 0 ? (stats.defeatedEnemies / stats.totalEnemies) * 100 : 0}
              className="mt-2"
              colorClass="bg-yellow-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-500" />
              Precisão de Combate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageAccuracy.toFixed(1)}%</div>
            <p className="text-sm text-gray-500">
              {stats.correctAnswers} acertos em {stats.totalQuestions} questões
            </p>
            <ProgressBar 
              progress={stats.averageAccuracy}
              className="mt-2"
              colorClass="bg-red-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Nível de Confiança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageConfidence.toFixed(1)}%</div>
            <p className="text-sm text-gray-500">média nas respostas corretas</p>
            <ProgressBar 
              progress={stats.averageConfidence}
              className="mt-2"
              colorClass="bg-green-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CheckCheck className="w-5 h-5 mr-2 text-blue-500" />
              Revisões Completas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalReviews > 0 
                ? Math.round((stats.completedReviews / stats.totalReviews) * 100) 
                : 0}%
            </div>
            <p className="text-sm text-gray-500">
              {stats.completedReviews} de {stats.totalReviews} revisões
            </p>
            <ProgressBar 
              progress={stats.totalReviews > 0 ? (stats.completedReviews / stats.totalReviews) * 100 : 0}
              className="mt-2"
              colorClass="bg-blue-500"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements">
        <TabsList className="mb-6">
          <TabsTrigger value="achievements">Conquistas Recentes</TabsTrigger>
          <TabsTrigger value="subjects">Matérias</TabsTrigger>
          <TabsTrigger value="streak">Consistência</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-white p-2 rounded-full shadow">
                      {achievement.icon}
                    </div>
                    <span className="text-sm text-gray-500">
                      {achievement.date ? formatDate(achievement.date) : 'Recente'}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-3">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            
            {achievements.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Flag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Nenhuma conquista ainda</h3>
                <p className="text-gray-500 mt-2">
                  Complete seus primeiros quizzes para desbloquear conquistas!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="subjects">
          <div className="space-y-6">
            {subjects.map(subject => (
              <Card key={subject.id}>
                <CardHeader>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>
                    {subject.topics.length} {subject.topics.length === 1 ? 'tópico' : 'tópicos'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Progresso Geral</span>
                    <span className="text-sm font-medium">{Math.round(subject.progress)}%</span>
                  </div>
                  <ProgressBar progress={subject.progress} colorClass="bg-purple-600" />
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Tópicos</h4>
                    <div className="space-y-3">
                      {subject.topics.map(topic => (
                        <div key={topic.id}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate">{topic.name}</span>
                            <span>{Math.round(topic.progress)}%</span>
                          </div>
                          <ProgressBar progress={topic.progress} className="h-1.5 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {subjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Nenhuma matéria encontrada</h3>
                <p className="text-gray-500 mt-2">
                  Adicione matérias na aba "Inimigos" para começar sua jornada!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="streak">
          {streakData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-500" />
                    Dias de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.studyDays}</div>
                  <p className="text-sm text-gray-500">em {streakData.daysSinceStart} dias totais</p>
                  <ProgressBar 
                    progress={streakData.consistency}
                    className="mt-2"
                    colorClass="bg-purple-500"
                  />
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-sm text-gray-500">
                    {streakData.studiedToday ? '✅ Você estudou hoje' : '❓ Você ainda não estudou hoje'}
                  </p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Award className="w-5 h-5 mr-2 text-amber-500" />
                    Dias Perfeitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.perfectDays}</div>
                  <p className="text-sm text-gray-500">100% de acertos</p>
                  <ProgressBar 
                    progress={stats.studyDays > 0 ? (stats.perfectDays / stats.studyDays) * 100 : 0}
                    className="mt-2"
                    colorClass="bg-amber-500"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Award className="w-5 h-5 mr-2 text-emerald-500" />
                    Consistência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(streakData.consistency)}%</div>
                  <p className="text-sm text-gray-500">dos dias estudados</p>
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {[...Array(Math.min(14, streakData.daysSinceStart))].map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (13 - i));
                      const dateStr = date.toDateString();
                      
                      const hasQuiz = quizResults.some(r => {
                        const resultDate = new Date(r.date);
                        return resultDate.toDateString() === dateStr;
                      });
                      
                      return (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-sm ${hasQuiz ? 'bg-emerald-500' : 'bg-gray-200'}`}
                          title={date.toLocaleDateString()}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Sem dados de consistência</h3>
              <p className="text-gray-500 mt-2">
                Complete seus primeiros quizzes para ver seus dados de consistência!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conquests;
