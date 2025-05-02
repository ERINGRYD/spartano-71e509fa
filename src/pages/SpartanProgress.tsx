
import React, { useState, useEffect } from "react";
import { Shield, Sword, CheckCircle, Target, Award } from "lucide-react";
import { getQuizResults } from "@/utils/storage";
import { QuizResult } from "@/utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/conquests/StatsCard";
import { 
  calculateXP, 
  getCurrentLevel, 
  getNextLevel, 
  getProgressToNextLevel 
} from "@/utils/progressionSystem";
import SpartanProfile from "@/components/progression/SpartanProfile";
import XPRewards from "@/components/progression/XPRewards";
import LevelProgressionDisplay from "@/components/progression/LevelProgressionDisplay";

const SpartanProgress: React.FC = () => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXP] = useState(0);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setLoading(true);
    try {
      const fetchedResults = getQuizResults();
      setQuizResults(fetchedResults);
      
      // Calculate XP
      const calculatedXP = calculateXP(fetchedResults);
      setXP(calculatedXP);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progressToNext = getProgressToNextLevel(xp);
  
  // Calculate additional statistics
  const accuracyStats = quizResults.reduce(
    (acc, result) => {
      acc.correct += result.correctAnswers;
      acc.total += result.totalQuestions;
      return acc;
    },
    { correct: 0, total: 0 }
  );
  
  const accuracyPercentage = accuracyStats.total > 0 
    ? Math.round((accuracyStats.correct / accuracyStats.total) * 100) 
    : 0;
    
  const totalQuestions = accuracyStats.total;
  const questionsPerDay = quizResults.length > 0
    ? (totalQuestions / new Set(quizResults.map(r => new Date(r.date).toDateString())).size).toFixed(1)
    : 0;
    
  const streak = (() => {
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
  })();
  
  return (
    <div className="container mx-auto px-4 py-6">
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          <SpartanProfile 
            level={currentLevel}
            xp={xp}
            progressToNext={progressToNext}
            nextLevel={nextLevel}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Questões Respondidas"
              icon={<Target className="w-5 h-5 mr-2 text-amber-500" />}
              value={totalQuestions}
              description="Total de desafios enfrentados"
              progress={Math.min(100, totalQuestions / 5)}
              theme="spartan"
            />
            
            <StatsCard
              title="Precisão de Combate"
              icon={<CheckCircle className="w-5 h-5 mr-2 text-amber-500" />}
              value={`${accuracyPercentage}%`}
              description={`${accuracyStats.correct} acertos em ${accuracyStats.total} ataques`}
              progress={accuracyPercentage}
              theme="spartan"
            />
            
            <StatsCard
              title="Sequência de Batalhas"
              icon={<Sword className="w-5 h-5 mr-2 text-amber-500" />}
              value={streak}
              description="dias consecutivos de treino"
              progress={Math.min(100, streak * 10)}
              theme="spartan"
            />
          </div>
          
          <Tabs defaultValue="levels" className="mb-6">
            <TabsList className="mb-4 bg-gradient-to-r from-amber-100 to-red-100">
              <TabsTrigger value="levels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-red-700 data-[state=active]:text-white">
                Níveis de Evolução
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-red-700 data-[state=active]:text-white">
                Recompensas XP
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="levels">
              <LevelProgressionDisplay currentLevel={currentLevel.id} />
            </TabsContent>
            
            <TabsContent value="rewards">
              <XPRewards />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SpartanProgress;
