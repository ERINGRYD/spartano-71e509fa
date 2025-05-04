
import React from 'react';
import { ChevronDown, ChevronRight, Trash, Plus } from 'lucide-react';
import { Subject, Topic, Question } from '@/utils/types';
import ProgressBar from '@/components/ProgressBar';
import TopicItem from './TopicItem';
import TopicForm from './TopicForm';

interface SubjectItemProps {
  subject: Subject;
  expanded: boolean;
  expandedTopics: {[key: string]: boolean};
  onToggleSubject: (id: string) => void;
  onToggleTopic: (id: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddTopic: (subject: Subject) => void;
  onAddQuestion: (subjectId: string, topicId: string, subTopicId?: string) => void;
  onEditQuestion: (question: Question, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteQuestion: (questionId: string, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  onDeleteSubTopic: (subjectId: string, topicId: string, subTopicId: string) => void;
  onAddSubTopic: (subject: Subject, topic: Topic) => void;
  showTopicForm: boolean;
  showSubTopicForm: boolean;
  currentSubject: Subject | null;
  currentTopic: Topic | null;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setCurrentSubject: React.Dispatch<React.SetStateAction<Subject | null>>;
  setCurrentTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  setShowTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSubTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
  setExpandedTopics: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
}

const SubjectItem = ({
  subject,
  expanded,
  expandedTopics,
  onToggleSubject,
  onToggleTopic,
  onDeleteSubject,
  onAddTopic,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDeleteTopic,
  onDeleteSubTopic,
  onAddSubTopic,
  showTopicForm,
  showSubTopicForm,
  currentSubject,
  currentTopic,
  subjects,
  setSubjects,
  setCurrentSubject,
  setCurrentTopic,
  setShowTopicForm,
  setShowSubTopicForm,
  setExpandedTopics
}: SubjectItemProps) => {
  return (
    <div className="mb-3 sm:mb-4">
      {/* Subject row */}
      <div 
        className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
        onClick={() => onToggleSubject(subject.id)}
      >
        <div className="flex items-center flex-grow">
          {expanded ? 
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> : 
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          }
          <span className="font-medium text-sm sm:text-base">{subject.name}</span>
          <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
            ({subject.topics.length} {subject.topics.length === 1 ? 'tema' : 'temas'})
          </span>
        </div>
        <div className="w-1/3 mr-2">
          <ProgressBar 
            progress={subject.progress} 
            showPercentage={true}
            className="h-1.5 sm:h-2"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSubject(subject.id);
          }}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
      
      {/* Topics */}
      {expanded && (
        <div className="pl-4 sm:pl-6 mt-2">
          {/* Add topic button */}
          <button
            onClick={() => onAddTopic(subject)}
            className="mb-2 text-xs sm:text-sm text-warrior-blue hover:text-blue-700 flex items-center"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            Adicionar Tema
          </button>
          
          {/* Topic form */}
          {showTopicForm && currentSubject?.id === subject.id && (
            <TopicForm
              subjects={subjects}
              setSubjects={setSubjects}
              currentSubject={currentSubject}
              setCurrentSubject={setCurrentSubject}
              showTopicForm={showTopicForm}
              setShowTopicForm={setShowTopicForm}
              setExpandedTopics={setExpandedTopics}
            />
          )}
          
          {/* Topics list or empty state */}
          {subject.topics.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500 py-1 sm:py-2">
              Nenhum tema cadastrado nesta matéria.
            </div>
          ) : (
            subject.topics.map(topic => (
              <TopicItem
                key={topic.id}
                topic={topic}
                subjectId={subject.id}
                expanded={!!expandedTopics[topic.id]}
                onToggle={onToggleTopic}
                onAddQuestion={onAddQuestion}
                onEditQuestion={onEditQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onDeleteTopic={onDeleteTopic}
                onDeleteSubTopic={onDeleteSubTopic}
                onAddSubTopic={onAddSubTopic}
                showSubTopicForm={showSubTopicForm}
                currentSubject={currentSubject}
                currentTopic={currentTopic}
                subjects={subjects}
                setSubjects={setSubjects}
                setCurrentSubject={setCurrentSubject}
                setCurrentTopic={setCurrentTopic}
                setShowSubTopicForm={setShowSubTopicForm}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectItem;
