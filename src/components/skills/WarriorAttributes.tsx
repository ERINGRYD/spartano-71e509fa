
import React, { useEffect, useState } from "react";
import { Activity, Clock, Repeat, Brain, Heart, Shield, Target, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizResult, Enemy } from "@/utils/types";
import SubjectProgress from "@/components/skills/SubjectProgress";
import ProgressBar from "@/components/ProgressBar";

type AttributeCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  progress: number;
  colorClass?: string;
};

const AttributeCard: React.FC<AttributeCardProps> = ({ 
  icon, 
  title, 
  value, 
  description, 
  progress, 
  colorClass = "bg-amber-500"
}) => {
  return (
    <Card className="border-2 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <div className="mr-2 bg-gradient-to-r from-amber-100 to-red-100 p-1 rounded-full">
            {icon}
          </div>
          <span className="bg-gradient-to-r from-amber-600 to-red-700 bg-clip-text text-transparent">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-700 bg-clip-text text-transparent">{value}</div>
        <p className="text-xs text-gray-500 italic">{description}</p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${colorClass} h-2.5 rounded-full`} 
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

type WarriorAttributesProps = {
  quizResults: QuizResult[];
  enemies: Enemy[];
};

const WarriorAttributes: React.FC<WarriorAttributesProps> = ({ quizResults, enemies }) => {
  const [subjects, setSubjects] = useState<{ name: string, progress: number }[]>([]);
  
  useEffect(() => {
    // Group quiz results by subjects/enemies
    const subjectMap = new Map<string, { correct: number; total: number; name: string }>();
    
    if (quizResults.length > 0 && enemies.length > 0) {
      quizResults.forEach(result => {
        const enemy = enemies.find(e => e.id === result.enemyId);
        if (enemy) {
          const key = enemy.subjectId;
          if (!subjectMap.has(key)) {
            subjectMap.set(key, { 
              correct: 0, 
              total: 0, 
              name: enemy.name.split(' - ')[0] || enemy.name 
            });
          }
          
          const subject = subjectMap.get(key)!;
          subject.correct += result.correctAnswers;
          subject.total += result.totalQuestions;
        }
      });
    }
    
    // Convert map to array for component
    const subjectArray = Array.from(subjectMap.values())
      .map(subject => ({
        name: subject.name,
        progress: subject.total > 0 ? (subject.correct / subject.total) * 100 : 0
      }))
      .sort((a, b) => b.progress - a.progress);
    
    setSubjects(subjectArray.slice(0, 5)); // Top 5 subjects
  }, [quizResults, enemies]);
  
  // Calculate all attributes based on quiz results
  const calculateAttributes = () => {
    if (quizResults.length === 0) {
      return {
        strength: 0,
        accuracy: 0,
        agility: 0,
        wisdom: 0,
        honor: 0,
        endurance: 0, // Add the missing endurance property
        defeatedEnemies: 0,
        totalEnemies: enemies.length,
        averageAccuracy: 0,
        averageConfidence: 0,
        totalReviews: 0,
        completedReviews: 0,
        studyDays: 0,
        perfectDays: 0,
        consecutiveDays: 0
      };
    }
    
    // Force (Strength) - Content mastery (% correct by theme)
    const strengthByTheme = new Map<string, { correct: number; total: number }>();
    quizResults.forEach(result => {
      const enemy = enemies.find(e => e.id === result.enemyId);
      if (enemy) {
        const key = enemy.topicId;
        if (!strengthByTheme.has(key)) {
          strengthByTheme.set(key, { correct: 0, total: 0 });
        }
        const theme = strengthByTheme.get(key)!;
        theme.correct += result.correctAnswers;
        theme.total += result.totalQuestions;
      }
    });
    
    let themeAccuracySum = 0;
    let themeCount = 0;
    strengthByTheme.forEach(theme => {
      if (theme.total > 0) {
        themeAccuracySum += (theme.correct / theme.total) * 100;
        themeCount++;
      }
    });
    const strength = themeCount > 0 ? themeAccuracySum / themeCount : 0;
    
    // Agility - Resolution speed (average time per question)
    let totalTime = 0;
    let totalQuestionsWithTime = 0;
    quizResults.forEach(result => {
      if (result.timeSpent > 0 && result.totalQuestions > 0) {
        totalTime += result.timeSpent;
        totalQuestionsWithTime += result.totalQuestions;
      }
    });
    
    const avgTimePerQuestion = totalQuestionsWithTime > 0 ? totalTime / totalQuestionsWithTime : 0;
    // Scale: 180 seconds (slow) -> 0%, 30 seconds (fast) -> 100%
    const agility = Math.min(100, Math.max(0, 100 - ((avgTimePerQuestion - 30) / 150) * 100));
    
    // Endurance - Consistency (consecutive active days)
    const studyDays = new Set<string>();
    quizResults.forEach(result => {
      if (result.date) {
        const date = new Date(result.date);
        studyDays.add(date.toDateString());
      }
    });
    
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
    
    // Scale: 1 day -> 10%, 10 days -> 100%
    const endurance = Math.min(100, consecutiveDays * 10);
    
    // Wisdom - Knowledge depth (success on difficult questions)
    let hardCorrect = 0;
    let hardTotal = 0;
    quizResults.forEach(result => {
      // For now, estimate based on 30% of questions being "hard"
      // In future could be based on actual question difficulty
      const estimatedHardQuestions = Math.ceil(result.totalQuestions * 0.3);
      const estimatedHardCorrect = Math.min(
        result.correctAnswers,
        estimatedHardQuestions
      );
      hardTotal += estimatedHardQuestions;
      hardCorrect += estimatedHardCorrect;
    });
    
    const wisdom = hardTotal > 0 ? (hardCorrect / hardTotal) * 100 : 0;
    
    // Honor - Confidence and self-esteem (overall average + persistent attempts)
    let confidenceSum = 0;
    let confidenceCount = 0;
    quizResults.forEach(result => {
      if (result.confidenceScore > 0) {
        confidenceSum += result.confidenceScore;
        confidenceCount++;
      }
    });
    const avgConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;
    
    // Calculate defeated enemies (topics with >80% progress)
    const defeatedEnemies = enemies.filter(enemy => enemy.progress >= 80).length;
    
    // Calculate overall accuracy
    let totalCorrect = 0;
    let totalQuestions = 0;
    quizResults.forEach(result => {
      totalCorrect += result.correctAnswers;
      totalQuestions += result.totalQuestions;
    });
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    // Calculate perfect days (100% accuracy)
    const perfectDays = new Set<string>();
    const dayResults = new Map<string, { correct: number; total: number }>();
    
    quizResults.forEach(result => {
      if (result.date) {
        const date = new Date(result.date);
        const dateStr = date.toDateString();
        
        if (!dayResults.has(dateStr)) {
          dayResults.set(dateStr, { correct: 0, total: 0 });
        }
        
        const day = dayResults.get(dateStr)!;
        day.correct += result.correctAnswers;
        day.total += result.totalQuestions;
      }
    });
    
    dayResults.forEach((result, dateStr) => {
      if (result.total > 0 && result.correct === result.total) {
        perfectDays.add(dateStr);
      }
    });
    
    // Calculate reviews
    const totalReviews = enemies.reduce((sum, enemy) => {
      return sum + (enemy.nextReviewDates?.length || 0);
    }, 0);

    const completedReviews = enemies.reduce((sum, enemy) => {
      return sum + (enemy.currentReviewIndex || 0);
    }, 0);
    
    // Scale honor based on confidence and accuracy
    const honor = (avgConfidence * 0.7) + (accuracy * 0.3);
    
    return {
      strength,
      accuracy,
      agility,
      wisdom,
      honor,
      endurance, // Include the calculated endurance value
      defeatedEnemies,
      totalEnemies: enemies.length,
      averageAccuracy: accuracy,
      averageConfidence: avgConfidence,
      totalReviews,
      completedReviews,
      studyDays: studyDays.size,
      perfectDays: perfectDays.size,
      consecutiveDays
    };
  };
  
  const attrs = calculateAttributes();
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Define colors for attribute cards
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <AttributeCard
          icon={<Activity className="w-5 h-5 text-red-500" />}
          title="Força"
          value={`${Math.round(attrs.strength)}%`}
          description="Domínio do conteúdo"
          progress={attrs.strength}
          colorClass="bg-gradient-to-r from-red-500 to-red-600"
        />
        
        <AttributeCard
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          title="Agilidade"
          value={formatTime(attrs.agility * 1.5)}
          description="Velocidade de resolução"
          progress={attrs.agility}
          colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        
        <AttributeCard
          icon={<Repeat className="w-5 h-5 text-green-500" />}
          title="Resistência"
          value={attrs.consecutiveDays}
          description="Dias consecutivos ativos"
          progress={attrs.endurance}
          colorClass="bg-gradient-to-r from-green-500 to-green-600"
        />
        
        <AttributeCard
          icon={<Brain className="w-5 h-5 text-purple-500" />}
          title="Sabedoria"
          value={`${Math.round(attrs.wisdom)}%`}
          description="Acertos em questões difíceis"
          progress={attrs.wisdom}
          colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        
        <AttributeCard
          icon={<Heart className="w-5 h-5 text-amber-500" />}
          title="Honra"
          value={`${Math.round(attrs.honor)}%`}
          description="Confiança e persistência"
          progress={attrs.honor}
          colorClass="bg-gradient-to-r from-amber-500 to-amber-600"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Shield className="w-5 h-5 mr-2 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-600 to-red-700 bg-clip-text text-transparent">
                  Estatísticas de Batalha
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Inimigos Derrotados</span>
                    <span className="text-sm">{attrs.defeatedEnemies} / {attrs.totalEnemies}</span>
                  </div>
                  <ProgressBar 
                    progress={attrs.totalEnemies > 0 ? (attrs.defeatedEnemies / attrs.totalEnemies) * 100 : 0}
                    colorClass="bg-amber-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Precisão de Combate</span>
                    <span className="text-sm">{Math.round(attrs.averageAccuracy)}%</span>
                  </div>
                  <ProgressBar 
                    progress={attrs.averageAccuracy}
                    colorClass="bg-red-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Nível de Confiança</span>
                    <span className="text-sm">{Math.round(attrs.averageConfidence)}%</span>
                  </div>
                  <ProgressBar 
                    progress={attrs.averageConfidence}
                    colorClass="bg-green-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Revisões Completas</span>
                    <span className="text-sm">
                      {attrs.completedReviews} / {attrs.totalReviews}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={attrs.totalReviews > 0 ? (attrs.completedReviews / attrs.totalReviews) * 100 : 0}
                    colorClass="bg-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Target className="w-5 h-5 mr-2 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-600 to-red-700 bg-clip-text text-transparent">
                  Consistência de Estudo
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Dias de Estudo</span>
                    <span className="text-sm">{attrs.studyDays}</span>
                  </div>
                  <ProgressBar 
                    progress={Math.min(100, attrs.studyDays * 5)}
                    colorClass="bg-purple-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Dias Perfeitos</span>
                    <span className="text-sm">
                      {attrs.perfectDays} / {attrs.studyDays}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={attrs.studyDays > 0 ? (attrs.perfectDays / attrs.studyDays) * 100 : 0}
                    colorClass="bg-amber-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Sequência Atual</span>
                    <span className="text-sm">{attrs.consecutiveDays} dias</span>
                  </div>
                  <ProgressBar 
                    progress={Math.min(100, attrs.consecutiveDays * 10)}
                    colorClass="bg-green-500"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-amber-500" />
                      <span className="text-sm font-medium">
                        {attrs.studyDays > 0 
                          ? `${Math.round((attrs.studyDays / Math.max(attrs.consecutiveDays, 7)) * 100)}% de consistência` 
                          : 'Sem dados de consistência'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <SubjectProgress 
            subjects={subjects} 
            colors={colors} 
          />
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Dicas de Melhoria</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Força</h4>
                <p className="text-sm text-gray-600">
                  {attrs.strength < 50 
                    ? "Foque em revisar os temas com desempenho mais baixo." 
                    : "Continue revisando periodicamente para manter o conhecimento."}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Agilidade</h4>
                <p className="text-sm text-gray-600">
                  {attrs.agility < 50 
                    ? "Pratique mais para aumentar sua velocidade de resolução." 
                    : "Sua velocidade está boa, mantenha o ritmo!"}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Resistência</h4>
                <p className="text-sm text-gray-600">
                  {attrs.consecutiveDays < 3 
                    ? "Tente estudar um pouco todos os dias para criar consistência." 
                    : "Excelente consistência! Continue com o hábito diário."}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Próximos passos</h4>
                <p className="text-sm text-gray-600">
                  {attrs.defeatedEnemies < 3 
                    ? "Foque em derrotar completamente alguns inimigos." 
                    : "Revise os inimigos derrotados e busque novos desafios."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorAttributes;
