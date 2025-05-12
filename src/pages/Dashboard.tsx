
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Sword, Target, Trophy, Award, BookOpen, Star, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuizResults, getEnemies, getSubjects } from "@/utils/storage";
import { Enemy, QuizResult, Subject } from "@/utils/types";
import { getCurrentLevel, getNextLevel, getProgressToNextLevel } from "@/utils/progressionSystem";
import { calculateXP } from "@/utils/progressionSystem";
import StatsCard from "@/components/conquests/StatsCard";

const Dashboard = () => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xp, setXP] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const fetchedResults = getQuizResults();
      const fetchedEnemies = getEnemies();
      const fetchedSubjects = getSubjects();
      
      setQuizResults(fetchedResults);
      setEnemies(fetchedEnemies);
      setSubjects(fetchedSubjects);
      
      // Calculate XP
      const calculatedXP = calculateXP(fetchedResults);
      setXP(calculatedXP);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progressToNext = getProgressToNextLevel(xp);
  
  // Calcular estatísticas relevantes
  const totalQuestions = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0);
  const correctAnswers = quizResults.reduce((sum, result) => sum + result.correctAnswers, 0);
  const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const totalEnemies = enemies.length;
  const defeatedEnemies = enemies.filter(e => e.progress >= 80).length;
  
  // Calcular sequência de estudos (streak)
  const calculateStreak = () => {
    if (quizResults.length === 0) return 0;
    
    const dateSet = new Set(quizResults.map(r => new Date(r.date).toDateString()));
    const dates = Array.from(dateSet).map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dates[0].toDateString() !== today.toDateString()) return 0;
    
    let currentStreak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  // Encontrar inimigos prontos para revisão
  const readyEnemies = enemies.filter(e => e.status === 'ready').length;
  
  // Encontrar matérias com baixo progresso
  const lowProgressSubjects = subjects
    .filter(s => s.progress < 50)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);
  
  // Encontrar conquistas recentes
  const recentAchievements = (() => {
    const achievements = [];
    
    // Adicionar conquista se derrotou inimigos recentemente
    if (defeatedEnemies > 0) {
      achievements.push({
        title: "Guerreiro em Ascensão",
        description: `Você derrotou ${defeatedEnemies} inimigos`,
        icon: <Trophy className="w-5 h-5 text-amber-500" />,
      });
    }
    
    // Adicionar conquista baseada na precisão
    if (accuracyRate >= 80) {
      achievements.push({
        title: "Precisão de Arqueiro",
        description: `${Math.round(accuracyRate)}% de acertos em batalha`,
        icon: <Target className="w-5 h-5 text-red-500" />,
      });
    }
    
    // Adicionar conquista baseada em streak
    const streak = calculateStreak();
    if (streak >= 3) {
      achievements.push({
        title: "Disciplina Espartana",
        description: `${streak} dias consecutivos de treino`,
        icon: <Sword className="w-5 h-5 text-purple-500" />,
      });
    }
    
    return achievements;
  })();
  
  // Gerar recomendações de estudo
  const studyRecommendations = (() => {
    const recommendations = [];
    
    // Recomendar revisão de inimigos prontos
    if (readyEnemies > 0) {
      recommendations.push({
        title: "Revisões Pendentes",
        description: `Você tem ${readyEnemies} inimigos prontos para revisão`,
        action: "Revisar Agora",
        icon: <Shield className="w-5 h-5 text-blue-500" />,
        onClick: () => navigate('/')
      });
    }
    
    // Recomendar prática em matérias com baixo progresso
    if (lowProgressSubjects.length > 0) {
      recommendations.push({
        title: "Fortalecer Pontos Fracos",
        description: `Foque em "${lowProgressSubjects[0].name}" para melhorar seu domínio`,
        action: "Praticar",
        icon: <Target className="w-5 h-5 text-red-500" />,
        onClick: () => navigate('/spartan-progress')
      });
    }
    
    // Recomendar simulado completo periodicamente
    if (totalQuestions > 50 && quizResults.length > 5) {
      recommendations.push({
        title: "Simulado Completo",
        description: "É hora de testar seu conhecimento em uma batalha completa",
        action: "Iniciar Simulado",
        icon: <Flag className="w-5 h-5 text-green-500" />,
        onClick: () => navigate('/full-challenge')
      });
    }
    
    return recommendations;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6">
          <h2 className="text-xl text-red-700 mb-2">Erro</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Salve, Guerreiro!</h1>
          <p className="text-gray-600">Aqui está o resumo da sua jornada de hoje</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
          <div className="mr-3 bg-gradient-to-r from-amber-500 to-red-600 p-2 rounded-full text-white">
            {currentLevel.id === "apprentice" && <BookOpen className="h-5 w-5" />}
            {currentLevel.id === "soldier" && <Sword className="h-5 w-5" />}
            {currentLevel.id === "hoplite" && <Shield className="h-5 w-5" />}
            {currentLevel.id === "elite" && <Target className="h-5 w-5" />}
            {currentLevel.id === "commander" && <Award className="h-5 w-5" />}
            {currentLevel.id === "king" && <Trophy className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm text-gray-600">Seu nível atual</p>
            <p className="text-lg font-semibold text-amber-800">{currentLevel.name}</p>
            {nextLevel && (
              <div className="mt-1 flex items-center">
                <div className="flex-grow w-24 bg-gray-200 h-1.5 mr-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" 
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{Math.round(progressToNext)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Batalhas"
          icon={<Sword className="w-5 h-5 mr-2 text-amber-500" />}
          value={quizResults.length}
          description="desafios enfrentados"
          progress={Math.min(100, quizResults.length / 2)}
          theme="spartan"
        />
        
        <StatsCard
          title="Precisão de Combate"
          icon={<Target className="w-5 h-5 mr-2 text-amber-500" />}
          value={`${Math.round(accuracyRate)}%`}
          description={`${correctAnswers}/${totalQuestions} acertos`}
          progress={accuracyRate}
          theme="spartan"
        />
        
        <StatsCard
          title="Inimigos Dominados"
          icon={<Shield className="w-5 h-5 mr-2 text-amber-500" />}
          value={`${defeatedEnemies}`}
          description={`de ${totalEnemies} enfrentados`}
          progress={totalEnemies > 0 ? (defeatedEnemies / totalEnemies) * 100 : 0}
          theme="spartan"
        />
        
        <StatsCard
          title="Dias Consecutivos"
          icon={<Star className="w-5 h-5 mr-2 text-amber-500" />}
          value={calculateStreak()}
          description="dias de treino"
          progress={Math.min(100, calculateStreak() * 10)}
          theme="spartan"
        />
      </div>

      {/* Conteúdo Principal em Layout de Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Recomendações de Estudo */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-amber-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-100">
              <CardTitle className="text-amber-800 flex items-center">
                <Target className="mr-2 h-5 w-5 text-amber-600" />
                Recomendações para Avançar
              </CardTitle>
              <CardDescription>
                Estratégias para melhorar seu desempenho em batalha
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {studyRecommendations.length > 0 ? (
                  studyRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="bg-white p-2 rounded-full mr-3">
                        {rec.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900">{rec.title}</h3>
                        <p className="text-sm text-amber-700">{rec.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700"
                        onClick={rec.onClick}
                      >
                        {rec.action}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="mx-auto h-12 w-12 text-amber-300 mb-2" />
                    <p className="text-amber-800 font-medium">Nenhuma recomendação no momento</p>
                    <p className="text-sm text-amber-600">Continue sua jornada de aprendizado!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Progresso por Matéria */}
          <Card className="border-amber-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-100">
              <CardTitle className="text-amber-800 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-amber-600" />
                Progresso por Matéria
              </CardTitle>
              <CardDescription>
                Seu nível de domínio em cada campo de batalha
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{subject.name}</span>
                        <span className="text-amber-700">{Math.round(subject.progress)}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" 
                        indicatorClassName="bg-gradient-to-r from-amber-500 to-red-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-12 w-12 text-amber-300 mb-2" />
                  <p className="text-amber-800 font-medium">Nenhuma matéria encontrada</p>
                  <p className="text-sm text-amber-600">Adicione matérias para acompanhar seu progresso!</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-amber-50 to-amber-100 border-t border-amber-100">
              <Button 
                onClick={() => navigate('/spartan-progress')}
                variant="outline" 
                className="w-full border-amber-200 hover:bg-amber-100 text-amber-800"
              >
                Ver Progresso Detalhado
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Coluna 2: Conquistas Recentes e Ações Rápidas */}
        <div className="space-y-6">
          {/* Conquistas Recentes */}
          <Card className="border-amber-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-100">
              <CardTitle className="text-amber-800 flex items-center">
                <Award className="mr-2 h-5 w-5 text-amber-600" />
                Conquistas Recentes
              </CardTitle>
              <CardDescription>
                Suas últimas façanhas em batalha
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="bg-white p-2 rounded-full mr-3">
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">{achievement.title}</h3>
                        <p className="text-xs text-amber-700">{achievement.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Award className="mx-auto h-12 w-12 text-amber-300 mb-2" />
                    <p className="text-amber-800 font-medium">Nenhuma conquista recente</p>
                    <p className="text-sm text-amber-600">Continue batalhando para ganhar conquistas!</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-amber-50 to-amber-100 border-t border-amber-100">
              <Button 
                onClick={() => navigate('/spartan-progress')}
                variant="outline" 
                className="w-full border-amber-200 hover:bg-amber-100 text-amber-800"
              >
                Ver Todas as Conquistas
              </Button>
            </CardFooter>
          </Card>

          {/* Ações Rápidas */}
          <Card className="border-amber-100 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-100">
              <CardTitle className="text-amber-800 flex items-center">
                <Sword className="mr-2 h-5 w-5 text-amber-600" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/')} 
                  className="bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 h-auto py-4 flex flex-col"
                >
                  <Shield className="h-5 w-5 mb-1" />
                  <span>Inimigos</span>
                </Button>
                <Button 
                  onClick={() => navigate('/full-challenge')} 
                  className="bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 h-auto py-4 flex flex-col"
                >
                  <Target className="h-5 w-5 mb-1" />
                  <span>Simulados</span>
                </Button>
                <Button 
                  onClick={() => navigate('/spartan-progress')} 
                  className="bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 h-auto py-4 flex flex-col"
                >
                  <Trophy className="h-5 w-5 mb-1" />
                  <span>Progresso</span>
                </Button>
                <Button 
                  onClick={() => navigate('/skills')} 
                  className="bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 h-auto py-4 flex flex-col"
                >
                  <Star className="h-5 w-5 mb-1" />
                  <span>Habilidades</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
