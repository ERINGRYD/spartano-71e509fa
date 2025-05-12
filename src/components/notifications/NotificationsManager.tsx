
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { getEnemies, getQuizResults } from '@/utils/storage';
import { Enemy } from '@/utils/types';

export interface NotificationsManagerProps {
  userId?: string;
}

export const NotificationsManager: React.FC<NotificationsManagerProps> = ({ userId }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      // Ao inicializar, verifica notificações em intervalos regulares
      checkNotifications();
      
      // Verificar a cada 30 minutos
      const interval = setInterval(() => {
        checkNotifications();
      }, 30 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [userId]);

  const checkNotifications = () => {
    try {
      const enemies = getEnemies();
      const quizResults = getQuizResults();
      
      // Verifica temas que precisam de revisão (progresso < 50%)
      const needsReview = enemies.filter(e => e.progress < 50 || e.status === 'needs_review');
      
      // Verifica se o usuário não estudou hoje
      const today = new Date().toDateString();
      const studiedToday = quizResults.some(r => new Date(r.date).toDateString() === today);
      
      // Verifica inimigos dominados recentemente (progresso >= 80% e não mostrados antes)
      const masteredEnemies = enemies.filter(e => e.progress >= 80 && e.status !== 'acknowledged');
      
      // Envia notificações apropriadas
      if (!studiedToday && new Date().getHours() >= 18) {
        showReminderNotification();
      }
      
      if (needsReview.length > 0) {
        showReviewNeededNotification(needsReview);
      }
      
      if (masteredEnemies.length > 0) {
        showMasteredNotification(masteredEnemies);
        
        // Marcar inimigos como reconhecidos
        markEnemiesAsAcknowledged(masteredEnemies);
      }
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  };
  
  const showReminderNotification = () => {
    toast({
      title: "Lembrete de estudo",
      description: "Você ainda não estudou hoje! Que tal uma sessão rápida?",
      action: (
        <Link to="/battlefield" className="bg-amber-500 text-white px-3 py-1 rounded-md text-xs">
          Estudar agora
        </Link>
      ),
    });
  };
  
  const showReviewNeededNotification = (enemies: Enemy[]) => {
    toast({
      title: "Revisão necessária",
      description: `${enemies.length} temas precisam de revisão.`,
      action: (
        <Link to="/battlefield" className="bg-amber-500 text-white px-3 py-1 rounded-md text-xs">
          Revisar agora
        </Link>
      ),
    });
  };
  
  const showMasteredNotification = (enemies: Enemy[]) => {
    toast({
      title: "Parabéns!",
      description: `Você dominou ${enemies.length} novos temas! Continue assim!`,
      action: (
        <Link to="/spartan-progress" className="bg-green-500 text-white px-3 py-1 rounded-md text-xs">
          Ver progresso
        </Link>
      ),
    });
  };
  
  const markEnemiesAsAcknowledged = (enemies: Enemy[]) => {
    // Atualizar o status no localStorage
    const allEnemies = getEnemies();
    const updatedEnemies = allEnemies.map(enemy => {
      if (enemies.some(e => e.id === enemy.id)) {
        return { ...enemy, status: 'acknowledged' };
      }
      return enemy;
    });
    
    // Salvar de volta no localStorage
    localStorage.setItem('enemies', JSON.stringify(updatedEnemies));
  };

  // Este componente não renderiza nada visualmente
  return null;
};

export default NotificationsManager;
