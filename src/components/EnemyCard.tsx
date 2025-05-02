
import { Shield, Swords, Skull, Eye, Trash, Edit, Target, MoveUp } from 'lucide-react';
import { Enemy } from '@/utils/types';
import ProgressBar from './ProgressBar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EnemyCardProps {
  enemy: Enemy;
  onEdit?: (enemy: Enemy) => void;
  onDelete?: (enemyId: string) => void;
  onClick?: (enemy: Enemy) => void;
  onPromote?: (enemy: Enemy) => void;
  className?: string;
  hideActions?: boolean;
}

const EnemyCard = ({ 
  enemy, 
  onEdit, 
  onDelete, 
  onClick, 
  onPromote,
  className, 
  hideActions = false 
}: EnemyCardProps) => {
  const getStatusIcon = () => {
    switch (enemy.status) {
      case 'ready':
        return <Shield className="w-5 h-5 text-warrior-blue" />;
      case 'battle':
        return <Swords className="w-5 h-5 text-warrior-red" />;
      case 'wounded':
        return <Skull className="w-5 h-5 text-warrior-yellow" />;
      case 'observed':
        return <Eye className="w-5 h-5 text-warrior-green" />;
      default:
        return <Shield className="w-5 h-5 text-warrior-blue" />;
    }
  };

  const getStatusText = () => {
    switch (enemy.status) {
      case 'ready':
        return 'Pronto';
      case 'battle':
        return 'Em batalha';
      case 'wounded':
        return 'Ferido';
      case 'observed':
        return 'Em observação';
      default:
        return 'Pronto';
    }
  };

  const getStatusClass = () => {
    switch (enemy.status) {
      case 'ready':
        return 'ready';
      case 'battle':
        return 'battle';
      case 'wounded':
        return 'wounded';
      case 'observed':
        return 'observed';
      default:
        return 'ready';
    }
  };

  const handleClick = () => {
    if (onClick) onClick(enemy);
  };

  const handlePromote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPromote) onPromote(enemy);
  };

  // Calculate days in ready status
  const getDaysInReady = (): number | null => {
    if (enemy.status === 'ready' && enemy.readySince) {
      const readyDate = new Date(enemy.readySince);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - readyDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays;
    }
    return null;
  };

  const daysInReady = getDaysInReady();
  const showPromotionIndicator = enemy.status === 'ready' && daysInReady && daysInReady >= 2;
  const promotionPoints = enemy.promotionPoints || 0;

  return (
    <div 
      className={cn(
        `enemy-card ${getStatusClass()}`,
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="font-medium">{enemy.name}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${getStatusClass()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </span>
          
          {!hideActions && (
            <div className="flex space-x-2 ml-2">
              {onPromote && enemy.status === 'ready' && (
                <button 
                  onClick={handlePromote}
                  className="p-1 text-gray-500 hover:text-warrior-red"
                  title="Promover para batalha"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
              )}
              
              {onEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(enemy);
                  }}
                  className="p-1 text-gray-500 hover:text-warrior-blue"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Tem certeza que deseja apagar este inimigo?')) {
                      onDelete(enemy.id);
                    }
                  }}
                  className="p-1 text-gray-500 hover:text-warrior-red"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3">
        <ProgressBar 
          progress={enemy.progress} 
          showPercentage={true}
          colorClass={
            enemy.status === 'ready' ? 'bg-warrior-blue' :
            enemy.status === 'battle' ? 'bg-warrior-red' :
            enemy.status === 'wounded' ? 'bg-warrior-yellow' :
            'bg-warrior-green'
          }
        />
      </div>
      
      {showPromotionIndicator && (
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
            {daysInReady} {daysInReady === 1 ? 'dia' : 'dias'} em espera
          </Badge>
          {promotionPoints > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
              Promoção: {promotionPoints}/10
            </Badge>
          )}
        </div>
      )}
      
      {enemy.nextReviewDates && enemy.currentReviewIndex !== undefined && 
       enemy.nextReviewDates.length > 0 && 
       enemy.currentReviewIndex < enemy.nextReviewDates.length && (
        <div className="mt-2 text-xs text-gray-600">
          Próxima revisão: {new Date(enemy.nextReviewDates[enemy.currentReviewIndex]).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default EnemyCard;
