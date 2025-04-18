
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";

type StatsCardProps = {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  description: string;
  progress: number;
  colorClass?: string;
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  icon, 
  value, 
  description, 
  progress, 
  colorClass = "bg-blue-500" 
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <div className="mr-2 bg-gradient-to-r from-purple-100 to-indigo-100 p-1 rounded-full">
            {icon}
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">{value}</div>
        <p className="text-sm text-gray-500 italic">{description}</p>
        <ProgressBar 
          progress={progress}
          className="mt-3"
          colorClass={`bg-gradient-to-r from-${colorClass.split('-')[1]}-500 to-${colorClass.split('-')[1]}-600`}
        />
      </CardContent>
    </Card>
  );
};

export default StatsCard;
