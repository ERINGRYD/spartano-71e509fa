import { useState, useEffect } from "react";
import { ShieldCheck, Target, Award, Star, BookOpen, Calendar, TrendingUp, Brain, Heart, Trophy, Medal, BarChart, Sword, Cpu, Zap, Shield } from "lucide-react";
import { getSubjects, getEnemies, getQuizResults } from "@/utils/storage";
import { Subject, Enemy, QuizResult } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "@/components/ProgressBar";
import JourneyTracker from "@/components/conquests/JourneyTracker";
import { StreakCard } from "@/components/conquests/StreakDisplay";
import StatsCard from "@/components/skills/StatsCard";
import MedalsDisplay from "@/components/progression/MedalsDisplay";

const Summary = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [characterLevel, setCharacterLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);

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
    masteredSubjects: 0,
    improvedSubjects: 0,
    patternRecognition: 0
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
      
      // Calculate character level based on experience points
      calculateCharacterLevel(fetchedSubjects, fetchedEnemies, fetchedResults);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCharacterLevel = (fetchedSubjects: Subject[], fetchedEnemies: Enemy[], fetchedResults: QuizResult[]) => {
    // Base XP: cada questão correta vale 10 XP, cada inimigo derrotado vale 50 XP, cada dia de estudo vale 20 XP
    const questionsXP = fetchedResults.reduce((total, result) => total + result.correctAnswers * 10, 0);
    const enemiesXP = fetchedEnemies.filter(enemy => enemy.progress >= 80).length * 50;
    const studyDaysXP = new Set(fetchedResults.map(r => new Date(r.date).toDateString())).size * 20;
    
    // Bônus de consistência
    const streakBonus = stats.consecutiveDays * 15;
    
    // Bônus de maestria
    const masteryBonus = fetchedSubjects.filter(subject => subject.progress >= 90).length * 100;
    
    // XP total
    const totalXP = questionsXP + enemiesXP + studyDaysXP + streakBonus + masteryBonus;
    
    // Fórmula para level: nível = 1 + raiz quadrada(totalXP / 100)
    const level = Math.max(1, Math.floor(1 + Math.sqrt(totalXP / 100)));
    
    // XP necessário para o próximo nível
    const currentLevelMinXP = 100 * Math.pow(level - 1, 2);
    const nextLevelMinXP = 100 * Math.pow(level, 2);
    
    setCharacterLevel(level);
    setExperiencePoints(totalXP);
    setNextLevelXP(nextLevelMinXP);
  };

  const calculateStats = (fetchedSubjects: Subject[], fetchedEnemies: Enemy[], fetchedResults: QuizResult[]) => {
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
      return count + subject.topics.filter(topic => topic.progress >= 80).length;
    }, 0);

    // Calcular matérias dominadas (>90%)
    const masteredSubjects = fetchedSubjects.filter(subject => subject.progress >= 90).length;

    // Calcular total de tópicos e tópicos completados
    const totalTopics = fetchedSubjects.reduce((sum, subject) => sum + subject.topics.length, 0);
    const topicsCompleted = fetchedSubjects.reduce((sum, subject) => sum + subject.topics.filter(topic => topic.progress >= 85).length, 0);

    // Calcular dias consecutivos (streak)
    let consecutiveDays = 0;
    if (studyDays.size > 0) {
      const sortedDates = Array.from(studyDays).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());
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

    // Calculate improved subjects (subjects with significant progress improvement)
    const improvedSubjects = fetchedSubjects.filter(subject => {
      const recentResults = fetchedResults
        .filter(r => r.enemyId === subject.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (recentResults.length >= 2) {
        const recentAvg = recentResults.slice(0, 3).reduce((sum, r) => 
          sum + (r.correctAnswers / r.totalQuestions), 0) / Math.min(3, recentResults.length);
        const oldAvg = recentResults.slice(-3).reduce((sum, r) => 
          sum + (r.correctAnswers / r.totalQuestions), 0) / Math.min(3, recentResults.length);
        return recentAvg - oldAvg >= 0.2; // 20% improvement
      }
      return false;
    }).length;

    // Calculate pattern recognition (based on question type success rate)
    const questionPatterns = new Map<string, { total: number, correct: number }>();
    fetchedResults.forEach(result => {
      result.answers.forEach(answer => {
        const pattern = answer.questionId.split('_')[1]; // Assuming pattern/type is encoded in questionId
        if (!questionPatterns.has(pattern)) {
          questionPatterns.set(pattern, { total: 0, correct: 0 });
        }
        const stats = questionPatterns.get(pattern)!;
        stats.total++;
        if (answer.isCorrect) stats.correct++;
      });
    });

    const patternRecognition = Array.from(questionPatterns.values())
      .reduce((acc, { total, correct }) => acc + (correct / total), 0) / 
      Math.max(1, questionPatterns.size) * 100;

    setStats({
      totalEnemies: fetchedEnemies.length,
      defeatedEnemies,
      observedEnemies,
      totalQuestions,
      correctAnswers,
      averageAccuracy: totalQuestions ? correctAnswers / totalQuestions * 100 : 0,
      averageConfidence: fetchedResults.length ? totalConfidence / fetchedResults.length : 0,
      studyDays: studyDays.size,
      consecutiveDays,
      totalTopics,
      topicsCompleted,
      topicsWithHighConfidence,
      masteredSubjects,
      improvedSubjects,
      patternRecognition
    });
  };

  // Obter dados da jornada com base no progresso
  const getJourneyData = () => {
    // Definir marcos da jornada
    const milestones = [{
      title: "Aprendiz",
      description: "Você começou sua jornada",
      icon: <Brain className="w-6 h-6 text-gray-500" />,
      required: 0,
      achieved: true
    }, {
      title: "Escudeiro",
      description: "5 inimigos derrotados",
      icon: <Target className="w-6 h-6 text-green-500" />,
      required: 5,
      achieved: stats.defeatedEnemies >= 5
    }, {
      title: "Guerreiro",
      description: "10 inimigos derrotados com confiança",
      icon: <Trophy className="w-6 h-6 text-blue-500" />,
      required: 10,
      achieved: stats.topicsWithHighConfidence >= 10
    }, {
      title: "Comandante",
      description: "3 matérias dominadas",
      icon: <Medal className="w-6 h-6 text-purple-500" />,
      required: 3,
      achieved: stats.masteredSubjects >= 3
    }, {
      title: "General",
      description: "15 tópicos com alta confiança",
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      required: 15,
      achieved: stats.topicsWithHighConfidence >= 15
    }, {
      title: "Lendário",
      description: "5 matérias completamente dominadas",
      icon: <Star className="w-6 h-6 text-amber-500" />,
      required: 5,
      achieved: stats.masteredSubjects >= 5
    }];

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
      progressToNext = Math.min(100, relevantStat / requiredStat * 100);
    }
    return {
      milestones,
      currentLevel,
      nextLevel,
      progressToNext,
      currentRank: milestones[currentLevel - 1]?.title || "Aprendiz"
    };
  };

  // New function to calculate character attributes
  const calculateCharacterAttributes = () => {
    const attributes = {
      force: {
        value: 0,
        subtitle: 'Domínio do Conteúdo'
      },
      agility: {
        value: 0,
        subtitle: 'Velocidade de Resolução'
      },
      resistance: {
        value: 0,
        subtitle: 'Consistência nos Estudos'
      },
      wisdom: {
        value: 0,
        subtitle: 'Profundidade do Conhecimento'
      },
      honor: {
        value: 0,
        subtitle: 'Confiança e Autoestima'
      }
    };

    // FORÇA: Content mastery
    attributes.force.value = Math.round(stats.topicsWithHighConfidence / (stats.totalTopics || 1) * 100);

    // AGILIDADE: Study speed and consistency
    const avgTimePerQuestion = quizResults.reduce((total, result) => total + result.timeSpent / result.totalQuestions, 0) / quizResults.length;
    attributes.agility.value = Math.round(Math.max(0, Math.min(100, 100 - avgTimePerQuestion / 60 * 10)));

    // RESISTÊNCIA: Study consistency
    attributes.resistance.value = Math.round(stats.consecutiveDays / 30 * 100);

    // SABEDORIA: Knowledge depth
    const uniqueTopics = new Set(quizResults.flatMap(result => result.answers.map(answer => answer.questionId.split('_')[0])));
    attributes.wisdom.value = Math.round(uniqueTopics.size / (stats.totalTopics || 1) * 100);

    // HONRA: Confidence and self-esteem
    attributes.honor.value = Math.round(stats.averageConfidence);
    
    return attributes;
  };
  
  const characterAttributes = calculateCharacterAttributes();

  // Logic to determine character class based on highest attribute
  const determineCharacterClass = () => {
    const attributes = calculateCharacterAttributes();
    const attributeValues = {
      force: attributes.force.value,
      agility: attributes.agility.value,
      resistance: attributes.resistance.value,
      wisdom: attributes.wisdom.value,
      honor: attributes.honor.value
    };
    
    const highestAttribute = Object.entries(attributeValues).reduce(
      (highest, [attr, value]) => value > highest[1] ? [attr, value] : highest, 
      ['', 0]
    )[0];
    
    switch(highestAttribute) {
      case 'force': return { name: 'Guerreiro', icon: <Sword className="w-6 h-6 text-red-500" /> };
      case 'agility': return { name: 'Arqueiro', icon: <Zap className="w-6 h-6 text-blue-500" /> };
      case 'resistance': return { name: 'Guardião', icon: <Shield className="w-6 h-6 text-green-500" /> };
      case 'wisdom': return { name: 'Mago', icon: <Brain className="w-6 h-6 text-purple-500" /> };
      case 'honor': return { name: 'Paladino', icon: <Heart className="w-6 h-6 text-yellow-500" /> };
      default: return { name: 'Aprendiz', icon: <Cpu className="w-6 h-6 text-gray-500" /> };
    }
  };
  
  const characterClass = determineCharacterClass();
  
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
    if (stats.totalTopics > 0 && stats.topicsCompleted / stats.totalTopics < 0.3) {
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
        icon: <BarChart className="w-5 h-5 text-green-500" />
      });
    }
    return advices;
  };

  // Principais áreas de foco (matérias com menor progresso)
  const getFocusAreas = () => {
    if (subjects.length === 0) return [];
    return [...subjects].sort((a, b) => a.progress - b.progress).slice(0, 3).map(subject => ({
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
        description: `${Math.round(stats.defeatedEnemies / stats.totalEnemies * 100)}% do total de inimigos`,
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

  // Calculate experience progress percentage
  const calculateXPProgress = () => {
    if (characterLevel === 1) {
      return (experiencePoints / nextLevelXP) * 100;
    } else {
      const currentLevelMinXP = 100 * Math.pow(characterLevel - 1, 2);
      return ((experiencePoints - currentLevelMinXP) / (nextLevelXP - currentLevelMinXP)) * 100;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Character Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white/10 p-4 rounded-full mr-4">
              {characterClass.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{characterClass.name} Nível {characterLevel}</h1>
              <p className="text-purple-200">Mestre do Conhecimento</p>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-sm mb-1">
              <span>XP: {experiencePoints}</span>
              <span>Próximo nível: {nextLevelXP}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-amber-500 h-2.5 rounded-full" 
                style={{ width: `${calculateXPProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent uppercase tracking-wider text-center">Atributos do Personagem</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="FORÇA" value={`${characterAttributes.force.value}%`} subtitle={characterAttributes.force.subtitle} icon="force" />
        <StatsCard title="AGILIDADE" value={`${characterAttributes.agility.value}%`} subtitle={characterAttributes.agility.subtitle} icon="agility" color="text-blue-500" />
        <StatsCard title="RESISTÊNCIA" value={`${characterAttributes.resistance.value}%`} subtitle={characterAttributes.resistance.subtitle} icon="resistance" color="text-green-500" />
        <StatsCard title="SABEDORIA" value={`${characterAttributes.wisdom.value}%`} subtitle={characterAttributes.wisdom.subtitle} icon="wisdom" color="text-purple-500" />
        <StatsCard title="HONRA" value={`${characterAttributes.honor.value}%`} subtitle={characterAttributes.honor.subtitle} icon="honor" color="text-yellow-500" />
      </div>

      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent uppercase tracking-wider text-center">Conquistas e Medalhas</h2>
      
      <MedalsDisplay stats={stats} />

      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent uppercase tracking-wider text-center">Missões e Desafios</h2>

      <Tabs defaultValue="strategy" className="mb-6">
        <TabsList className="mb-4 bg-gradient-to-r from-purple-100 to-indigo-100">
          <TabsTrigger value="strategy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white">Estratégia</TabsTrigger>
          <TabsTrigger value="focus" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white">Áreas de Foco</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white">Conquistas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getStrategicAdvice().map((advice, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <div className="mr-2 bg-gradient-to-r from-purple-100 to-indigo-100 p-1 rounded-full">
                      {advice.icon}
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {advice.title}
                    </span>
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
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {area.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso Geral</span>
                      <span>{Math.round(area.progress)}%</span>
                    </div>
                    <ProgressBar progress={area.progress} colorClass="bg-gradient-to-r from-blue-500 to-indigo-500" />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{area.completedTopics} de {area.topicsCount} tópicos dominados</p>
                    <p className="mt-2 italic">
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
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <div className="mr-2 bg-gradient-to-r from-purple-100 to-indigo-100 p-1 rounded-full">
                      {achievement.icon}
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {achievement.title}
                    </span>
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
      
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent uppercase tracking-wider text-center">Estatísticas de Batalha</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          progress={stats.totalEnemies > 0 ? stats.defeatedEnemies / stats.totalEnemies * 100 : 0} 
          colorClass="bg-amber-500" 
        />
      </div>
    </div>
  );
};

export default Summary;
