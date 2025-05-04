
import React from 'react';
import { Plus, ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { Topic, Question } from '@/utils/types';
import QuestionItem from './QuestionItem';
import SubTopicItem from './SubTopicItem';
import SubTopicForm from './SubTopicForm';
import ProgressBar from '@/components/ProgressBar';

interface TopicItemProps {
  topic: Topic;
  subjectId: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  onAddQuestion: (subjectId: string, topicId: string, subTopicId?: string) => void;
  onEditQuestion: (question: Question, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteQuestion: (questionId: string, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  onDeleteSubTopic: (subjectId: string, topicId: string, subTopicId: string) => void;
  onAddSubTopic: (subject: any, topic: any) => void;
  showSubTopicForm: boolean;
  currentSubject: any;
  currentTopic: any;
  subjects: any[];
  setSubjects: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentSubject: React.Dispatch<React.SetStateAction<any>>;
  setCurrentTopic: React.Dispatch<React.SetStateAction<any>>;
  setShowSubTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopicItem = ({
  topic,
  subjectId,
  expanded,
  onToggle,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDeleteTopic,
  onDeleteSubTopic,
  onAddSubTopic,
  showSubTopicForm,
  currentSubject,
  currentTopic,
  subjects,
  setSubjects,
  setCurrentSubject,
  setCurrentTopic,
  setShowSubTopicForm
}: TopicItemProps) => {
  return (
    <div className="mb-2">
      {/* Topic row */}
      <div 
        className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
        onClick={() => onToggle(topic.id)}
      >
        <div className="flex items-center flex-grow">
          {expanded ? 
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : 
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          }
          <span className="text-xs sm:text-sm">{topic.name}</span>
          <span className="ml-1 sm:ml-2 text-xs text-gray-600">
            ({topic.questions.length} questões diretas, {topic.subTopics.length} subtemas)
          </span>
        </div>
        <div className="w-16 sm:w-24 mr-2">
          <ProgressBar 
            progress={topic.progress} 
            className="h-1 sm:h-1.5"
          />
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddQuestion(subjectId, topic.id);
            }}
            className="text-green-500 hover:text-green-700 p-0.5 sm:p-1"
            title="Adicionar questão"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTopic(subjectId, topic.id);
            }}
            className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
            title="Excluir tema"
          >
            <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>
      
      {/* Topic content when expanded */}
      {expanded && (
        <div className="pl-3 sm:pl-4 mt-1 sm:mt-2">
          {/* Topic questions */}
          {topic.questions.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm font-medium mb-1">Questões do tema:</div>
              {topic.questions.map(question => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  subjectId={subjectId}
                  topicId={topic.id}
                  onEdit={onEditQuestion}
                  onDelete={onDeleteQuestion}
                />
              ))}
            </div>
          )}
          
          {/* Add subtopic button */}
          <button
            onClick={() => onAddSubTopic({ id: subjectId }, { id: topic.id })}
            className="mb-1 sm:mb-2 text-xs sm:text-sm text-warrior-blue hover:text-blue-700 flex items-center"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            Adicionar Subtema
          </button>
          
          {/* Subtopic form */}
          {showSubTopicForm && currentSubject?.id === subjectId && currentTopic?.id === topic.id && (
            <SubTopicForm
              subjects={subjects}
              setSubjects={setSubjects}
              currentSubject={currentSubject}
              currentTopic={currentTopic}
              setCurrentSubject={setCurrentSubject}
              setCurrentTopic={setCurrentTopic}
              showSubTopicForm={showSubTopicForm}
              setShowSubTopicForm={setShowSubTopicForm}
            />
          )}
          
          {/* Subtopics */}
          {topic.subTopics.map(subTopic => (
            <SubTopicItem
              key={subTopic.id}
              subTopic={subTopic}
              subjectId={subjectId}
              topicId={topic.id}
              onAddQuestion={onAddQuestion}
              onEditQuestion={onEditQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onDeleteSubTopic={onDeleteSubTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicItem;
