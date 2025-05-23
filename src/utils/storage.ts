
import { Enemy, Subject, Topic, SubTopic, Question, QuizResult, EnemyStatus } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Function to generate spaced repetition review dates
const generateReviewDates = (): string[] => {
  const now = new Date();
  const dates = [];
  
  // 1 day, 3 days, 7 days, 16 days, 35 days, 76 days
  const daysToAdd = [1, 3, 7, 16, 35, 76];
  
  daysToAdd.forEach(days => {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + days);
    dates.push(nextDate.toISOString());
  });
  
  return dates;
};

// Function to get all enemies from local storage
export const getEnemies = (): Enemy[] => {
  const enemies = localStorage.getItem('enemies');
  return enemies ? JSON.parse(enemies) : [];
};

// Function to save an enemy to local storage
export const saveEnemy = async (enemy: Enemy): Promise<Enemy> => {
  const enemies = getEnemies();
  const existingEnemyIndex = enemies.findIndex(e => e.id === enemy.id);
  
  if (existingEnemyIndex > -1) {
    enemies[existingEnemyIndex] = enemy;
  } else {
    enemies.push(enemy);
  }
  
  localStorage.setItem('enemies', JSON.stringify(enemies));
  
  // Also sync with Supabase if user is logged in
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Check if enemy exists in Supabase
      const { data: existingEnemy } = await supabase
        .from('battle_themes')
        .select('*')
        .eq('theme_id', enemy.id)
        .single();
        
      if (existingEnemy) {
        // Update existing enemy
        await supabase
          .from('battle_themes')
          .update({
            status: enemy.status
          })
          .eq('theme_id', enemy.id);
      } else {
        // Insert new enemy
        await supabase
          .from('battle_themes')
          .insert({
            theme_id: enemy.id,
            user_id: session.session.user.id,
            status: enemy.status
          });
      }
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
  
  return enemy; // Return the enemy object directly, not a promise
};

// Function to promote an enemy to battle
export const promoteEnemyToBattle = async (enemyId: string): Promise<Enemy | null> => {
  const enemies = getEnemies();
  const enemy = enemies.find(e => e.id === enemyId);
  
  if (!enemy) return null;
  
  const updatedEnemy = {
    ...enemy,
    status: 'battle' as const,
    readySince: undefined, // Clear readySince when promoted
    promotionPoints: 0 // Reset promotion points
  };
  
  await saveEnemy(updatedEnemy);
  return updatedEnemy;
};

// Function to bulk promote enemies to battle
export const bulkPromoteEnemies = async (enemyIds: string[]): Promise<Enemy[]> => {
  const enemies = getEnemies();
  const updatedEnemies = enemies.map(enemy => {
    if (enemyIds.includes(enemy.id) && enemy.status === 'ready') {
      return {
        ...enemy,
        status: 'battle' as const,
        readySince: undefined, // Clear readySince when promoted
        promotionPoints: 0 // Reset promotion points
      };
    }
    return enemy;
  });
  
  localStorage.setItem('enemies', JSON.stringify(updatedEnemies));
  
  // Sync with Supabase
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      for (const enemyId of enemyIds) {
        const enemy = updatedEnemies.find(e => e.id === enemyId);
        if (enemy) {
          // Check if enemy exists in Supabase
          const { data: existingEnemy } = await supabase
            .from('battle_themes')
            .select('*')
            .eq('theme_id', enemy.id)
            .single();
            
          if (existingEnemy) {
            // Update existing enemy
            await supabase
              .from('battle_themes')
              .update({
                status: enemy.status
              })
              .eq('theme_id', enemy.id);
          } else {
            // Insert new enemy
            await supabase
              .from('battle_themes')
              .insert({
                theme_id: enemy.id,
                user_id: session.session.user.id,
                status: enemy.status
              });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
  
  return updatedEnemies.filter(e => enemyIds.includes(e.id));
};

// Function to increment promotion points for an enemy
export const incrementEnemyPromotionPoints = (enemyId: string) => {
  const enemies = getEnemies();
  const enemyIndex = enemies.findIndex(e => e.id === enemyId);
  
  if (enemyIndex === -1) return;
  
  const enemy = enemies[enemyIndex];
  const updatedEnemy = {
    ...enemy,
    promotionPoints: (enemy.promotionPoints || 0) + 1
  };
  
  enemies[enemyIndex] = updatedEnemy;
  localStorage.setItem('enemies', JSON.stringify(enemies));
};

// Function to move enemy to strategy
export const moveEnemyToStrategy = async (enemyId: string): Promise<Enemy | null> => {
  const enemies = getEnemies();
  const enemy = enemies.find(e => e.id === enemyId);
  
  if (!enemy) return null;
  
  // Definir datas para revisão espaçada (1 dia, 3 dias, 7 dias, etc.)
  const reviewDates = generateReviewDates();
  
  const updatedEnemy = {
    ...enemy,
    status: 'observed' as const,
    currentReviewIndex: 0,
    nextReviewDates: reviewDates,
    readySince: undefined, // Remover o readySince se existir
    promotionPoints: 0 // Resetar pontos de promoção
  };
  
  // Remover do campo de batalha definindo seu status como 'observed'
  await saveEnemy(updatedEnemy);
  
  return updatedEnemy;
};

// Function to get all subjects from local storage
export const getSubjects = (): Subject[] => {
  const subjects = localStorage.getItem('subjects');
  return subjects ? JSON.parse(subjects) : [];
};

// Function to save a subject to local storage
export const saveSubject = (subject: Subject) => {
  const subjects = getSubjects();
  const existingSubjectIndex = subjects.findIndex(s => s.id === subject.id);
  
  if (existingSubjectIndex > -1) {
    subjects[existingSubjectIndex] = subject;
  } else {
    subjects.push(subject);
  }
  
  localStorage.setItem('subjects', JSON.stringify(subjects));
};

// Function to get enemies that should be reviewed today
export const getEnemiesToReviewToday = (): Enemy[] => {
  const enemies = getEnemies();
  
  return enemies.filter(enemy => {
    if (enemy.status !== 'observed' || !enemy.nextReviewDates || enemy.currentReviewIndex === undefined) {
      return false;
    }
    
    const reviewDateStr = enemy.nextReviewDates[enemy.currentReviewIndex];
    if (!reviewDateStr) return false;
    
    const reviewDate = new Date(reviewDateStr);
    const today = new Date();
    
    return (
      reviewDate.getFullYear() === today.getFullYear() &&
      reviewDate.getMonth() === today.getMonth() &&
      reviewDate.getDate() === today.getDate()
    );
  });
};

// Function to get enemies that have future review dates
export const getEnemiesForFutureReview = (): Enemy[] => {
  const enemies = getEnemies();
  
  return enemies.filter(enemy => {
    if (enemy.status !== 'observed' || !enemy.nextReviewDates || enemy.currentReviewIndex === undefined) {
      return false;
    }
    
    const reviewDateStr = enemy.nextReviewDates[enemy.currentReviewIndex];
    if (!reviewDateStr) return false;
    
    const reviewDate = new Date(reviewDateStr);
    const today = new Date();
    
    return reviewDate > today;
  });
};

// Function to update enemy after review
export const updateEnemyAfterReview = (enemyId: string, result: QuizResult): Enemy | null => {
  const enemies = getEnemies();
  const enemyIndex = enemies.findIndex(e => e.id === enemyId);
  
  if (enemyIndex === -1) return null;
  
  const enemy = enemies[enemyIndex];
  
  let updatedEnemy: Enemy;
  
  // Check the success property or calculate it based on correctAnswers/totalQuestions
  const isSuccessful = result.success !== undefined ? 
    result.success : 
    (result.correctAnswers / result.totalQuestions >= 0.7);
  
  if (isSuccessful) {
    // Move to next review date or mark as mastered
    if (enemy.currentReviewIndex !== undefined && enemy.nextReviewDates) {
      if (enemy.currentReviewIndex < enemy.nextReviewDates.length - 1) {
        // Schedule next review
        updatedEnemy = {
          ...enemy,
          currentReviewIndex: enemy.currentReviewIndex + 1
        };
      } else {
        // Mark as mastered
        updatedEnemy = {
          ...enemy,
          status: 'mastered' as EnemyStatus,
          currentReviewIndex: undefined,
          nextReviewDates: undefined
        };
      }
    } else {
      // If no review dates, just mark as mastered
      updatedEnemy = {
        ...enemy,
        status: 'mastered' as EnemyStatus
      };
    }
  } else {
    // Reset review index to 0 to review from the beginning
    updatedEnemy = {
      ...enemy,
      currentReviewIndex: 0
    };
  }
  
  enemies[enemyIndex] = updatedEnemy;
  localStorage.setItem('enemies', JSON.stringify(enemies));
  
  return updatedEnemy;
};

// Function to update enemy after quiz (similar to updateEnemyAfterReview but with different logic)
export const updateEnemyAfterQuiz = async (enemyId: string, result: QuizResult): Promise<Enemy | null> => {
  const enemies = getEnemies();
  const enemyIndex = enemies.findIndex(e => e.id === enemyId);
  
  if (enemyIndex === -1) return null;
  
  const enemy = enemies[enemyIndex];
  const successRate = result.correctAnswers / result.totalQuestions;
  
  let updatedEnemy: Enemy;
  
  if (successRate >= 0.8) {
    // Great performance - move to observed status for spaced repetition
    const reviewDates = generateReviewDates();
    updatedEnemy = {
      ...enemy,
      status: 'observed' as EnemyStatus,
      currentReviewIndex: 0,
      nextReviewDates: reviewDates
    };
  } else if (successRate >= 0.5) {
    // Medium performance - wounded status
    updatedEnemy = {
      ...enemy,
      status: 'wounded' as EnemyStatus
    };
  } else {
    // Poor performance - stays in battle status
    updatedEnemy = {
      ...enemy,
      status: 'battle' as EnemyStatus
    };
  }
  
  enemies[enemyIndex] = updatedEnemy;
  localStorage.setItem('enemies', JSON.stringify(enemies));
  
  // Sync with Supabase
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Check if enemy exists in Supabase
      const { data: existingEnemy } = await supabase
        .from('battle_themes')
        .select('*')
        .eq('theme_id', enemyId)
        .single();
        
      if (existingEnemy) {
        // Update existing enemy
        await supabase
          .from('battle_themes')
          .update({
            status: updatedEnemy.status
          })
          .eq('theme_id', enemyId);
      } else {
        // Insert new enemy
        await supabase
          .from('battle_themes')
          .insert({
            theme_id: enemyId,
            user_id: session.session.user.id,
            status: updatedEnemy.status
          });
      }
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
  
  return updatedEnemy;
};

// Function to get all quiz results
export const getQuizResults = (): QuizResult[] => {
  const results = localStorage.getItem('quizResults');
  return results ? JSON.parse(results) : [];
};

// Function to save a quiz result
export const saveQuizResult = (result: QuizResult) => {
  const results = getQuizResults();
  results.push(result);
  localStorage.setItem('quizResults', JSON.stringify(results));
};

// Function to get quiz results by enemy id
export const getQuizResultsByEnemyId = (enemyId: string): QuizResult[] => {
  const results = getQuizResults();
  return results.filter(result => result.enemyId === enemyId);
};

// Function to delete an enemy
export const deleteEnemy = async (enemyId: string): Promise<Enemy[]> => {
  // Remover do localStorage
  const enemies = getEnemies().filter(e => e.id !== enemyId);
  localStorage.setItem('enemies', JSON.stringify(enemies));

  // Remover do Supabase se o usuário estiver logado
  try {
    // Verificar se há um usuário logado antes de tentar excluir do Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Remover do banco de dados
      await supabase.from('battle_themes').delete().eq('theme_id', enemyId);
    }
  } catch (error) {
    console.error("Erro ao excluir inimigo do Supabase:", error);
  }

  return enemies;
};

// Function to delete all enemies
export const deleteAllEnemies = async (): Promise<Enemy[]> => {
  // Limpar do localStorage
  localStorage.setItem('enemies', JSON.stringify([]));

  // Limpar do Supabase se o usuário estiver logado
  try {
    // Verificar se há um usuário logado antes de tentar excluir do Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Remover todos os inimigos do usuário atual
      await supabase.from('battle_themes').delete().eq('user_id', session.session.user.id);
    }
  } catch (error) {
    console.error("Erro ao excluir todos os inimigos do Supabase:", error);
  }

  return [];
};

// Function to delete a subject
export const deleteSubject = async (subjectId: string): Promise<Subject[]> => {
  // Obter as matérias atuais
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  localStorage.setItem('subjects', JSON.stringify(subjects));
  
  // Remover inimigos associados a esta matéria
  const enemies = getEnemies().filter(e => e.subjectId !== subjectId);
  localStorage.setItem('enemies', JSON.stringify(enemies));

  // Remover do Supabase se o usuário estiver logado
  try {
    // Verificar se há um usuário logado antes de tentar excluir do Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Remover a matéria do banco de dados
      await supabase.from('subjects').delete().eq('id', subjectId);
      
      // Remover temas associados à matéria
      await supabase.from('themes').delete().eq('subject_id', subjectId);
      
      // Remover inimigos de batalha associados aos temas desta matéria
      const { data: themes } = await supabase.from('themes').select('id').eq('subject_id', subjectId);
      if (themes && themes.length > 0) {
        const themeIds = themes.map(theme => theme.id);
        await supabase.from('battle_themes').delete().in('theme_id', themeIds);
      }
    }
  } catch (error) {
    console.error("Erro ao excluir matéria do Supabase:", error);
  }

  return subjects;
};

// Function to delete all subjects
export const deleteAllSubjects = async (): Promise<Subject[]> => {
  // Limpar do localStorage
  localStorage.setItem('subjects', JSON.stringify([]));
  localStorage.setItem('enemies', JSON.stringify([]));

  // Limpar do Supabase se o usuário estiver logado
  try {
    // Verificar se há um usuário logado antes de tentar excluir do Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      // Remover todas as matérias, temas e inimigos do usuário atual
      await supabase.from('subjects').delete().eq('user_id', session.session.user.id);
      await supabase.from('themes').delete().eq('user_id', session.session.user.id);
      await supabase.from('battle_themes').delete().eq('user_id', session.session.user.id);
      await supabase.from('questions').delete().eq('user_id', session.session.user.id);
      await supabase.from('subthemes').delete().eq('user_id', session.session.user.id);
    }
  } catch (error) {
    console.error("Erro ao excluir todas as matérias do Supabase:", error);
  }

  return [];
};

// Function to get questions (needed for Skills.tsx)
export const getQuestions = (): Question[] => {
  const questions = localStorage.getItem('questions');
  return questions ? JSON.parse(questions) : [];
};
