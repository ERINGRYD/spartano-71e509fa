
import React from "react";
import { Flag, BookOpen } from "lucide-react";

type NoDataDisplayProps = {
  type: 'achievements' | 'subjects';
};

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ type }) => {
  if (type === 'achievements') {
    return (
      <div className="col-span-3 text-center py-12">
        <Flag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Nenhuma conquista ainda</h3>
        <p className="text-gray-500 mt-2">
          Complete seus primeiros quizzes para desbloquear conquistas!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">Nenhuma matéria encontrada</h3>
      <p className="text-gray-500 mt-2">
        Adicione matérias na aba "Inimigos" para começar sua jornada!
      </p>
    </div>
  );
};

export default NoDataDisplay;
