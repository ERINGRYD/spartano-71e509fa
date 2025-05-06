
import React from "react";
import ProgressBar from "@/components/ProgressBar";

type SubjectProgressProps = {
  subjects: { name: string, progress: number }[];
  colors: string[];
  title?: string;
};

const SubjectProgress: React.FC<SubjectProgressProps> = ({ subjects, colors, title = "Progresso por Matéria" }) => {
  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {subjects.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs">{Math.round(item.progress)}%</span>
            </div>
            <ProgressBar 
              progress={item.progress} 
              colorClass={colors[index % colors.length]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectProgress;
