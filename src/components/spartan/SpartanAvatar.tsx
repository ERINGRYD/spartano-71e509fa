
import React from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { Shield, Sword, Award } from 'lucide-react';

type SpartanAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  showAttributes?: boolean;
};

const SpartanAvatar: React.FC<SpartanAvatarProps> = ({ 
  size = 'md',
  showAttributes = false
}) => {
  const { level, rankName, attributes } = useCharacter();
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const getAvatarImage = () => {
    // This is a placeholder - in a real implementation, we would change the avatar based on level
    return (
      <div className={`relative ${sizeClasses[size]} bg-gradient-to-b from-red-700 to-red-900 rounded-full flex items-center justify-center`}>
        <Shield className="w-1/2 h-1/2 text-yellow-500" />
        {level >= 3 && (
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-500 rounded-full flex items-center justify-center">
            <Sword className="w-2/3 h-2/3 text-red-800" />
          </div>
        )}
        <div className="absolute bottom-1 w-full text-center text-xs text-white font-bold">
          {level}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center">
      {getAvatarImage()}
      
      <div className="mt-2 text-center">
        <h3 className="font-bold text-sm sm:text-base">{rankName}</h3>
      </div>
      
      {showAttributes && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {attributes && Object.entries(attributes).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <Award className="w-4 h-4 text-warrior-primary" />
              <span className="text-xs capitalize">{key}</span>
              <span className="text-xs font-bold">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpartanAvatar;
