import { useEffect, useState } from "react";
import { getEnemies, getQuizResults, getSubjects } from "@/utils/storage";
import { Enemy, QuizResult, Subject } from "@/utils/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Check, CheckCheck, Flag, Medal, Target, Trophy, Sword, Swords, Crown, ShieldCheck, Rocket, BookmarkCheck, Star, Shield } from "lucide-react";
import AchievementCard from "@/components/conquests/AchievementCard";
import StatsSection from "@/components/conquests/StatsSection";
import JourneyTracker from "@/components/conquests/JourneyTracker";
import JourneyStatsCards from "@/components/conquests/JourneyStatsCards";
import SubjectCard from "@/components/conquests/SubjectCard";
import { StreakDisplay } from "@/components/conquests/StreakDisplay";
import NoDataDisplay from "@/components/conquests/NoDataDisplay";

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
    topicsWithHighConfidence: 0,
    masteredSubjects: 0,
    consecutiveDays: 0,
    totalTopics: 0,
    topicsCompleted: 0,
    questionsPerDay: 0
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
    const studyDays = new Set<string>();
    const perfectDays = new Set<string>();
    const dayResults = new Map<string, { questions: number, correct: number }>();

    fetchedResults.forEach(result => {
      totalQuestions += result.totalQuestions;
      correctAnswers += result.correctAnswers;
      
      if (result.confidenceScore > 0) {
        totalConfidence += result.confidenceScore;
        confidenceCount++;
      }

      // Track study days - ensure we're working with a valid date
      if (result.date) {
        const resultDate = new Date(result.date);
        const dateStr = resultDate.toDateString();
        studyDays.add(dateStr);
        
        // Track questions per day
        if (!dayResults.has(dateStr)) {
          dayResults.set(dateStr, { questions: 0, correct: 0 });
        }
        const dayData = dayResults.get(dateStr);
        if (dayData) {
          dayData.questions += result.totalQuestions;
          dayData.correct += result.correctAnswers;
          dayResults.set(dateStr, dayData);
        }
        
        // Perfect days (100% accuracy)
        if (result.correctAnswers === result.totalQuestions) {
          perfectDays.add(dateStr);
        }
      }
    });

    // Calculate topics with high confidence (>80%)
    const topicsWithHighConfidence = fetchedSubjects.reduce((count, subject) => {
      return count + subject.topics.filter(topic => 
        topic.progress >= 80
      ).length;
    }, 0);

    // Calculate mastered subjects (>90%)
    const masteredSubjects = fetchedSubjects.filter(subject => 
      subject.progress >= 90
    ).length;

    // Calculate total topics and completed topics
    const totalTopics = fetchedSubjects.reduce((sum, subject) => 
      sum + subject.topics.length, 0);
    
    const completedTopics = fetchedSubjects.reduce((sum, subject) => 
      sum + subject.topics.filter(topic => topic.progress >= 85).length, 0);

    // Calculate consecutive days (streak)
    let consecutiveDays = 0;
    if (studyDays.size > 0) {
      // Convert to array of dates and sort
      const sortedDates = Array.from(studyDays)
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sortedDates[0].toDateString() === today.toDateString()) {
        consecutiveDays = 1;
        
        // Check previous days
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

    // Calculate questions per day (average)
    const questionsPerDay = studyDays.size > 0 
      ? totalQuestions / studyDays.size 
      : 0;

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
      perfectDays: perfectDays.size,
      topicsWithHighConfidence,
      masteredSubjects,
      consecutiveDays,
      totalTopics,
      topicsCompleted: completedTopics,
      questionsPerDay
    });
  };

  // Update the formatDate function to properly handle the input type
  const formatDate = (date: unknown): string => {
    if (!date) return '-';
    
    try {
      // Type guard to check if date is a valid input type for Date constructor
      if (
        typeof date === 'string' || 
        date instanceof Date || 
        typeof date === 'number'
      ) {
        return new Date(date).toLocaleDateString('pt-BR');
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    
    return '-';
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
    
    // Recent streak achievement
    if (stats.consecutiveDays >= 3) {
      achievements.push({
        title: "Sequência de Estudos",
        description: `Você estudou por ${stats.consecutiveDays} dias consecutivos!`,
        icon: <Star className="w-6 h-6 text-purple-500" />,
        date: new Date()
      });
    }
    
    // High confidence achievement
    if (stats.averageConfidence >= 80) {
      achievements.push({
        title: "Confiança Elevada",
        description: `Sua média de confiança está em ${stats.averageConfidence.toFixed(1)}%!`,
        icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
        date: new Date()
      });
    }
    
    // Multiple topics completed
    if (stats.topicsCompleted >= 3) {
      achievements.push({
        title: "Dominando os Campos",
        description: `Você completou ${stats.topicsCompleted} tópicos!`,
        icon: <Crown className="w-6 h-6 text-amber-500" />,
        date: new Date()
      });
    }
    
    // Mastery achievement
    if (stats.masteredSubjects > 0) {
      achievements.push({
        title: "Mestre do Conhecimento",
        description: `Você dominou completamente ${stats.masteredSubjects} matéria(s)!`,
        icon: <Rocket className="w-6 h-6 text-indigo-500" />,
        date: new Date()
      });
    }
    
    // Perfect day achievement
    if (stats.perfectDays > 0) {
      achievements.push({
        title: "Dia Perfeito",
        description: `Você teve ${stats.perfectDays} dia(s) com 100% de acertos!`,
        icon: <BookmarkCheck className="w-6 h-6 text-emerald-500" />,
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

    const firstDate = new Date(sortedResults[0]?.date || new Date()); // Add fallback
    const lastDate = new Date(sortedResults[sortedResults.length - 1]?.date || new Date()); // Add fallback
    
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
      daysSinceStart: Math.max(1, daysSinceStart), // Ensure daysSinceStart is at least 1
      studiedToday,
      consistency: stats.studyDays > 0 ? (stats.studyDays / Math.max(1, daysSinceStart)) * 100 : 0
    };
  };
  
  // Get journey data based on progress
  const getJourneyData = () => {
    // Define journey milestones
    const milestones = [
      {
        title: "Aprendiz",
        description: "Você começou sua jornada",
        icon: <Sword className="w-6 h-6 text-gray-500" />,
        required: 0,
        achieved: true
      },
      {
        title: "Escudeiro",
        description: "5 inimigos derrotados",
        icon: <Shield className="w-6 h-6 text-green-500" />,
        required: 5,
        achieved: stats.defeatedEnemies >= 5
      },
      {
        title: "Guerreiro",
        description: "10 inimigos derrotados com confiança",
        icon: <Swords className="w-6 h-6 text-blue-500" />,
        required: 10,
        achieved: stats.topicsWithHighConfidence >= 10
      },
      {
        title: "Comandante",
        description: "3 matérias dominadas",
        icon: <Trophy className="w-6 h-6 text-purple-500" />,
        required: 3,
        achieved: stats.masteredSubjects >= 3
      },
      {
        title: "General",
        description: "15 tópicos com alta confiança",
        icon: <Crown className="w-6 h-6 text-yellow-500" />,
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
    
    // Calculate current level based on achieved milestones
    const achievedCount = milestones.filter(m => m.achieved).length;
    const currentLevel = Math.max(1, achievedCount);
    const nextLevel = currentLevel < milestones.length ? currentLevel + 1 : currentLevel;
    
    // Calculate progress to next level
    let progressToNext = 100;
    if (currentLevel < milestones.length) {
      const currentMilestone = milestones[currentLevel - 1];
      const nextMilestone = milestones[currentLevel];
      
      // Choose the relevant stat for this milestone
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

  const achievements = getRecentAchievements();
  const streakData = getStreakData();
  const journeyData = getJourneyData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-warrior-primary mb-2">Jornada e Conquistas</h1>
        <p className="text-gray-600">Acompanhe seu progresso e celebre suas vitórias</p>
      </div>

      <StatsSection stats={stats} />

      <Tabs defaultValue="achievements">
        <TabsList className="mb-6">
          <TabsTrigger value="achievements">Conquistas Recentes</TabsTrigger>
          <TabsTrigger value="journey">Jornada do Guerreiro</TabsTrigger>
          <TabsTrigger value="subjects">Matérias</TabsTrigger>
          <TabsTrigger value="streak">Consistência</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, i) => (
              <AchievementCard 
                key={i}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                date={achievement.date}
                formatDate={formatDate}
              />
            ))}
            
            {achievements.length === 0 && <NoDataDisplay type="achievements" />}
          </div>
        </TabsContent>
        
        <TabsContent value="journey">
          <JourneyTracker 
            currentLevel={journeyData.currentLevel}
            currentRank={journeyData.currentRank}
            nextLevel={journeyData.nextLevel}
            progressToNext={journeyData.progressToNext}
            milestones={journeyData.milestones}
          />
          
          <JourneyStatsCards stats={stats} subjectsLength={subjects.length} />
        </TabsContent>
        
        <TabsContent value="subjects">
          <div className="space-y-6">
            {subjects.map(subject => (
              <SubjectCard key={subject.id} {...subject} />
            ))}
            
            {subjects.length === 0 && <NoDataDisplay type="subjects" />}
          </div>
        </TabsContent>
        
        <TabsContent value="streak">
          <StreakDisplay streakData={streakData} stats={stats} quizResults={quizResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conquests;
