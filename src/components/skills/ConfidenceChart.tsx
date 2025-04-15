
import React, { useMemo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuizResult } from "@/utils/types";
import { useIsMobile } from "@/hooks/use-mobile";

type ConfidenceChartProps = {
  results: QuizResult[];
};

const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ results }) => {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 250;

  // Memoize the confidence data calculation to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (results.length === 0) return [];
    
    return [
      { 
        name: 'Certeza', 
        value: results.reduce((sum, r) => 
          sum + r.answers.filter(a => a.confidenceLevel === 'certainty').length, 0) 
      },
      { 
        name: 'Dúvida', 
        value: results.reduce((sum, r) => 
          sum + r.answers.filter(a => a.confidenceLevel === 'doubt').length, 0) 
      },
      { 
        name: 'Não sabia', 
        value: results.reduce((sum, r) => 
          sum + r.answers.filter(a => a.confidenceLevel === 'unknown').length, 0) 
      }
    ];
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-center text-gray-500">
        Sem dados suficientes para gerar gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
        <Tooltip />
        <Bar dataKey="value" name="Quantidade">
          <Cell fill="#27AE60" />
          <Cell fill="#F39C12" />
          <Cell fill="#E74C3C" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ConfidenceChart);
