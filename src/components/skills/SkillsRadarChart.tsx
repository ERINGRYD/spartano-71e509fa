
import React, { useMemo, useState, useEffect } from "react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/LanguageContext";
import { Subject } from "@/utils/types";

type SkillsRadarChartProps = {
  subjects: Subject[];
};

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ subjects }) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);
  
  // Prepare data for radar chart
  const chartData = useMemo(() => {
    return subjects.map(subject => ({
      subject: subject.name,
      value: subject.progress,
      fullMark: 100,
    }));
  }, [subjects]);
  
  // Trigger animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  if (!chartData.length) {
    return null;
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <h3 
        className="text-lg font-semibold mb-4"
        tabIndex={0}
      >
        {t('skills.distributionChart')}
      </h3>
      <div 
        className="w-full transition-all duration-500" 
        style={{ height: isMobile ? "220px" : "300px" }}
        role="img"
        aria-label={t('skills.distributionChartAriaLabel')}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: isMobile ? 10 : 12 }} 
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name={t('skills.skillLevel')}
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Tooltip formatter={(value) => [`${value}%`, t('skills.skillLevel')]} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(SkillsRadarChart);
