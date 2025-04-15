
import React from "react";
import { Cpu, BookOpen, TrendingUp, Star, Award } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: "questions" | "time" | "confidence" | "enemies";
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case "questions":
        return <BookOpen className="w-12 h-12 text-warrior-blue opacity-70" />;
      case "time":
        return <TrendingUp className="w-12 h-12 text-warrior-green opacity-70" />;
      case "confidence":
        return <Star className="w-12 h-12 text-warrior-yellow opacity-70" />;
      case "enemies":
        return <Award className="w-12 h-12 text-warrior-red opacity-70" />;
      default:
        return <Cpu className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        {getIcon()}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
};

export default StatsCard;
