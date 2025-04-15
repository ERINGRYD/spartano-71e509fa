
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AccuracyChartProps = {
  correctAnswers: number;
  totalQuestions: number;
};

const AccuracyChart: React.FC<AccuracyChartProps> = ({ correctAnswers, totalQuestions }) => {
  const data = [
    { name: 'Acertos', value: correctAnswers },
    { name: 'Erros', value: totalQuestions - correctAnswers }
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
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

export default AccuracyChart;
