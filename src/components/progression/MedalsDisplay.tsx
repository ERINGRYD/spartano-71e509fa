
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal as MedalIcon, Shield, Crown, Sword, Eye, Flag, BookCheck, Star, Trophy, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedalProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  progress?: number;
  className?: string;
  level: string;
}

const MedalItem: React.FC<MedalProps> = ({ title, description, icon, achieved, progress, className, level }) => (
  <div className={`flex items-center p-4 rounded-lg border ${achieved ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' : 'bg-gray-50 border-gray-200'} ${className || ''}`}>
    <div className={`p-2 rounded-full ${achieved ? 'bg-gradient-to-r from-amber-200 to-amber-300' : 'bg-gray-200'}`}>
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <div className="flex justify-between">
        <h3 className={`font-semibold ${achieved ? 'text-amber-900' : 'text-gray-500'}`}>{title}</h3>
        {achieved && (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            {level}
          </Badge>
        )}
      </div>
      <p className={`text-sm ${achieved ? 'text-amber-700' : 'text-gray-400'}`}>{description}</p>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-amber-500 h-1.5 rounded-full" 
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

interface MedalsDisplayProps {
  stats: {
    studyDays: number;
    consecutiveDays: number;
    masteredSubjects: number;
    improvedSubjects?: number;
    patternRecognition?: number;
    totalQuestions: number;
    correctAnswers: number;
    averageAccuracy: number;
    totalEnemies: number;
    defeatedEnemies: number;
    perfectDays?: number;
  };
}

const MedalsDisplay: React.FC<MedalsDisplayProps> = ({ stats }) => {
  // Níveis de medalhas baseados no progresso
  const getMedalLevel = (value: number, thresholds: number[]) => {
    if (value >= thresholds[3]) return "Lendário";
    if (value >= thresholds[2]) return "Ouro";
    if (value >= thresholds[1]) return "Prata";
    if (value >= thresholds[0]) return "Bronze";
    return "Não alcançado";
  };

  // Streak medals
  const streakThresholds = [3, 7, 14, 30];
  const streakLevel = getMedalLevel(stats.consecutiveDays, streakThresholds);
  const streakAchieved = stats.consecutiveDays >= streakThresholds[0];
  
  // Questions answered medals
  const questionsThresholds = [50, 200, 500, 1000];
  const questionsLevel = getMedalLevel(stats.totalQuestions, questionsThresholds);
  const questionsAchieved = stats.totalQuestions >= questionsThresholds[0];
  
  // Accuracy medals
  const accuracyThresholds = [65, 75, 85, 95];
  const accuracyLevel = getMedalLevel(stats.averageAccuracy, accuracyThresholds);
  const accuracyAchieved = stats.averageAccuracy >= accuracyThresholds[0];
  
  // Enemies defeated
  const enemyThresholds = [5, 20, 50, 100];
  const enemyLevel = getMedalLevel(stats.defeatedEnemies, enemyThresholds);
  const enemyAchieved = stats.defeatedEnemies >= enemyThresholds[0];
  
  // Mastery medals
  const masteryThresholds = [1, 3, 5, 10];
  const masteryLevel = getMedalLevel(stats.masteredSubjects, masteryThresholds);
  const masteryAchieved = stats.masteredSubjects >= masteryThresholds[0];
  
  // Study days medals
  const studyDaysThresholds = [5, 15, 30, 60];
  const studyDaysLevel = getMedalLevel(stats.studyDays, studyDaysThresholds);
  const studyDaysAchieved = stats.studyDays >= studyDaysThresholds[0];
  
  // Perfect days
  const perfectDaysThresholds = [1, 3, 7, 15];
  const perfectDaysLevel = getMedalLevel(stats.perfectDays || 0, perfectDaysThresholds);
  const perfectDaysAchieved = (stats.perfectDays || 0) >= perfectDaysThresholds[0];
  
  // Pattern recognition
  const patternThresholds = [60, 70, 80, 90];
  const patternLevel = getMedalLevel(stats.patternRecognition || 0, patternThresholds);
  const patternAchieved = (stats.patternRecognition || 0) >= patternThresholds[0];
  
  // Improved subjects
  const improvedThresholds = [1, 3, 5, 10];
  const improvedLevel = getMedalLevel(stats.improvedSubjects || 0, improvedThresholds);
  const improvedAchieved = (stats.improvedSubjects || 0) >= improvedThresholds[0];

  const medals = [
    {
      title: "Consistência Espartana",
      description: `Mantenha uma sequência de estudo (${stats.consecutiveDays} dias consecutivos)`,
      icon: <Flag className="w-5 h-5 text-amber-700" />,
      achieved: streakAchieved,
      progress: (stats.consecutiveDays / streakThresholds[3]) * 100,
      level: streakLevel
    },
    {
      title: "Guerreiro do Conhecimento",
      description: `Responda um grande número de questões (${stats.totalQuestions} respondidas)`,
      icon: <Shield className="w-5 h-5 text-amber-700" />,
      achieved: questionsAchieved,
      progress: (stats.totalQuestions / questionsThresholds[3]) * 100,
      level: questionsLevel
    },
    {
      title: "Precisão de Arqueiro",
      description: `Mantenha alta precisão nas respostas (${Math.round(stats.averageAccuracy)}%)`,
      icon: <Target className="w-5 h-5 text-amber-700" />,
      achieved: accuracyAchieved,
      progress: (stats.averageAccuracy / accuracyThresholds[3]) * 100,
      level: accuracyLevel
    },
    {
      title: "Dominador de Inimigos",
      description: `Derrote um grande número de inimigos (${stats.defeatedEnemies} derrotados)`,
      icon: <Sword className="w-5 h-5 text-amber-700" />,
      achieved: enemyAchieved,
      progress: (stats.defeatedEnemies / enemyThresholds[3]) * 100,
      level: enemyLevel
    },
    {
      title: "Mestre dos Campos",
      description: `Domine completamente disciplinas (${stats.masteredSubjects} matérias)`,
      icon: <Crown className="w-5 h-5 text-amber-700" />,
      achieved: masteryAchieved,
      progress: (stats.masteredSubjects / masteryThresholds[3]) * 100,
      level: masteryLevel
    },
    {
      title: "Disciplina Diária",
      description: `Estude em muitos dias diferentes (${stats.studyDays} dias)`,
      icon: <BookCheck className="w-5 h-5 text-amber-700" />,
      achieved: studyDaysAchieved,
      progress: (stats.studyDays / studyDaysThresholds[3]) * 100,
      level: studyDaysLevel
    },
    {
      title: "Perfeição em Batalha",
      description: `Dias com 100% de acertos (${stats.perfectDays || 0} dias perfeitos)`,
      icon: <Star className="w-5 h-5 text-amber-700" />,
      achieved: perfectDaysAchieved,
      progress: ((stats.perfectDays || 0) / perfectDaysThresholds[3]) * 100,
      level: perfectDaysLevel
    },
    {
      title: "Olhos de Coruja",
      description: "Identificar padrões em questões da banca",
      icon: <Eye className="w-5 h-5 text-amber-700" />,
      achieved: patternAchieved,
      progress: ((stats.patternRecognition || 0) / patternThresholds[3]) * 100,
      level: patternLevel
    },
    {
      title: "Superação de Obstáculos",
      description: "Superar obstáculos em disciplinas problemáticas",
      icon: <Trophy className="w-5 h-5 text-amber-700" />,
      achieved: improvedAchieved,
      progress: ((stats.improvedSubjects || 0) / improvedThresholds[3]) * 100,
      level: improvedLevel
    },
    {
      title: "Coroa do Conhecimento",
      description: "Conquiste todas as outras medalhas em nível ouro",
      icon: <Award className="w-5 h-5 text-amber-700" />,
      achieved: [streakLevel, questionsLevel, accuracyLevel, enemyLevel, masteryLevel, studyDaysLevel].every(level => 
        ["Ouro", "Lendário"].includes(level)
      ),
      level: "Suprema"
    }
  ];

  // Total de progresso nas medalhas
  const totalMedalProgress = medals.filter(m => m.achieved).length / medals.length * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <MedalIcon className="w-5 h-5 mr-2 text-amber-500" />
          Medalhas e Conquistas
        </CardTitle>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Progresso Geral</span>
          <span>{Math.round(totalMedalProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full" 
            style={{ width: `${totalMedalProgress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 max-h-[500px] overflow-y-auto">
        {medals.map((medal, index) => (
          <MedalItem key={index} {...medal} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MedalsDisplay;
