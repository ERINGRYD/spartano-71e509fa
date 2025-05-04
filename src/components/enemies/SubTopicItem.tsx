
import React from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import { SubTopic, Question } from '@/utils/types';
import QuestionItem from './QuestionItem';
import ProgressBar from '@/components/ProgressBar';

interface SubTopicItemProps {
  subTopic: SubTopic;
  subjectId: string;
  topicId: string;
  onAddQuestion: (subjectId: string, topicId: string, subTopicId: string) => void;
  onEditQuestion: (question: Question, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteQuestion: (questionId: string, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteSubTopic: (subjectId: string, topicId: string, subTopicId: string) => void;
}

const SubTopicItem = ({
  subTopic,
  subjectId,
  topicId,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDeleteSubTopic
}: SubTopicItemProps) => {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-gray-200 rounded-md">
        <div className="flex items-center flex-grow">
          <span className="text-xs sm:text-sm">{subTopic.name}</span>
          <span className="ml-1 sm:ml-2 text-xs text-gray-600">
            ({subTopic.questions.length} questões)
          </span>
        </div>
        <div className="w-16 sm:w-24 mr-2">
          <ProgressBar 
            progress={subTopic.progress} 
            className="h-1 sm:h-1.5"
          />
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onAddQuestion(subjectId, topicId, subTopic.id)}
            className="text-green-500 hover:text-green-700 p-0.5 sm:p-1"
            title="Adicionar questão"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={() => onDeleteSubTopic(subjectId, topicId, subTopic.id)}
            className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
            title="Excluir subtema"
          >
            <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>
      
      {/* Subtopic questions */}
      {subTopic.questions.length > 0 && (
        <div className="pl-3 sm:pl-4 mt-1 mb-2">
          <div className="text-xs sm:text-sm font-medium mb-1">Questões do subtema:</div>
          {subTopic.questions.map(question => (
            <QuestionItem
              key={question.id}
              question={question}
              subjectId={subjectId}
              topicId={topicId}
              subTopicId={subTopic.id}
              onEdit={onEditQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubTopicItem;
