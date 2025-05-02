
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

// Enemy Promotion System
export const updateEnemyStatus = (enemyId: string, newStatus: Enemy['status']) => {
  const enemy = getEnemy(enemyId);
  if (enemy) {
    const updatedEnemy = {
      ...enemy,
      status: newStatus,
      // If moving to ready, track when it became ready
      ...(newStatus === 'ready' && { readySince: new Date().toISOString() }),
    };
    saveEnemy(updatedEnemy);
    return updatedEnemy;
  }
  return null;
};

export const promoteEnemyToBattle = (enemyId: string): Enemy | null => {
  const enemy = getEnemy(enemyId);
  if (enemy && enemy.status === 'ready') {
    const updatedEnemy: Enemy = {
      ...enemy,
      status: 'battle',
      promotionPoints: 0, // Reset promotion points after promotion
    };
    saveEnemy(updatedEnemy);
    return updatedEnemy;
  }
  return null;
};

export const bulkPromoteEnemies = (enemyIds: string[]): Enemy[] => {
  const promotedEnemies: Enemy[] = [];
  
  for (const id of enemyIds) {
    const promotedEnemy = promoteEnemyToBattle(id);
    if (promotedEnemy) {
      promotedEnemies.push(promotedEnemy);
    }
  }
  
  return promotedEnemies;
};

export const getEnemiesToAutoPromote = (): Enemy[] => {
  const now = new Date();
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  
  return getEnemies().filter(enemy => {
    // Check if enemy is in ready status and has been for at least 3 days
    if (enemy.status === 'ready' && enemy.readySince && enemy.autoPromoteEnabled) {
      const readyDate = new Date(enemy.readySince);
      return (now.getTime() - readyDate.getTime()) >= THREE_DAYS_MS;
    }
    return false;
  });
};

export const incrementEnemyPromotionPoints = (enemyId: string, points = 1): Enemy | null => {
  const enemy = getEnemy(enemyId);
  if (enemy && enemy.status === 'ready') {
    const currentPoints = enemy.promotionPoints || 0;
    const updatedEnemy: Enemy = {
      ...enemy,
      promotionPoints: currentPoints + points
    };
    
    // Auto-promote if reached threshold (10 points)
    if (updatedEnemy.promotionPoints >= 10) {
      updatedEnemy.status = 'battle';
      updatedEnemy.promotionPoints = 0;
    }
    
    saveEnemy(updatedEnemy);
    return updatedEnemy;
  }
  return null;
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
    const intervals = [1, 7, 15, 30];
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
  return updatedEnemy;
};

export const updateEnemyAfterQuiz = (enemyId: string, result: QuizResult) => {
  const enemy = getEnemy(enemyId);
  if (!enemy) return;
  
  // Update enemy properties based on the quiz result
  const updatedEnemy: Enemy = {
    ...enemy,
    lastReviewed: new Date().toISOString(),
  };
  
  // Calculate success rate
  const successRate = result.correctAnswers / result.totalQuestions;
  
  // Calculate confidence score
  const correctWithCertainty = result.answers.filter(
    a => a.isCorrect && a.confidenceLevel === 'certainty'
  ).length;
  
  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const confidenceScore = correctAnswers > 0 
    ? (correctWithCertainty / correctAnswers) * 100 
    : 0;
  
  // Update status based on quiz performance and confidence
  if (successRate >= 0.8) {
    if (confidenceScore >= 80) {
      // High success rate and high confidence - observed status with spaced repetition
      updatedEnemy.status = 'observed';
      
      // Setup for spaced repetition review
      const intervals = [1, 7, 15, 30];
      const nextReviewDates = intervals.map(days => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
      });
      
      updatedEnemy.nextReviewDates = nextReviewDates;
      updatedEnemy.currentReviewIndex = 0;
    } else if (confidenceScore >= 60) {
      // High success rate but moderate confidence - green room
      updatedEnemy.status = 'observed';
    } else {
      // High success rate but low confidence - green room
      updatedEnemy.status = 'observed';
    }
  } else if (successRate >= 0.6) {
    if (confidenceScore >= 60) {
      // Moderate success rate and moderate confidence - yellow room
      updatedEnemy.status = 'wounded';
    } else {
      // Moderate success rate but low confidence - red room
      updatedEnemy.status = 'battle';
    }
  } else {
    // Low success rate - always red room
    updatedEnemy.status = 'battle';
  }
  
  // Update enemy in storage
  saveEnemy(updatedEnemy);
  return updatedEnemy;
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

// Update subject progress based on quiz results
export const updateSubjectProgress = (subjectId: string) => {
  const subjects = getSubjects();
  const subjectIndex = subjects.findIndex(s => s.id === subjectId);
  
  if (subjectIndex === -1) return;
  
  const subject = subjects[subjectIndex];
  let totalQuestions = 0;
  let totalAnsweredCorrectly = 0;
  
  // Get all quiz results related to this subject
  const allEnemies = getEnemies().filter(e => e.subjectId === subjectId);
  const allEnemyIds = allEnemies.map(e => e.id);
  const allQuizResults = getQuizResults().filter(r => allEnemyIds.includes(r.enemyId));
  
  // Calculate answered questions for each topic and subtopic
  subject.topics.forEach(topic => {
    // Count questions from the topic itself
    totalQuestions += topic.questions.length;
    
    // Count questions from subtopics
    topic.subTopics.forEach(subTopic => {
      totalQuestions += subTopic.questions.length;
    });
    
    // Find enemies related to this topic
    const topicEnemies = allEnemies.filter(e => e.topicId === topic.id);
    const topicEnemyIds = topicEnemies.map(e => e.id);
    
    // Find quiz results for these enemies
    const topicQuizResults = allQuizResults.filter(r => topicEnemyIds.includes(r.enemyId));
    
    // Count correct answers
    topicQuizResults.forEach(result => {
      totalAnsweredCorrectly += result.correctAnswers;
    });
    
    // Update topic progress
    const topicProgress = totalQuestions > 0 ? 
      Math.min(100, (totalAnsweredCorrectly / totalQuestions) * 100) : 0;
    
    topic.progress = Math.round(topicProgress);
  });
  
  // Update subject progress based on topics
  const subjectProgress = totalQuestions > 0 ?
    Math.min(100, (totalAnsweredCorrectly / totalQuestions) * 100) : 0;
  
  subject.progress = Math.round(subjectProgress);
  
  // Save updated subjects
  subjects[subjectIndex] = subject;
  saveSubjects(subjects);
  
  return subject;
};

// Clear All Data (for development/testing purposes)
export const clearAllData = () => {
  localStorage.clear();
};
