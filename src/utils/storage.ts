

import { Subject, Enemy, QuizResult, Question } from './types';

const LOCAL_STORAGE_PREFIX = 'warrior_';

// Subjects
export const saveSubjects = (subjects: Subject[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}subjects`, JSON.stringify(subjects));
};

export const saveSubject = (subject: Subject) => {
  const subjects = getSubjects();
  const index = subjects.findIndex(s => s.id === subject.id);
  if (index !== -1) {
    subjects[index] = subject;
  } else {
    subjects.push(subject);
  }
  saveSubjects(subjects);
};

export const getSubjects = (): Subject[] => {
  const subjects = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}subjects`);
  return subjects ? JSON.parse(subjects) : [];
};

export const deleteSubject = (id: string) => {
  const subjects = getSubjects();
  const filteredSubjects = subjects.filter(s => s.id !== id);
  saveSubjects(filteredSubjects);
};

export const deleteAllSubjects = () => {
  saveSubjects([]);
};

// Enemies
export const saveEnemies = (enemies: Enemy[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}enemies`, JSON.stringify(enemies));
};

export const saveEnemy = (enemy: Enemy) => {
  const enemies = getEnemies();
  const index = enemies.findIndex(e => e.id === enemy.id);
  if (index !== -1) {
    enemies[index] = enemy;
  } else {
    enemies.push(enemy);
  }
  saveEnemies(enemies);
};

export const getEnemies = (): Enemy[] => {
  const enemies = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}enemies`);
  return enemies ? JSON.parse(enemies) : [];
};

export const getEnemy = (enemyId: string): Enemy | undefined => {
  const enemies = getEnemies();
  return enemies.find(enemy => enemy.id === enemyId);
};

export const deleteEnemy = (id: string) => {
  const enemies = getEnemies();
  const filteredEnemies = enemies.filter(e => e.id !== id);
  saveEnemies(filteredEnemies);
};

export const deleteAllEnemies = () => {
  saveEnemies([]);
};

// Quiz Results
export const saveQuizResult = (result: QuizResult) => {
  const existingResults = getQuizResults();
  existingResults.push(result);
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}quizResults`, JSON.stringify(existingResults));
};

export const getQuizResults = (): QuizResult[] => {
  const results = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}quizResults`);
  return results ? JSON.parse(results) : [];
};

export const getQuizResultsByEnemyId = (enemyId: string): QuizResult[] => {
  const results = getQuizResults();
  return results.filter(result => result.enemyId === enemyId);
};

// Spaced Repetition Functions
export const getEnemiesToReviewToday = (): Enemy[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const enemies = getEnemies();
  return enemies.filter(enemy => {
    if (!enemy.nextReviewDates || enemy.nextReviewDates.length === 0 || enemy.currentReviewIndex === undefined) {
      return false;
    }
    
    // Handle the nextReviewDates as strings that need to be converted to Date objects
    const nextReviewDateStr = enemy.nextReviewDates[enemy.currentReviewIndex];
    const nextReviewDate = new Date(nextReviewDateStr);
    nextReviewDate.setHours(0, 0, 0, 0);
    
    return nextReviewDate.getTime() <= today.getTime();
  });
};

export const getEnemiesForFutureReview = (): Enemy[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const enemies = getEnemies();
  return enemies.filter(enemy => {
    if (!enemy.nextReviewDates || enemy.nextReviewDates.length === 0 || enemy.currentReviewIndex === undefined) {
      return false;
    }
    
    // Handle the nextReviewDates as strings that need to be converted to Date objects
    const nextReviewDateStr = enemy.nextReviewDates[enemy.currentReviewIndex];
    const nextReviewDate = new Date(nextReviewDateStr);
    nextReviewDate.setHours(0, 0, 0, 0);
    
    return nextReviewDate.getTime() > today.getTime();
  });
};

export const updateEnemyAfterReview = (enemyId: string, result: QuizResult) => {
  const enemy = getEnemy(enemyId);
  if (!enemy) return;
  
  // Update enemy properties based on the review result
  const updatedEnemy: Enemy = {
    ...enemy,
    lastReviewed: new Date().toISOString(), // Store as ISO string
  };
  
  // If this is the first review or all reviews are completed, setup new review schedule
  if (!updatedEnemy.nextReviewDates || !updatedEnemy.currentReviewIndex || updatedEnemy.currentReviewIndex >= updatedEnemy.nextReviewDates.length - 1) {
    // Calculate increasing intervals (1, 3, 7, 14, 30 days)
    const intervals = [1, 3, 7, 14, 30];
    const nextReviewDates = intervals.map(days => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString(); // Store as ISO string
    });
    
    updatedEnemy.nextReviewDates = nextReviewDates;
    updatedEnemy.currentReviewIndex = 0;
  } else {
    // Move to the next review in the schedule
    updatedEnemy.currentReviewIndex = (updatedEnemy.currentReviewIndex || 0) + 1;
  }
  
  // Update success rate and status based on the quiz result
  const successRate = result.correctAnswers / result.totalQuestions;
  
  if (successRate >= 0.8) {
    updatedEnemy.status = 'observed';
  } else if (successRate >= 0.5) {
    updatedEnemy.status = 'wounded';
  } else {
    updatedEnemy.status = 'battle';
  }
  
  // Update enemy in storage
  saveEnemy(updatedEnemy);
};

// Questions (Aggregated from Subjects)
export const getQuestions = (): Question[] => {
  // First, try to get all questions from all subjects
  const subjects = getSubjects();
  const allQuestions: Question[] = [];
  
  // Collect questions from subjects
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      // Add questions directly in the topic
      if (topic.questions && topic.questions.length > 0) {
        allQuestions.push(...topic.questions);
      }
      
      // Add questions from sub-topics
      topic.subTopics.forEach(subTopic => {
        if (subTopic.questions && subTopic.questions.length > 0) {
          allQuestions.push(...subTopic.questions);
        }
      });
    });
  });
  
  return allQuestions;
};

// Clear All Data (for development/testing purposes)
export const clearAllData = () => {
  localStorage.clear();
};

