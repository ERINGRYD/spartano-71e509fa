
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic, SubTopic } from '@/utils/types';
import { saveSubject } from '@/utils/storage';

interface SubTopicFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  currentSubject: Subject;
  currentTopic: Topic;
  setCurrentSubject: React.Dispatch<React.SetStateAction<Subject | null>>;
  setCurrentTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  showSubTopicForm: boolean;
  setShowSubTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubTopicForm = ({
  subjects,
  setSubjects,
  currentSubject,
  currentTopic,
  setCurrentSubject,
  setCurrentTopic,
  showSubTopicForm,
  setShowSubTopicForm
}: SubTopicFormProps) => {
  const [newSubTopicName, setNewSubTopicName] = useState('');
  
  const handleAddSubTopic = () => {
    if (!currentSubject || !currentTopic) return;
    if (!newSubTopicName.trim()) {
      toast.error('O nome do subtema não pode estar vazio!');
      return;
    }
    
    // Check for duplicate subtopic name in the selected topic
    if (currentTopic.subTopics.some(st => st.name === newSubTopicName.trim())) {
      toast.error('Já existe um subtema com este nome neste tema!');
      return;
    }
    
    const newSubTopic: SubTopic = {
      id: uuidv4(),
      name: newSubTopicName.trim(),
      questions: [],
      progress: 0
    };
    
    // Update the topic within the subject
    const updatedTopic = {
      ...currentTopic,
      subTopics: [...currentTopic.subTopics, newSubTopic]
    };
    
    // Update the subject with the updated topic
    const updatedSubject = {
      ...currentSubject,
      topics: currentSubject.topics.map(t => 
        t.id === currentTopic.id ? updatedTopic : t
      )
    };
    
    // Update state
    setSubjects(subjects.map(s => 
      s.id === currentSubject.id ? updatedSubject : s
    ));
    
    // Save to storage
    saveSubject(updatedSubject);
    
    // Reset form
    setNewSubTopicName('');
    setShowSubTopicForm(false);
    setCurrentSubject(null);
    setCurrentTopic(null);
    
    toast.success('Subtema adicionado com sucesso!');
  };
  
  if (!showSubTopicForm) return null;
  
  return (
    <div className="mb-2 sm:mb-3 p-2 sm:p-3 border border-gray-200 rounded-md bg-gray-50">
      <input
        type="text"
        value={newSubTopicName}
        onChange={(e) => setNewSubTopicName(e.target.value)}
        className="w-full mb-2 px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm"
        placeholder="Nome do subtema"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setShowSubTopicForm(false);
            setCurrentSubject(null);
            setCurrentTopic(null);
          }}
          className="px-2 py-0.5 sm:py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddSubTopic}
          className="px-2 py-0.5 sm:py-1 text-xs text-white bg-warrior-blue rounded-md hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default SubTopicForm;
