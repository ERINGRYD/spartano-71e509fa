
import { useState, useEffect } from 'react';

// Character level thresholds based on XP
const LEVELS = [
  { level: 1, name: "Aprendiz Espartano", requiredXp: 0 },
  { level: 2, name: "Soldado Espartano", requiredXp: 101 },
  { level: 3, name: "Hoplita", requiredXp: 301 },
  { level: 4, name: "Guerreiro Elite", requiredXp: 601 },
  { level: 5, name: "Comandante Espartano", requiredXp: 1001 },
  { level: 6, name: "Rei de Esparta", requiredXp: 1501 }
];

// Define character data structure
export type Character = {
  xp: number;
  level: number;
  rankName: string;
  nextLevelXp: number;
  attributes: {
    strength: number;     // Domínio de conteúdo
    agility: number;      // Velocidade de resolução
    resistance: number;   // Consistência nos estudos
    wisdom: number;       // Profundidade de conhecimento
    honor: number;        // Confiança e autoestima
  };
  achievements: string[];
  streakDays: number;
  lastStudyDate: string | null;
  completedChallenges: string[];
};

// Default character state
const DEFAULT_CHARACTER: Character = {
  xp: 0,
  level: 1,
  rankName: "Aprendiz Espartano",
  nextLevelXp: 101,
  attributes: {
    strength: 10,
    agility: 10,
    resistance: 10,
    wisdom: 10,
    honor: 10
  },
  achievements: [],
  streakDays: 0,
  lastStudyDate: null,
  completedChallenges: []
};

// Get the current level based on XP
const getCurrentLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].requiredXp) {
      return {
        level: LEVELS[i].level,
        rankName: LEVELS[i].name,
        nextLevelXp: i < LEVELS.length - 1 ? LEVELS[i + 1].requiredXp : LEVELS[i].requiredXp + 500
      };
    }
  }
  return { level: 1, rankName: LEVELS[0].name, nextLevelXp: LEVELS[1].requiredXp };
};

// Calculate streak days
const calculateStreakDays = (lastStudyDate: string | null): number => {
  if (!lastStudyDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(lastStudyDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If last study was yesterday or today, maintain streak
  if (diffDays <= 1) {
    return lastDate.getTime() === today.getTime() ? 1 : 0;
  }
  return 0;
};

export const useCharacter = () => {
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  
  // Load character data on mount
  useEffect(() => {
    const savedCharacter = localStorage.getItem('spartan-character');
    if (savedCharacter) {
      try {
        const parsedCharacter = JSON.parse(savedCharacter);
        setCharacter(parsedCharacter);
      } catch (e) {
        console.error('Error loading character data:', e);
        setCharacter(DEFAULT_CHARACTER);
      }
    }
  }, []);
  
  // Save character data when it changes
  useEffect(() => {
    localStorage.setItem('spartan-character', JSON.stringify(character));
  }, [character]);
  
  // Add XP and update level if needed
  const addXp = (amount: number) => {
    setCharacter(prev => {
      const newXp = prev.xp + amount;
      const { level, rankName, nextLevelXp } = getCurrentLevel(newXp);
      return {
        ...prev,
        xp: newXp,
        level,
        rankName,
        nextLevelXp
      };
    });
  };
  
  // Update an attribute
  const updateAttribute = (attribute: keyof Character['attributes'], amount: number) => {
    setCharacter(prev => {
      const newValue = Math.max(0, Math.min(100, prev.attributes[attribute] + amount));
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attribute]: newValue
        }
      };
    });
  };
  
  // Record study activity
  const recordStudyActivity = (questionsAnswered: number, correctAnswers: number, timeSpent: number) => {
    const today = new Date().toISOString();
    let xpGained = 0;
    
    // Basic XP for questions
    const easyQuestions = Math.floor(questionsAnswered * 0.3);
    const mediumQuestions = Math.floor(questionsAnswered * 0.5);
    const hardQuestions = questionsAnswered - easyQuestions - mediumQuestions;
    
    xpGained += easyQuestions * 3;
    xpGained += mediumQuestions * 5;
    xpGained += hardQuestions * 10;
    
    // Streak bonus
    let newStreakDays = calculateStreakDays(character.lastStudyDate);
    if (newStreakDays > 0) {
      newStreakDays += 1;
      const streakMultiplier = Math.floor(newStreakDays / 5) + 1;
      xpGained += 2 * streakMultiplier;
    } else {
      newStreakDays = 1; // Today counts as first day of new streak
    }
    
    // Attribute changes
    const strengthChange = Math.floor((correctAnswers / questionsAnswered) * 5);
    const agilityChange = timeSpent < questionsAnswered * 60000 ? 3 : -1;
    const resistanceChange = newStreakDays > character.streakDays ? 3 : 0;
    const wisdomChange = hardQuestions > 0 ? 2 : 1;
    const honorChange = correctAnswers > questionsAnswered * 0.8 ? 2 : correctAnswers < questionsAnswered * 0.5 ? -2 : 0;
    
    // Update character
    setCharacter(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + xpGained,
        streakDays: newStreakDays,
        lastStudyDate: today,
        attributes: {
          strength: Math.max(0, Math.min(100, prev.attributes.strength + strengthChange)),
          agility: Math.max(0, Math.min(100, prev.attributes.agility + agilityChange)),
          resistance: Math.max(0, Math.min(100, prev.attributes.resistance + resistanceChange)),
          wisdom: Math.max(0, Math.min(100, prev.attributes.wisdom + wisdomChange)),
          honor: Math.max(0, Math.min(100, prev.attributes.honor + honorChange)),
        }
      };
      
      // Update level based on new XP
      const { level, rankName, nextLevelXp } = getCurrentLevel(updated.xp);
      updated.level = level;
      updated.rankName = rankName;
      updated.nextLevelXp = nextLevelXp;
      
      return updated;
    });
    
    return xpGained;
  };
  
  // Add an achievement
  const addAchievement = (achievement: string) => {
    setCharacter(prev => {
      if (prev.achievements.includes(achievement)) {
        return prev;
      }
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
        xp: prev.xp + 25 // Bonus XP for new achievement
      };
    });
  };
  
  // Complete a challenge
  const completeChallenge = (challengeId: string, xpReward: number) => {
    setCharacter(prev => {
      if (prev.completedChallenges.includes(challengeId)) {
        return prev;
      }
      return {
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        xp: prev.xp + xpReward
      };
    });
  };
  
  // Reset character (for testing)
  const resetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
  };
  
  return {
    ...character,
    addXp,
    updateAttribute,
    recordStudyActivity,
    addAchievement,
    completeChallenge,
    resetCharacter
  };
};
