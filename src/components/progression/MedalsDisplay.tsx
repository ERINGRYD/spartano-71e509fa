
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Shield, Crown, Sword, Eye, Flag, BookCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedalProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  progress?: number;
}

const Medal: React.FC<MedalProps> = ({ title, description, icon, achieved, progress }) => (
  <div className={`flex items-center p-4 rounded-lg border ${achieved ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
    <div className={`p-2 rounded-full ${achieved ? 'bg-gradient-to-r from-amber-200 to-amber-300' : 'bg-gray-200'}`}>
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <h3 className={`font-semibold ${achieved ? 'text-amber-900' : 'text-gray-500'}`}>{title}</h3>
      <p className={`text-sm ${achieved ? 'text-amber-700' : 'text-gray-400'}`}>{description}</p>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-amber-500 h-1.5 rounded-full" 
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
    {achieved && (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
        Conquistado
      </Badge>
    )}
  </div>
);

interface MedalsDisplayProps {
  stats: {
    studyDays: number;
    consecutiveDays: number;
    masteredSubjects: number;
    improvedSubjects: number;
    patternRecognition: number;
  };
}

const MedalsDisplay: React.FC<MedalsDisplayProps> = ({ stats }) => {
  const medals = [
    {
      title: "Lança de Bronze",
      description: "3 dias consecutivos de estudo",
      icon: <Flag className="w-5 h-5 text-amber-700" />,
      achieved: stats.consecutiveDays >= 3,
      progress: (stats.consecutiveDays / 3) * 100
    },
    {
      title: "Escudo de Prata",
      description: "10 dias consecutivos de estudo",
      icon: <Shield className="w-5 h-5 text-amber-700" />,
      achieved: stats.consecutiveDays >= 10,
      progress: (stats.consecutiveDays / 10) * 100
    },
    {
      title: "Elmo de Ouro",
      description: "30 dias consecutivos de estudo",
      icon: <Crown className="w-5 h-5 text-amber-700" />,
      achieved: stats.consecutiveDays >= 30,
      progress: (stats.consecutiveDays / 30) * 100
    },
    {
      title: "Merecedor da Capa Vermelha",
      description: "100 dias consecutivos de estudo",
      icon: <Medal className="w-5 h-5 text-amber-700" />,
      achieved: stats.consecutiveDays >= 100,
      progress: (stats.consecutiveDays / 100) * 100
    },
    {
      title: "Protetor de Esparta",
      description: "Domínio completo em uma disciplina (90%+ de acertos)",
      icon: <BookCheck className="w-5 h-5 text-amber-700" />,
      achieved: stats.masteredSubjects > 0
    },
    {
      title: "Olhos de Coruja",
      description: "Identificar padrões em questões da banca",
      icon: <Eye className="w-5 h-5 text-amber-700" />,
      achieved: stats.patternRecognition >= 80
    },
    {
      title: "Força de Hércules",
      description: "Superar obstáculo em disciplina problemática",
      icon: <Sword className="w-5 h-5 text-amber-700" />,
      achieved: stats.improvedSubjects > 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Medal className="w-5 h-5 mr-2 text-amber-500" />
          Medalhas e Títulos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {medals.map((medal, index) => (
          <Medal key={index} {...medal} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MedalsDisplay;
