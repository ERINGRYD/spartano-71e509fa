
import React from "react";
import { Cpu, BookOpen, TrendingUp, Star, Award, Bolt, Clock, Shield, Brain, Heart } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: "force" | "agility" | "resistance" | "wisdom" | "honor" | "questions" | "time" | "confidence" | "enemies";
  color?: string;
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case "force":
        return <Bolt className={`w-12 h-12 ${color || 'text-red-500'} opacity-70`} />;
      case "agility":
        return <Clock className={`w-12 h-12 ${color || 'text-blue-500'} opacity-70`} />;
      case "resistance":
        return <Shield className={`w-12 h-12 ${color || 'text-green-500'} opacity-70`} />;
      case "wisdom":
        return <Brain className={`w-12 h-12 ${color || 'text-purple-500'} opacity-70`} />;
      case "honor":
        return <Heart className={`w-12 h-12 ${color || 'text-yellow-500'} opacity-70`} />;
      case "questions":
        return <BookOpen className={`w-12 h-12 ${color || 'text-indigo-500'} opacity-70`} />;
      case "time":
        return <Clock className={`w-12 h-12 ${color || 'text-orange-500'} opacity-70`} />;
      case "confidence":
        return <Star className={`w-12 h-12 ${color || 'text-amber-500'} opacity-70`} />;
      case "enemies":
        return <Shield className={`w-12 h-12 ${color || 'text-gray-500'} opacity-70`} />;
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
