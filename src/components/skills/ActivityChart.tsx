
import React from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ActivityChartProps = {
  data: { date: string, count: number }[];
};

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Sem dados suficientes para gerar gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="count" 
          name="Questões" 
          stroke="#3498DB" 
          activeDot={{ r: 8 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default ActivityChart;
