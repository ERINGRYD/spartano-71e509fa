
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-gray-500">{description}</p>
        <ProgressBar 
          progress={progress}
          className="mt-2"
          colorClass={colorClass}
        />
      </CardContent>
    </Card>
  );
};

export default StatsCard;
