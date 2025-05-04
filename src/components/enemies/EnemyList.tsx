
import React from 'react';
import { Enemy } from '@/utils/types';
import EnemyCard from '@/components/EnemyCard';

interface EnemyListProps {
  enemies: Enemy[];
  onEdit: (enemy: Enemy) => void;
  onDelete: (enemyId: string) => void;
}

const EnemyList = ({ 
  enemies, 
  onEdit, 
  onDelete 
}: EnemyListProps) => {
  return (
    <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Lista de Inimigos</h2>
      
      <div className="grid gap-2 sm:gap-4">
        {enemies.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            Nenhum inimigo cadastrado. Adicione um inimigo para começar!
          </div>
        ) : (
          enemies.map(enemy => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnemyList;
