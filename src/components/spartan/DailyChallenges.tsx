
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, Target, Award, ChevronsUp } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacter';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type Challenge = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  completed: boolean;
  progress?: number;
  goal?: number;
};

const DailyChallenges: React.FC = () => {
  const { t } = useTranslation();
  const { completedChallenges, completeChallenge } = useCharacter();
  
  // Sample challenges - in a real app, these would be generated dynamically
  const challenges: Challenge[] = [
    {
      id: 'daily-1',
      title: t('challenges.training') || 'Treinamento Espartano',
      description: t('challenges.trainingDesc') || 'Resolver 10 questões de disciplina específica',
      icon: <Sword className="h-5 w-5" />,
      xpReward: 15,
      completed: completedChallenges.includes('daily-1'),
      progress: 3,
      goal: 10
    },
    {
      id: 'daily-2',
      title: t('challenges.patrol') || 'Patrulha de Fronteira',
      description: t('challenges.patrolDesc') || 'Resolver questões de 3 disciplinas diferentes',
      icon: <Shield className="h-5 w-5" />,
      xpReward: 20,
      completed: completedChallenges.includes('daily-2'),
      progress: 1,
      goal: 3
    },
    {
      id: 'daily-3',
      title: t('challenges.endurance') || 'Corrida de Resistência',
      description: t('challenges.enduranceDesc') || 'Manter foco por 2 horas ininterruptas de estudo',
      icon: <Target className="h-5 w-5" />,
      xpReward: 25,
      completed: completedChallenges.includes('daily-3'),
      progress: 45,
      goal: 120
    }
  ];
  
  const handleCompleteChallenge = (challengeId: string, xpReward: number) => {
    completeChallenge(challengeId, xpReward);
  };
  
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-red-700 to-red-900 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          {t('challenges.daily') || 'Desafios Diários'}
        </CardTitle>
        <CardDescription className="text-gray-200">
          {t('challenges.dailyDesc') || 'Complete desafios para ganhar XP e recompensas'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className={`border rounded-lg p-3 ${
                challenge.completed ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    challenge.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {challenge.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-gray-500">{challenge.description}</p>
                    
                    {challenge.progress !== undefined && challenge.goal !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-blue-600" 
                            style={{ width: `${Math.min(100, (challenge.progress / challenge.goal) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>{challenge.progress}/{challenge.goal}</span>
                          <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium flex items-center text-yellow-600">
                    <ChevronsUp className="h-4 w-4 mr-1" />
                    {challenge.xpReward} XP
                  </span>
                  
                  {!challenge.completed && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleCompleteChallenge(challenge.id, challenge.xpReward)}
                    >
                      {t('challenges.claim') || 'Completar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChallenges;
