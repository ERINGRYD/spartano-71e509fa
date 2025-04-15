
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type AchievementProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  date: unknown;
  formatDate: (date: unknown) => string;
};

const AchievementCard: React.FC<AchievementProps> = ({ title, description, icon, date, formatDate }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="bg-white p-2 rounded-full shadow">
            {icon}
          </div>
          <span className="text-sm text-gray-500">
            {date ? formatDate(date) : 'Recente'}
          </span>
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default AchievementCard;
