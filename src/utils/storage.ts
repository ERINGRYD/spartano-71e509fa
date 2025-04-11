
import { Subject, Enemy, QuizResult, QuestionType, EnemyStatus } from './types';
import { toast } from 'sonner';

// Local storage keys
const SUBJECTS_KEY = 'battle_prep_subjects';
const ENEMIES_KEY = 'battle_prep_enemies';
const QUIZ_RESULTS_KEY = 'battle_prep_quiz_results';

// Helper function to safely parse JSON
const safelyParseJSON = <T>(json: string | null, defaultValue: T): T => {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Error parsing JSON from local storage:', e);
    return defaultValue;
  }
};

// Get all subjects
export const getSubjects = (): Subject[] => {
  return safelyParseJSON<Subject[]>(localStorage.getItem(SUBJECTS_KEY), []);
};

// Save all subjects
export const saveSubjects = (subjects: Subject[]): void => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

// Get subject by ID
export const getSubjectById = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find((subject) => subject.id === id);
};

// Add or update subject
export const saveSubject = (subject: Subject): void => {
  const subjects = getSubjects();
  const index = subjects.findIndex((s) => s.id === subject.id);
  
  // Check for duplicate subject name
  const isDuplicate = subjects.some(s => s.name === subject.name && s.id !== subject.id);
  if (isDuplicate) {
    toast.error('Um assunto com este nome já existe!');
    return;
  }

  if (index !== -1) {
    subjects[index] = subject;
  } else {
    subjects.push(subject);
  }
  
  saveSubjects(subjects);
};

// Delete subject by ID
export const deleteSubject = (id: string): void => {
  const subjects = getSubjects().filter((subject) => subject.id !== id);
  saveSubjects(subjects);
  
  // Also remove all enemies associated with this subject
  const enemies = getEnemies().filter((enemy) => enemy.subjectId !== id);
  saveEnemies(enemies);
};

// Delete all subjects
export const deleteAllSubjects = (): void => {
  localStorage.removeItem(SUBJECTS_KEY);
  localStorage.removeItem(ENEMIES_KEY);
  localStorage.removeItem(QUIZ_RESULTS_KEY);
};

// Get all enemies
export const getEnemies = (): Enemy[] => {
  return safelyParseJSON<Enemy[]>(localStorage.getItem(ENEMIES_KEY), []);
};

// Save all enemies
export const saveEnemies = (enemies: Enemy[]): void => {
  localStorage.setItem(ENEMIES_KEY, JSON.stringify(enemies));
};

// Get enemy by ID
export const getEnemyById = (id: string): Enemy | undefined => {
  const enemies = getEnemies();
  return enemies.find((enemy) => enemy.id === id);
};

// Add or update enemy
export const saveEnemy = (enemy: Enemy): void => {
  const enemies = getEnemies();
  const index = enemies.findIndex((e) => e.id === enemy.id);
  
  // Check for duplicate enemy name
  const isDuplicate = enemies.some(e => e.name === enemy.name && e.id !== enemy.id);
  if (isDuplicate) {
    toast.error('Um inimigo com este nome já existe!');
    return;
  }
  
  if (index !== -1) {
    enemies[index] = enemy;
  } else {
    enemies.push(enemy);
  }
  
  saveEnemies(enemies);
};

// Delete enemy by ID
export const deleteEnemy = (id: string): void => {
  const enemies = getEnemies().filter((enemy) => enemy.id !== id);
  saveEnemies(enemies);
};

// Delete all enemies
export const deleteAllEnemies = (): void => {
  localStorage.removeItem(ENEMIES_KEY);
};

// Get all quiz results
export const getQuizResults = (): QuizResult[] => {
  return safelyParseJSON<QuizResult[]>(localStorage.getItem(QUIZ_RESULTS_KEY), []);
};

// Save a quiz result
export const saveQuizResult = (result: QuizResult): void => {
  const results = getQuizResults();
  results.push(result);
  localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  
  // Update enemy progress based on quiz results
  updateEnemyProgress(result);
};

// Get quiz results by enemy ID
export const getQuizResultsByEnemyId = (enemyId: string): QuizResult[] => {
  const results = getQuizResults();
  return results.filter((result) => result.enemyId === enemyId);
};

// Helper to update enemy progress based on quiz results
const updateEnemyProgress = (result: QuizResult): void => {
  const enemy = getEnemyById(result.enemyId);
  if (!enemy) return;
  
  // Calculate accuracy percent
  const accuracyPercent = (result.correctAnswers / result.totalQuestions) * 100;
  
  // Determine confidence percent based on answers
  const confidentAnswers = result.answers.filter(a => 
    a.isCorrect && a.confidenceLevel === 'certainty'
  ).length;
  
  const confidencePercent = result.correctAnswers > 0 
    ? (confidentAnswers / result.correctAnswers) * 100
    : 0;
  
  // Calculate new progress
  const newProgress = Math.min(100, Math.max(0, 
    enemy.progress + (accuracyPercent * 0.5) + (confidencePercent * 0.5)
  ) / 2);
  
  // Update enemy status based on quiz performance
  let newStatus: EnemyStatus = enemy.status;
  let nextReviewDates: Date[] = [];
  
  if (accuracyPercent >= 80 && confidencePercent >= 80) {
    // To battle strategy (observation)
    newStatus = 'observed';
    
    // Set up spaced repetition dates
    const today = new Date();
    nextReviewDates = [
      today,
      new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),  // +1 day
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),  // +7 days
      new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // +15 days
      new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)  // +30 days
    ];
  } else if (accuracyPercent >= 80 && confidencePercent >= 60 && confidencePercent < 80) {
    // To green room
    newStatus = 'wounded';
  } else if (accuracyPercent >= 60 && accuracyPercent < 80 && confidencePercent >= 60) {
    // To yellow room
    newStatus = 'wounded';
  } else {
    // To red room
    newStatus = 'battle';
  }
  
  // Update the enemy
  saveEnemy({
    ...enemy,
    progress: newProgress,
    status: newStatus,
    lastReviewed: new Date(),
    nextReviewDates: nextReviewDates.length > 0 ? nextReviewDates : enemy.nextReviewDates,
    currentReviewIndex: nextReviewDates.length > 0 ? 0 : enemy.currentReviewIndex
  });
  
  // Also update progress in the subject/topic/subtopic
  updateSubjectProgress(enemy.subjectId, enemy.topicId, enemy.subTopicId);
};

// Helper to update progress in subjects/topics/subtopics
const updateSubjectProgress = (
  subjectId: string, 
  topicId: string, 
  subTopicId?: string
): void => {
  const subjects = getSubjects();
  const subjectIndex = subjects.findIndex(s => s.id === subjectId);
  
  if (subjectIndex === -1) return;
  
  const subject = subjects[subjectIndex];
  const topicIndex = subject.topics.findIndex(t => t.id === topicId);
  
  if (topicIndex === -1) return;
  
  const topic = subject.topics[topicIndex];
  
  // Update subtopic progress if provided
  if (subTopicId) {
    const subTopicIndex = topic.subTopics.findIndex(st => st.id === subTopicId);
    if (subTopicIndex !== -1) {
      // Calculate subtopic progress (average of all question results)
      const results = getQuizResults();
      const subtopicResults = results.filter(r => {
        const enemy = getEnemyById(r.enemyId);
        return enemy?.subTopicId === subTopicId;
      });
      
      if (subtopicResults.length > 0) {
        const avgCorrect = subtopicResults.reduce((sum, r) => 
          sum + (r.correctAnswers / r.totalQuestions), 0) / subtopicResults.length;
        topic.subTopics[subTopicIndex].progress = avgCorrect * 100;
      }
    }
  }
  
  // Recalculate topic progress (average of subtopics + direct topic questions)
  if (topic.subTopics.length > 0) {
    const subTopicsProgress = topic.subTopics.reduce((sum, st) => sum + st.progress, 0);
    topic.progress = topic.subTopics.length > 0 
      ? subTopicsProgress / topic.subTopics.length
      : 0;
  } else {
    // Calculate topic progress from direct questions
    const results = getQuizResults();
    const topicResults = results.filter(r => {
      const enemy = getEnemyById(r.enemyId);
      return enemy?.topicId === topicId && !enemy?.subTopicId;
    });
    
    if (topicResults.length > 0) {
      const avgCorrect = topicResults.reduce((sum, r) => 
        sum + (r.correctAnswers / r.totalQuestions), 0) / topicResults.length;
      topic.progress = avgCorrect * 100;
    }
  }
  
  // Recalculate subject progress (average of topics)
  const topicsProgress = subject.topics.reduce((sum, t) => sum + t.progress, 0);
  subject.progress = subject.topics.length > 0
    ? topicsProgress / subject.topics.length
    : 0;
  
  // Save updated subjects
  subjects[subjectIndex] = subject;
  saveSubjects(subjects);
};

// Get enemies due for review today
export const getEnemiesToReviewToday = (): Enemy[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getEnemies().filter(enemy => {
    if (!enemy.nextReviewDates || enemy.nextReviewDates.length === 0 || 
        enemy.currentReviewIndex === undefined || 
        enemy.currentReviewIndex >= enemy.nextReviewDates.length) {
      return false;
    }
    
    const nextReviewDate = new Date(enemy.nextReviewDates[enemy.currentReviewIndex]);
    nextReviewDate.setHours(0, 0, 0, 0);
    
    return nextReviewDate.getTime() <= today.getTime();
  });
};

// Get enemies for future review
export const getEnemiesForFutureReview = (): Enemy[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getEnemies().filter(enemy => {
    if (!enemy.nextReviewDates || enemy.nextReviewDates.length === 0 || 
        enemy.currentReviewIndex === undefined || 
        enemy.currentReviewIndex >= enemy.nextReviewDates.length) {
      return false;
    }
    
    const nextReviewDate = new Date(enemy.nextReviewDates[enemy.currentReviewIndex]);
    nextReviewDate.setHours(0, 0, 0, 0);
    
    return nextReviewDate.getTime() > today.getTime();
  });
};

// Update enemy after review
export const updateEnemyAfterReview = (enemyId: string, result: QuizResult): void => {
  const enemy = getEnemyById(enemyId);
  if (!enemy || !enemy.nextReviewDates || enemy.currentReviewIndex === undefined) return;
  
  // Calculate accuracy and confidence percentages
  const accuracyPercent = (result.correctAnswers / result.totalQuestions) * 100;
  const confidentAnswers = result.answers.filter(a => 
    a.isCorrect && a.confidenceLevel === 'certainty'
  ).length;
  const confidencePercent = result.correctAnswers > 0 
    ? (confidentAnswers / result.correctAnswers) * 100
    : 0;
  
  // If performance is good, move to next review date
  if (accuracyPercent >= 80 && confidencePercent >= 80) {
    // Move to next review date if not at the end
    if (enemy.currentReviewIndex < enemy.nextReviewDates.length - 1) {
      saveEnemy({
        ...enemy,
        currentReviewIndex: enemy.currentReviewIndex + 1,
        lastReviewed: new Date()
      });
    } else {
      // Completed all reviews, reset the review cycle with new dates
      const today = new Date();
      const nextReviewDates = [
        today,
        new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
        new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      ];
      
      saveEnemy({
        ...enemy,
        nextReviewDates,
        currentReviewIndex: 1, // Skip today, next review tomorrow
        lastReviewed: today
      });
    }
  } else {
    // Poor performance, reset the current review date to retry
    saveEnemy({
      ...enemy,
      lastReviewed: new Date()
    });
  }
};

// Export a sample file for import
export const generateSampleImportFile = (type: QuestionType): string => {
  let content = '';
  
  if (type === 'multiple_choice') {
    content = `{
  "name": "Matemática",
  "topics": [
    {
      "name": "Álgebra",
      "questions": [
        {
          "text": "Qual é a solução da equação x² - 5x + 6 = 0?",
          "type": "multiple_choice",
          "options": [
            {
              "text": "x = 2 e x = 3",
              "isCorrect": true,
              "comment": "Usando a fatoração: x² - 5x + 6 = (x-2)(x-3) = 0, portanto x = 2 ou x = 3"
            },
            {
              "text": "x = -2 e x = -3",
              "isCorrect": false,
              "comment": "Esta resposta está incorreta."
            },
            {
              "text": "x = 1 e x = 6",
              "isCorrect": false,
              "comment": "Esta resposta está incorreta."
            },
            {
              "text": "x = -1 e x = -6",
              "isCorrect": false,
              "comment": "Esta resposta está incorreta."
            }
          ],
          "difficulty": "medium",
          "examBoard": "ENEM",
          "year": 2023,
          "organization": "INEP"
        }
      ],
      "subTopics": [
        {
          "name": "Equações do 2º grau",
          "questions": [
            {
              "text": "Em uma equação do segundo grau ax² + bx + c = 0, como calculamos o discriminante?",
              "type": "multiple_choice",
              "options": [
                {
                  "text": "Δ = b² - 4ac",
                  "isCorrect": true,
                  "comment": "O discriminante é calculado pela fórmula Δ = b² - 4ac"
                },
                {
                  "text": "Δ = b² + 4ac",
                  "isCorrect": false,
                  "comment": "Esta resposta está incorreta."
                },
                {
                  "text": "Δ = 2ac - b²",
                  "isCorrect": false,
                  "comment": "Esta resposta está incorreta."
                },
                {
                  "text": "Δ = 4ac - b²",
                  "isCorrect": false,
                  "comment": "Esta resposta está incorreta."
                }
              ],
              "difficulty": "easy",
              "examBoard": "ENEM",
              "year": 2022,
              "organization": "INEP"
            }
          ]
        }
      ]
    }
  ]
}`;
  } else if (type === 'true_false') {
    content = `{
  "name": "Direito Constitucional",
  "topics": [
    {
      "name": "Direitos Fundamentais",
      "questions": [
        {
          "text": "De acordo com a Constituição Federal de 1988, os direitos sociais incluem educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social e proteção à maternidade e à infância.",
          "type": "true_false",
          "options": [
            {
              "text": "Certo",
              "isCorrect": true,
              "comment": "O artigo 6º da Constituição Federal prevê esses direitos sociais."
            },
            {
              "text": "Errado",
              "isCorrect": false,
              "comment": "Esta resposta está incorreta."
            }
          ],
          "difficulty": "medium",
          "examBoard": "CESPE",
          "year": 2022,
          "organization": "STF"
        }
      ],
      "subTopics": [
        {
          "name": "Direitos Políticos",
          "questions": [
            {
              "text": "No Brasil, o voto é facultativo para os analfabetos, para os maiores de 70 anos e para os maiores de 16 e menores de 18 anos.",
              "type": "true_false",
              "options": [
                {
                  "text": "Certo",
                  "isCorrect": true,
                  "comment": "O artigo 14, § 1º, II da Constituição Federal estabelece a facultatividade do voto para esses grupos."
                },
                {
                  "text": "Errado",
                  "isCorrect": false,
                  "comment": "Esta resposta está incorreta."
                }
              ],
              "difficulty": "easy",
              "examBoard": "CESPE",
              "year": 2021,
              "organization": "TSE"
            }
          ]
        }
      ]
    }
  ]
}`;
  }
  
  return content;
};
