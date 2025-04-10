
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic, SubTopic, Enemy } from '@/utils/types';
import { getSubjects, saveEnemy } from '@/utils/storage';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

interface EnemyFormProps {
  onSave: (enemy: Enemy) => void;
  onCancel: () => void;
  editEnemy?: Enemy;
}

const EnemyForm = ({ onSave, onCancel, editEnemy }: EnemyFormProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [name, setName] = useState('');
  
  useEffect(() => {
    const loadSubjects = () => {
      const subjects = getSubjects();
      setSubjects(subjects);
      
      if (editEnemy) {
        setName(editEnemy.name);
        
        // Find the selected subject, topic and subtopic
        const subject = subjects.find(s => s.id === editEnemy.subjectId);
        if (subject) {
          setSelectedSubject(subject);
          
          const topic = subject.topics.find(t => t.id === editEnemy.topicId);
          if (topic) {
            setSelectedTopic(topic);
            
            if (editEnemy.subTopicId) {
              const subTopic = topic.subTopics.find(st => st.id === editEnemy.subTopicId);
              if (subTopic) {
                setSelectedSubTopic(subTopic);
              }
            }
          }
        }
      }
    };
    
    loadSubjects();
  }, [editEnemy]);
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    const subject = subjects.find(s => s.id === subjectId) || null;
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
  };
  
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topicId = e.target.value;
    const topic = selectedSubject?.topics.find(t => t.id === topicId) || null;
    setSelectedTopic(topic);
    setSelectedSubTopic(null);
  };
  
  const handleSubTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subTopicId = e.target.value;
    if (subTopicId === "") {
      setSelectedSubTopic(null);
    } else {
      const subTopic = selectedTopic?.subTopics.find(st => st.id === subTopicId) || null;
      setSelectedSubTopic(subTopic);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedTopic) {
      toast.error('Por favor, selecione assunto e tema!');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Por favor, dê um nome ao inimigo!');
      return;
    }
    
    // Validate that there are questions to answer
    const hasQuestions = selectedSubTopic 
      ? selectedSubTopic.questions.length > 0
      : selectedTopic.questions.length > 0;
    
    if (!hasQuestions) {
      toast.error('É necessário ter pelo menos uma questão para criar um inimigo!');
      return;
    }
    
    const enemy: Enemy = {
      id: editEnemy?.id || uuidv4(),
      subjectId: selectedSubject.id,
      topicId: selectedTopic.id,
      subTopicId: selectedSubTopic?.id,
      name: name.trim(),
      status: editEnemy?.status || 'ready',
      progress: editEnemy?.progress || 0,
      icon: editEnemy?.icon || 'shield',
      lastReviewed: editEnemy?.lastReviewed,
      nextReviewDates: editEnemy?.nextReviewDates,
      currentReviewIndex: editEnemy?.currentReviewIndex,
    };
    
    saveEnemy(enemy);
    onSave(enemy);
    toast.success(editEnemy ? 'Inimigo atualizado!' : 'Inimigo adicionado!');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{editEnemy ? 'Atualizar Inimigo' : 'Adicionar Inimigo'}</h2>
        <Shield className="w-8 h-8 text-warrior-blue" />
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Inimigo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nome do inimigo"
            required
          />
        </div>
        
        {/* Subject select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <select 
            className="w-full px-3 py-2 border rounded-md"
            value={selectedSubject?.id || ''}
            onChange={handleSubjectChange}
            required
          >
            <option value="">Selecione a matéria</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Topic select */}
        {selectedSubject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={selectedTopic?.id || ''}
              onChange={handleTopicChange}
              required
            >
              <option value="">Selecione o tema</option>
              {selectedSubject.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.questions.length} questões diretas)
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* SubTopic select */}
        {selectedTopic && selectedTopic.subTopics.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtema (Opcional)</label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={selectedSubTopic?.id || ''}
              onChange={handleSubTopicChange}
            >
              <option value="">Nenhum subtema (usar questões do tema)</option>
              {selectedTopic.subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.name} ({subTopic.questions.length} questões)
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-4 py-2 text-white bg-warrior-blue rounded-md hover:bg-blue-700"
          >
            {editEnemy ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnemyForm;
