
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Calendar, 
  Target, 
  Award, 
  BarChart, 
  ArrowUp, 
  BookOpen 
} from "lucide-react";

const XPRewards: React.FC = () => {
  const xpRewards = [
    { title: "Questão fácil acertada", amount: "+3 XP", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { title: "Questão média acertada", amount: "+5 XP", icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
    { title: "Questão difícil acertada", amount: "+10 XP", icon: <CheckCircle className="w-4 h-4 text-purple-500" /> },
    { title: "Dia consecutivo de estudo", amount: "+2 XP", icon: <Calendar className="w-4 h-4 text-orange-500" /> },
    { title: "Meta diária atingida", amount: "+5 XP", icon: <Target className="w-4 h-4 text-amber-500" /> },
    { title: "Revisão completa de disciplina", amount: "+20 XP", icon: <BookOpen className="w-4 h-4 text-indigo-500" /> },
    { title: "Simulado concluído", amount: "+30 XP", icon: <BarChart className="w-4 h-4 text-gray-500" /> },
    { title: "Simulado com nota > 80%", amount: "+50 XP", icon: <Award className="w-4 h-4 text-amber-500" /> },
    { title: "Superar recorde pessoal", amount: "+25 XP", icon: <ArrowUp className="w-4 h-4 text-red-500" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Award className="w-5 h-5 mr-2 text-amber-500" />
          Como Ganhar XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {xpRewards.map((reward, index) => (
            <div 
              key={index} 
              className="flex items-center p-2 rounded-md border border-gray-200 bg-gradient-to-r from-amber-50 to-gray-50"
            >
              <div className="mr-2">{reward.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{reward.title}</p>
              </div>
              <div className="text-sm font-bold text-amber-600">{reward.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default XPRewards;
