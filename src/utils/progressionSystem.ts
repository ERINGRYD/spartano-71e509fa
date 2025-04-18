
import { QuizResult } from "./types";

export type ProgressionLevel = {
  id: string;
  name: string;
  minXP: number;
  maxXP: number;
  description: string;
  equipment: {
    armor: string;
    weapon: string;
    shield: string;
  };
  abilities: string[];
  icon: string;
};

export const progressionLevels: ProgressionLevel[] = [
  {
    id: "apprentice",
    name: "Aprendiz Espartano",
    minXP: 0,
    maxXP: 100,
    description: "Iniciando sua jornada de conhecimento",
    equipment: {
      armor: "Túnica básica",
      weapon: "Adaga de treino",
      shield: "Nenhum"
    },
    abilities: ["Acesso às questões básicas"],
    icon: "sword"
  },
  {
    id: "soldier",
    name: "Soldado Espartano",
    minXP: 101,
    maxXP: 300,
    description: "Preparado para os primeiros desafios",
    equipment: {
      armor: "Armadura leve",
      weapon: "Lança pequena",
      shield: "Escudo de madeira"
    },
    abilities: ["Acesso às questões intermediárias", "Bonus de tempo em revisões"],
    icon: "shield"
  },
  {
    id: "hoplite",
    name: "Hoplita",
    minXP: 301,
    maxXP: 600,
    description: "Guerreiro disciplinado e formidável",
    equipment: {
      armor: "Armadura média",
      weapon: "Lança hoplita",
      shield: "Escudo de bronze"
    },
    abilities: ["Acesso às questões avançadas", "Bonus de força em temas dominados"],
    icon: "target"
  },
  {
    id: "elite",
    name: "Guerreiro Elite",
    minXP: 601,
    maxXP: 1000,
    description: "Destaque entre os melhores guerreiros",
    equipment: {
      armor: "Armadura completa",
      weapon: "Lança de guerra",
      shield: "Escudo espartano"
    },
    abilities: ["Acesso a simulados especiais", "Regeneração de energia mais rápida"],
    icon: "trophy"
  },
  {
    id: "commander",
    name: "Comandante Espartano",
    minXP: 1001,
    maxXP: 1500,
    description: "Líder respeitado e estrategista brilhante",
    equipment: {
      armor: "Armadura de ouro",
      weapon: "Lança real",
      shield: "Escudo com emblema real"
    },
    abilities: ["Acesso a todas as questões", "Bonus em todos os atributos durante simulados"],
    icon: "medal"
  },
  {
    id: "king",
    name: "Rei de Esparta",
    minXP: 1501,
    maxXP: Infinity,
    description: "Lendário guerreiro e líder supremo",
    equipment: {
      armor: "Armadura lendária completa",
      weapon: "Lança das Termópilas",
      shield: "Escudo inquebrável"
    },
    abilities: ["Maestria em todas as disciplinas", "Status de \"Pronto para a Batalha Final\""],
    icon: "crown"
  }
];

export const calculateXP = (quizResults: QuizResult[]): number => {
  let totalXP = 0;
  let consecutiveDays = 0;
  const uniqueDays = new Set<string>();
  const dailyQuizzes = new Map<string, { count: number, success: number }>();
  
  // Sort quiz results by date
  const sortedResults = [...quizResults].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Process each quiz result
  sortedResults.forEach(result => {
    const dateStr = new Date(result.date).toDateString();
    uniqueDays.add(dateStr);
    
    // Track daily quizzes for meta achievements
    if (!dailyQuizzes.has(dateStr)) {
      dailyQuizzes.set(dateStr, { count: 0, success: 0 });
    }
    const dailyStats = dailyQuizzes.get(dateStr)!;
    dailyStats.count++;
    if (result.correctAnswers / result.totalQuestions >= 0.8) {
      dailyStats.success++;
    }
    
    // XP for correct answers based on difficulty
    result.answers.forEach(answer => {
      if (answer.isCorrect) {
        // Extract difficulty from questionId if it follows pattern like 'topic_difficulty_id'
        const parts = answer.questionId.split('_');
        const difficulty = parts.length > 1 ? parts[1] : 'easy';
        
        switch(difficulty) {
          case 'hard':
            totalXP += 10;
            break;
          case 'medium':
            totalXP += 5;
            break;
          case 'easy':
          default:
            totalXP += 3;
            break;
        }
      }
    });
    
    // XP for quiz completion
    totalXP += 30; // Base XP for completing a quiz/simulado
    
    // Bonus XP for high scores
    if (result.correctAnswers / result.totalQuestions >= 0.8) {
      totalXP += 50; // Bonus for scoring 80% or higher
    }
  });
  
  // XP for consecutive days streak
  let currentStreak = 0;
  let maxStreak = 0;
  
  const dates = Array.from(uniqueDays).map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
  
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    
    maxStreak = Math.max(maxStreak, currentStreak);
  }
  
  // Add XP based on max streak (2 XP per day with multiplier every 5 days)
  for (let i = 1; i <= maxStreak; i++) {
    const multiplier = Math.floor((i - 1) / 5) + 1;
    totalXP += 2 * multiplier;
  }
  
  // XP for daily goals
  dailyQuizzes.forEach(stats => {
    if (stats.count >= 3) { // If user completed at least 3 quizzes in a day
      totalXP += 5; // Daily goal achievement
    }
  });
  
  // Bonus for subject mastery (we'll calculate this from subjects progress)
  // This would require accessing subject data, but we can approximate it from quiz results
  const uniqueTopics = new Set<string>();
  quizResults.forEach(result => {
    result.answers.forEach(answer => {
      const topicId = answer.questionId.split('_')[0];
      uniqueTopics.add(topicId);
    });
  });
  
  // Approximate subject completion bonus (in a real implementation, you'd check actual completion)
  totalXP += uniqueTopics.size * 10;
  
  return totalXP;
};

export const getCurrentLevel = (xp: number): ProgressionLevel => {
  return progressionLevels.find(level => xp >= level.minXP && xp <= level.maxXP) || progressionLevels[0];
};

export const getNextLevel = (xp: number): ProgressionLevel | null => {
  const currentLevelIndex = progressionLevels.findIndex(level => xp >= level.minXP && xp <= level.maxXP);
  if (currentLevelIndex < progressionLevels.length - 1) {
    return progressionLevels[currentLevelIndex + 1];
  }
  return null;
};

export const getProgressToNextLevel = (xp: number): number => {
  const currentLevel = getCurrentLevel(xp);
  if (currentLevel.id === "king") return 100; // Max level
  
  const progressInCurrentLevel = xp - currentLevel.minXP;
  const currentLevelRange = currentLevel.maxXP - currentLevel.minXP;
  return Math.min(100, (progressInCurrentLevel / currentLevelRange) * 100);
};
