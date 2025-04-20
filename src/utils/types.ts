
export type QuestionType = 'multiple_choice' | 'true_false';

export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  comment?: string;
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  difficulty: 'easy' | 'medium' | 'hard';
  examBoard?: string;
  year?: number;
  organization?: string;
};

export type SubTopic = {
  id: string;
  name: string;
  questions: Question[];
  progress: number;
};

export type Topic = {
  id: string;
  name: string;
  subTopics: SubTopic[];
  questions: Question[];
  progress: number;
};

export type Subject = {
  id: string;
  name: string;
  topics: Topic[];
  progress: number;
};

export type EnemyStatus = 'ready' | 'battle' | 'wounded' | 'observed';

export type Enemy = {
  id: string;
  subjectId: string;
  topicId: string;
  subTopicId?: string;
  name: string;
  status: EnemyStatus;
  progress: number;
  icon: string;
  lastReviewed?: string; // Changed from Date to string for JSON storage
  nextReviewDates?: string[]; // Changed from Date[] to string[] for JSON storage
  currentReviewIndex?: number;
  readySince?: string; // Timestamp when the enemy entered 'ready' status
  autoPromoteEnabled?: boolean; // Whether this enemy should be automatically promoted
  promotionPoints?: number; // Points accumulated toward auto-promotion
};

export type QuizAnswer = {
  questionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  confidenceLevel?: 'certainty' | 'doubt' | 'unknown';
  timeSpent?: number;
};

export type QuizResult = {
  enemyId: string;
  correctAnswers: number;
  totalQuestions: number;
  confidenceScore: number;
  timeSpent: number;
  answers: QuizAnswer[];
  date: string; // Changed from Date to string for JSON storage
};
