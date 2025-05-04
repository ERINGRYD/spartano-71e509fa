
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic } from '@/utils/types';
import { saveSubject } from '@/utils/storage';

interface TopicFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  currentSubject: Subject;
  setCurrentSubject: React.Dispatch<React.SetStateAction<Subject | null>>;
  showTopicForm: boolean;
  setShowTopicForm: React.Dispatch<React.SetStateAction<boolean>>;
  setExpandedTopics: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
}

const TopicForm = ({
  subjects,
  setSubjects,
  currentSubject,
  setCurrentSubject,
  showTopicForm,
  setShowTopicForm,
  setExpandedTopics
}: TopicFormProps) => {
  const [newTopicName, setNewTopicName] = useState('');
  
  const handleAddTopic = () => {
    if (!currentSubject) return;
    if (!newTopicName.trim()) {
      toast.error('O nome do tema não pode estar vazio!');
      return;
    }
    
    // Check for duplicate topic name in the selected subject
    if (currentSubject.topics.some(t => t.name === newTopicName.trim())) {
      toast.error('Já existe um tema com este nome nesta matéria!');
      return;
    }
    
    const newTopic: Topic = {
      id: uuidv4(),
      name: newTopicName.trim(),
      subTopics: [],
      questions: [],
      progress: 0
    };
    
    const updatedSubject = {
      ...currentSubject,
      topics: [...currentSubject.topics, newTopic]
    };
    
    // Update state
    setSubjects(subjects.map(s => 
      s.id === currentSubject.id ? updatedSubject : s
    ));
    
    // Save to storage
    saveSubject(updatedSubject);
    
    // Reset form
    setNewTopicName('');
    setShowTopicForm(false);
    setCurrentSubject(null);
    
    // Auto-expand the new topic
    setExpandedTopics(prev => ({
      ...prev,
      [newTopic.id]: true
    }));
    
    toast.success('Tema adicionado com sucesso!');
  };
  
  if (!showTopicForm) return null;
  
  return (
    <div className="mb-3 p-2 sm:p-3 border border-gray-200 rounded-md bg-gray-50">
      <input
        type="text"
        value={newTopicName}
        onChange={(e) => setNewTopicName(e.target.value)}
        className="w-full mb-2 px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm"
        placeholder="Nome do tema"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setShowTopicForm(false);
            setCurrentSubject(null);
          }}
          className="px-2 py-0.5 sm:py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddTopic}
          className="px-2 py-0.5 sm:py-1 text-xs text-white bg-warrior-blue rounded-md hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default TopicForm;
