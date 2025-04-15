
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

type AccuracyChartProps = {
  correctAnswers: number;
  totalQuestions: number;
};

const AccuracyChart: React.FC<AccuracyChartProps> = ({ correctAnswers, totalQuestions }) => {
  const isMobile = useIsMobile();
  
  const data = useMemo(() => [
    { name: 'Acertos', value: correctAnswers },
    { name: 'Erros', value: totalQuestions - correctAnswers }
  ], [correctAnswers, totalQuestions]);

  const chartHeight = isMobile ? 200 : 250;
  
  if (totalQuestions === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-center text-gray-500">
        Sem dados suficientes para gerar gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 60 : 80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          <Cell fill="#27AE60" />
          <Cell fill="#E74C3C" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default React.memo(AccuracyChart);
