import { Subject, Enemy, QuizResult, Question } from './types';

const LOCAL_STORAGE_PREFIX = 'warrior_';

// Subjects
export const saveSubjects = (subjects: Subject[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}subjects`, JSON.stringify(subjects));
};

export const getSubjects = (): Subject[] => {
  const subjects = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}subjects`);
  return subjects ? JSON.parse(subjects) : [];
};

// Enemies
export const saveEnemies = (enemies: Enemy[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}enemies`, JSON.stringify(enemies));
};

export const getEnemies = (): Enemy[] => {
  const enemies = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}enemies`);
  return enemies ? JSON.parse(enemies) : [];
};

export const getEnemy = (enemyId: string): Enemy | undefined => {
  const enemies = getEnemies();
  return enemies.find(enemy => enemy.id === enemyId);
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
