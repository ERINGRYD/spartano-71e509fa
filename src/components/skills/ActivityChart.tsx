
import React, { useMemo } from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

type ActivityChartProps = {
  data: { date: string, count: number }[];
};

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 250;
  
  // Memoize the sorted data to prevent unnecessary processing
  const sortedData = useMemo(() => {
    if (data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-center text-gray-500">
        Sem dados suficientes para gerar gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <RechartsLineChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: isMobile ? 10 : 12 }}
          interval={isMobile ? "preserveStartEnd" : 0}
        />
        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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

export default React.memo(ActivityChart);
