
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Flag } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { QuizResult } from "@/utils/types";

type StreakCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  progress: number;
  colorClass: string;
  footer?: React.ReactNode;
};

const StreakCard: React.FC<StreakCardProps> = ({ 
  icon, 
  title, 
  value, 
  description, 
  progress, 
  colorClass,
  footer 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-gray-500">{description}</p>
        <ProgressBar 
          progress={progress}
          className="mt-2"
          colorClass={colorClass}
        />
      </CardContent>
      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </Card>
  );
};

type StreakCalendarProps = {
  daysSinceStart: number;
  quizResults: QuizResult[];
};

const StreakCalendar: React.FC<StreakCalendarProps> = ({ daysSinceStart, quizResults }) => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: Math.max(1, Math.min(14, daysSinceStart)) }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        const dateStr = date.toDateString();
        
        const hasQuiz = quizResults.some(r => {
          const resultDate = new Date(r.date);
          return resultDate.toDateString() === dateStr;
        });
        
        return (
          <div 
            key={i} 
            className={`aspect-square rounded-sm ${hasQuiz ? 'bg-emerald-500' : 'bg-gray-200'}`}
            title={date.toLocaleDateString()}
          />
        );
      })}
    </div>
  );
};

type AdvancedStatsProps = {
  questionsPerDay: number;
  totalQuestions: number;
  averageConfidence: number;
};

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ questionsPerDay, totalQuestions, averageConfidence }) => {
  return (
    <div className="mt-8">
      <h4 className="text-sm font-medium mb-2">Estatísticas Avançadas</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-xs text-gray-500 uppercase">Média de Questões por Dia</h5>
          <div className="text-xl font-bold mt-1">{Math.round(questionsPerDay)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-xs text-gray-500 uppercase">Total de Horas Estudadas</h5>
          <div className="text-xl font-bold mt-1">~{Math.round(totalQuestions * 1.5 / 60)} h</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-xs text-gray-500 uppercase">Média de Confiança em Acertos</h5>
          <div className="text-xl font-bold mt-1">{averageConfidence.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

type StreakDisplayProps = {
  streakData: {
    daysSinceStart: number;
    studiedToday: boolean;
    consistency: number;
  } | null;
  stats: {
    studyDays: number;
    perfectDays: number;
    consecutiveDays: number;
    questionsPerDay: number;
    totalQuestions: number;
    averageConfidence: number;
  };
  quizResults: QuizResult[];
};

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streakData, stats, quizResults }) => {
  if (!streakData) {
    return (
      <div className="text-center py-12">
        <Flag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Sem dados de consistência</h3>
        <p className="text-gray-500 mt-2">
          Complete seus primeiros quizzes para ver seus dados de consistência!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StreakCard
        icon={<Award className="w-5 h-5 mr-2 text-purple-500" />}
        title="Dias de Estudo"
        value={stats.studyDays}
        description={`em ${streakData.daysSinceStart} dias totais`}
        progress={streakData.consistency}
        colorClass="bg-purple-500"
        footer={
          <p className="text-sm text-gray-500">
            {streakData.studiedToday ? '✅ Você estudou hoje' : '❓ Você ainda não estudou hoje'}
          </p>
        }
      />
      
      <StreakCard
        icon={<Award className="w-5 h-5 mr-2 text-amber-500" />}
        title="Dias Perfeitos"
        value={stats.perfectDays}
        description="100% de acertos"
        progress={stats.studyDays > 0 ? (stats.perfectDays / stats.studyDays) * 100 : 0}
        colorClass="bg-amber-500"
      />
      
      <StreakCard
        icon={<Star className="w-5 h-5 mr-2 text-emerald-500" />}
        title="Sequência Atual"
        value={stats.consecutiveDays}
        description="dias consecutivos"
        progress={Math.min(100, stats.consecutiveDays * 10)}
        colorClass="bg-emerald-500"
      />
      
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <Award className="w-5 h-5 mr-2 text-emerald-500" />
            Consistência de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{Math.round(streakData.consistency)}%</div>
          <p className="text-sm text-gray-500 mb-4">dos dias estudados</p>
          
          <StreakCalendar 
            daysSinceStart={streakData.daysSinceStart} 
            quizResults={quizResults} 
          />
          
          <AdvancedStats 
            questionsPerDay={stats.questionsPerDay}
            totalQuestions={stats.totalQuestions}
            averageConfidence={stats.averageConfidence}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export { StreakCard, StreakCalendar, AdvancedStats, StreakDisplay };
export const Award = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
);
export const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
