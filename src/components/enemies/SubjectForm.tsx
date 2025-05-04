
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from '@/utils/types';
import { saveSubject } from '@/utils/storage';

interface SubjectFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  showSubjectForm: boolean;
  setShowSubjectForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubjectForm = ({
  subjects,
  setSubjects,
  showSubjectForm,
  setShowSubjectForm
}: SubjectFormProps) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error('O nome da matéria não pode estar vazio!');
      return;
    }
    
    // Check for duplicate subject name
    if (subjects.some(s => s.name === newSubjectName.trim())) {
      toast.error('Já existe uma matéria com este nome!');
      return;
    }
    
    const newSubject: Subject = {
      id: uuidv4(),
      name: newSubjectName.trim(),
      topics: [],
      progress: 0
    };
    
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    saveSubject(newSubject);
    
    setNewSubjectName('');
    setShowSubjectForm(false);
    toast.success('Matéria adicionada com sucesso!');
  };

  if (!showSubjectForm) return null;
  
  return (
    <div className="mb-3 sm:mb-4 p-3 sm:p-4 border border-gray-200 rounded-md bg-gray-50">
      <input
        type="text"
        value={newSubjectName}
        onChange={(e) => setNewSubjectName(e.target.value)}
        className="w-full mb-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md text-sm"
        placeholder="Nome da matéria"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowSubjectForm(false)}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddSubject}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-white bg-warrior-blue rounded-md hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default SubjectForm;
