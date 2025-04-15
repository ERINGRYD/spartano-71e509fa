
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";

type Topic = {
  id: string;
  name: string;
  progress: number;
};

type SubjectProps = {
  id: string;
  name: string;
  topics: Topic[];
  progress: number;
};

const SubjectCard: React.FC<SubjectProps> = ({ name, topics, progress }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {topics.length} {topics.length === 1 ? 'tópico' : 'tópicos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Progresso Geral</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} colorClass="bg-purple-600" />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Tópicos</h4>
          <div className="space-y-3">
            {topics.map(topic => (
              <div key={topic.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{topic.name}</span>
                  <span>{Math.round(topic.progress)}%</span>
                </div>
                <ProgressBar progress={topic.progress} className="h-1.5 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
