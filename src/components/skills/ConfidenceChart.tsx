
import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuizResult } from "@/utils/types";

type ConfidenceChartProps = {
  results: QuizResult[];
};

const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Sem dados suficientes para gerar gráfico.
      </div>
    );
  }

  const data = [
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

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
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

export default ConfidenceChart;
