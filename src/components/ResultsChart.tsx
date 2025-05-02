
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QuizResult } from '@/utils/types';
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsChartProps {
  result: QuizResult;
}

const COLORS = ['#27AE60', '#F39C12', '#E74C3C'];

const ResultsChart = ({ result }: ResultsChartProps) => {
  const isMobile = useIsMobile();
  
  // Memoize the calculations
  const { performanceData, confidenceData, statsData } = useMemo(() => {
    // Calculate stats
    const correctPercent = (result.correctAnswers / result.totalQuestions) * 100;
    
    // Count confidence levels
    const confidenceCounts = {
      'certainty': 0,
      'doubt': 0,
      'unknown': 0
    };
    
    result.answers.forEach(answer => {
      if (answer.confidenceLevel) {
        confidenceCounts[answer.confidenceLevel]++;
      }
    });
    
    // Prepare data for charts
    return {
      performanceData: [
        { name: 'Corretas', value: result.correctAnswers },
        { name: 'Incorretas', value: result.totalQuestions - result.correctAnswers }
      ],
      
      confidenceData: [
        { name: 'Certeza', value: confidenceCounts.certainty },
        { name: 'Dúvida', value: confidenceCounts.doubt },
        { name: 'Não sabia', value: confidenceCounts.unknown }
      ],
      
      statsData: {
        correctPercent,
        timeInMs: result.timeSpent,
        averageTimePerQuestion: result.timeSpent / result.totalQuestions,
        confidenceScore: result.confidenceScore
      }
    };
  }, [result]);
  
  // Format time function
  const formatTime = (timeInMs: number) => {
    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const chartHeight = isMobile ? 140 : 200;
  
  return (
    <div className="w-full p-1 sm:p-4">
      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-4 text-center">Análise de Combate</h3>
      
      <div className="grid grid-cols-1 gap-2 sm:gap-4">
        {/* Performance chart */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow">
          <h4 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Desempenho</h4>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 40 : 80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={!isMobile}
              >
                {
                  performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#27AE60' : '#E74C3C'} />
                  ))
                }
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs mt-1 sm:mt-2">
            <p className="text-warrior-green">Acertos: {result.correctAnswers}/{result.totalQuestions}</p>
            <p className="text-warrior-red">Erros: {result.totalQuestions - result.correctAnswers}/{result.totalQuestions}</p>
          </div>
        </div>
        
        {/* Confidence chart */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow">
          <h4 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Confiança</h4>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={confidenceData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: isMobile ? 8 : 12 }} 
              />
              <YAxis tick={{ fontSize: isMobile ? 8 : 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Quantidade">
                {
                  confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="mt-2 sm:mt-6 bg-white p-2 sm:p-4 rounded-lg shadow">
        <h4 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Resumo</h4>
        <div className="grid grid-cols-2 gap-1 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Pontuação: <span className="font-medium">{Math.round(statsData.correctPercent)}/100</span></p>
            <p className="text-xs sm:text-sm text-gray-600">Tempo total: <span className="font-medium">{formatTime(statsData.timeInMs)}</span></p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Média/questão: <span className="font-medium">
              {formatTime(statsData.averageTimePerQuestion)}
            </span></p>
            <p className="text-xs sm:text-sm text-gray-600">Confiança: <span className="font-medium">
              {Math.round(statsData.confidenceScore)}%
            </span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResultsChart);
