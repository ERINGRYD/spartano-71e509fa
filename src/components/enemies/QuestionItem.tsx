
import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { Question } from '@/utils/types';

interface QuestionItemProps {
  question: Question;
  subjectId: string;
  topicId: string;
  subTopicId?: string;
  onEdit: (question: Question, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDelete: (questionId: string, subjectId: string, topicId: string, subTopicId?: string) => void;
}

const QuestionItem = ({ 
  question, 
  subjectId, 
  topicId, 
  subTopicId, 
  onEdit, 
  onDelete 
}: QuestionItemProps) => {
  return (
    <div className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 border border-gray-200 rounded-md mb-1">
      <div className="flex-grow pr-2 text-xs sm:text-sm">
        <div className="line-clamp-1">{question.text}</div>
        <div className="text-xs text-gray-600">
          {question.type === 'multiple_choice' ? 'Múltipla escolha' : 'Certo ou errado'}
          {question.difficulty === 'easy' && ' • Fácil'}
          {question.difficulty === 'medium' && ' • Média'}
          {question.difficulty === 'hard' && ' • Difícil'}
        </div>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onEdit(question, subjectId, topicId, subTopicId)}
          className="text-blue-500 hover:text-blue-700 p-0.5 sm:p-1"
          title="Editar questão"
        >
          <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <button
          onClick={() => onDelete(question.id, subjectId, topicId, subTopicId)}
          className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
          title="Excluir questão"
        >
          <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
};

export default QuestionItem;
