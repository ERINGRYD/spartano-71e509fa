
import React from "react";
import ProgressBar from "@/components/ProgressBar";

type SubjectProgressProps = {
  subjects: { name: string, progress: number }[];
  colors: string[];
};

const SubjectProgress: React.FC<SubjectProgressProps> = ({ subjects, colors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Progresso por Matéria</h3>
      <div className="space-y-4">
        {subjects.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm">{Math.round(item.progress)}%</span>
            </div>
            <ProgressBar 
              progress={item.progress} 
              colorClass={`bg-[${colors[index % colors.length]}]`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectProgress;
