
import React from 'react';
import { Plus } from 'lucide-react';
import { Subject, Topic, Question } from '@/utils/types';
import SubjectItem from './SubjectItem';
import SubjectForm from './SubjectForm';

interface SubjectListProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  expandedSubjects: {[key: string]: boolean};
  expandedTopics: {[key: string]: boolean};
  setExpandedSubjects: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  setExpandedTopics: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  showSubjectForm: boolean;
  setShowSubjectForm: React.Dispatch<React.SetStateAction<boolean>>;
  showTopicForm: boolean;
  setShowTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
  showSubTopicForm: boolean;
  setShowSubTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
  currentSubject: Subject | null;
  setCurrentSubject: React.Dispatch<React.SetStateAction<Subject | null>>;
  currentTopic: Topic | null;
  setCurrentTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  onDeleteSubject: (id: string) => void;
  onAddQuestion: (subjectId: string, topicId: string, subTopicId?: string) => void;
  onEditQuestion: (question: Question, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteQuestion: (questionId: string, subjectId: string, topicId: string, subTopicId?: string) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  onDeleteSubTopic: (subjectId: string, topicId: string, subTopicId: string) => void;
}

const SubjectList = ({
  subjects,
  setSubjects,
  expandedSubjects,
  expandedTopics,
  setExpandedSubjects,
  setExpandedTopics,
  showSubjectForm,
  setShowSubjectForm,
  showTopicForm,
  setShowTopicForm,
  showSubTopicForm,
  setShowSubTopicForm,
  currentSubject,
  setCurrentSubject,
  currentTopic,
  setCurrentTopic,
  onDeleteSubject,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDeleteTopic,
  onDeleteSubTopic
}: SubjectListProps) => {
  
  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleAddTopic = (subject: Subject) => {
    setCurrentSubject(subject);
    setShowTopicForm(true);
  };
  
  const handleAddSubTopic = (subject: Subject, topic: Topic) => {
    setCurrentSubject(subject);
    setCurrentTopic(topic);
    setShowSubTopicForm(true);
  };

  return (
    <div className="lg:col-span-2 bg-white p-3 sm:p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Matérias e Temas</h2>
        <button
          onClick={() => setShowSubjectForm(true)}
          className="text-warrior-blue hover:text-blue-700 flex items-center text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Adicionar Matéria
        </button>
      </div>
      
      {/* Subject form */}
      <SubjectForm
        subjects={subjects}
        setSubjects={setSubjects}
        showSubjectForm={showSubjectForm}
        setShowSubjectForm={setShowSubjectForm}
      />
      
      {/* Subject/Topic/Subtopic tree */}
      <div className="overflow-y-auto max-h-[500px] sm:max-h-[600px]">
        {subjects.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            Nenhuma matéria cadastrada. Adicione uma matéria para começar!
          </div>
        ) : (
          subjects.map((subject) => (
            <SubjectItem
              key={subject.id}
              subject={subject}
              expanded={!!expandedSubjects[subject.id]}
              expandedTopics={expandedTopics}
              onToggleSubject={toggleSubject}
              onToggleTopic={toggleTopic}
              onDeleteSubject={onDeleteSubject}
              onAddTopic={handleAddTopic}
              onAddQuestion={onAddQuestion}
              onEditQuestion={onEditQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onDeleteTopic={onDeleteTopic}
              onDeleteSubTopic={onDeleteSubTopic}
              onAddSubTopic={handleAddSubTopic}
              showTopicForm={showTopicForm}
              showSubTopicForm={showSubTopicForm}
              currentSubject={currentSubject}
              currentTopic={currentTopic}
              subjects={subjects}
              setSubjects={setSubjects}
              setCurrentSubject={setCurrentSubject}
              setCurrentTopic={setCurrentTopic}
              setShowTopicForm={setShowTopicForm}
              setShowSubTopicForm={setShowSubTopicForm}
              setExpandedTopics={setExpandedTopics}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectList;
