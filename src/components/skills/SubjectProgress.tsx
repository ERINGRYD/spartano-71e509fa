
import React from "react";
import ProgressBar from "@/components/ProgressBar";

type SubjectProgressProps = {
  subjects: { name: string, progress: number }[];
  colors: string[];
  title?: string;
  maxItems?: number;
  className?: string;
};

const SubjectProgress: React.FC<SubjectProgressProps> = ({ 
  subjects, 
  colors, 
  title = "Progresso por Matéria",
  maxItems = subjects.length,
  className = ""
}) => {
  // Only show the first maxItems topics
  const displaySubjects = subjects.slice(0, maxItems);
  
  return (
    <div className={`bg-white p-4 rounded-lg ${className}`}>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {displaySubjects.map((item, index) => (
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
        {subjects.length > maxItems && (
          <p className="text-xs text-gray-500 mt-2">
            +{subjects.length - maxItems} {subjects.length - maxItems === 1 ? "tema" : "temas"} não exibidos
          </p>
        )}
      </div>
    </div>
  );
};

export default SubjectProgress;
