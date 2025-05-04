import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic, SubTopic, Enemy } from '@/utils/types';
import { getSubjects, saveEnemy } from '@/utils/storage';
import { Shield, Sword, AlertTriangle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface EnemyFormProps {
  onSave: (enemy: Enemy) => void;
  onCancel: () => void;
  enemy?: Enemy; // Changed from editEnemy to enemy
  subjects?: Subject[]; // Added subjects prop
}

const EnemyForm = ({ onSave, onCancel, enemy: editEnemy, subjects: initialSubjects }: EnemyFormProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('shield');
  const [autoPromote, setAutoPromote] = useState<boolean>(false);
  
  const iconOptions = [
    { value: 'shield', label: 'Escudo', component: <Shield className="w-5 h-5" /> },
    { value: 'sword', label: 'Espada', component: <Sword className="w-5 h-5" /> },
    { value: 'alert-triangle', label: 'Alerta', component: <AlertTriangle className="w-5 h-5" /> },
    { value: 'alert-circle', label: 'Perigo', component: <AlertCircle className="w-5 h-5" /> },
    { value: 'eye', label: 'Observação', component: <Eye className="w-5 h-5" /> },
  ];
  
  useEffect(() => {
    const loadSubjects = async () => {
      const loadedSubjects = initialSubjects || await getSubjects();
      setSubjects(loadedSubjects);
      
      if (editEnemy) {
        setName(editEnemy.name);
        setSelectedIcon(editEnemy.icon || 'shield');
        setAutoPromote(editEnemy.autoPromoteEnabled || false);
        
        // Find the selected subject, topic and subtopic
        const subject = loadedSubjects.find(s => s.id === editEnemy.subjectId);
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
  }, [editEnemy, initialSubjects]);
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    const subject = subjects.find(s => s.id === subjectId) || null;
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
    setName(''); // Reset name when subject changes
  };
  
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topicId = e.target.value;
    const topic = selectedSubject?.topics.find(t => t.id === topicId) || null;
    setSelectedTopic(topic);
    setSelectedSubTopic(null);
    // Set name to topic name automatically
    if (topic) {
      setName(topic.name);
    } else {
      setName('');
    }
  };
  
  const handleSubTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subTopicId = e.target.value;
    if (subTopicId === "") {
      setSelectedSubTopic(null);
      // Reset to topic name when no subtopic is selected
      if (selectedTopic) {
        setName(selectedTopic.name);
      }
    } else {
      const subTopic = selectedTopic?.subTopics.find(st => st.id === subTopicId) || null;
      setSelectedSubTopic(subTopic);
      // Set name to subtopic name automatically
      if (subTopic) {
        setName(subTopic.name);
      }
    }
  };
  
  const handleIconChange = (iconValue: string) => {
    setSelectedIcon(iconValue);
  };
  
  const checkNameAvailability = (name: string, enemyId?: string): boolean => {
    const enemies = JSON.parse(localStorage.getItem(`warrior_enemies`) || '[]');
    return !enemies.some(e => e.name === name && e.id !== enemyId);
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
    
    // Check for duplicate name
    if (!checkNameAvailability(name.trim(), editEnemy?.id)) {
      toast.error('Já existe um inimigo com este nome!');
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
      icon: selectedIcon,
      lastReviewed: editEnemy?.lastReviewed,
      nextReviewDates: editEnemy?.nextReviewDates,
      currentReviewIndex: editEnemy?.currentReviewIndex,
      autoPromoteEnabled: autoPromote,
      readySince: editEnemy?.readySince || new Date().toISOString(),
    };
    
    saveEnemy(enemy);
    onSave(enemy);
    toast.success(editEnemy ? 'Inimigo atualizado!' : 'Inimigo adicionado!');
  };
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">{editEnemy ? 'Atualizar Inimigo' : 'Adicionar Inimigo'}</h2>
        <Shield className="w-7 h-7 text-warrior-blue" />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Subject select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <select 
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={selectedSubject?.id || ''}
            onChange={handleSubjectChange}
            required
          >
            <option value="">Selecione a matéria</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.progress}% concluído
              </option>
            ))}
          </select>
        </div>
        
        {/* Topic select */}
        {selectedSubject && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
            <select 
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={selectedTopic?.id || ''}
              onChange={handleTopicChange}
              required
            >
              <option value="">Selecione o tema</option>
              {selectedSubject.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.questions.length} questões diretas) - {topic.progress}% concluído
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* SubTopic select */}
        {selectedTopic && selectedTopic.subTopics.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtema (Opcional)</label>
            <select 
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={selectedSubTopic?.id || ''}
              onChange={handleSubTopicChange}
            >
              <option value="">Nenhum subtema (usar questões do tema)</option>
              {selectedTopic.subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.name} ({subTopic.questions.length} questões) - {subTopic.progress}% concluído
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Inimigo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nome do inimigo"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            O nome do inimigo foi preenchido automaticamente com base no tema/subtema selecionado. 
            Você pode alterar se desejar.
          </p>
        </div>
        
        {/* Icon selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
          <div className="flex flex-wrap gap-3">
            {iconOptions.map(icon => (
              <button
                key={icon.value}
                type="button"
                onClick={() => handleIconChange(icon.value)}
                className={`flex flex-col items-center justify-center p-2 rounded-md ${
                  selectedIcon === icon.value 
                    ? 'bg-warrior-blue text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="mb-1">{icon.component}</div>
                <span className="text-xs">{icon.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Auto promote */}
        <div className="flex items-center">
          <input
            id="autoPromote"
            type="checkbox"
            checked={autoPromote}
            onChange={(e) => setAutoPromote(e.target.checked)}
            className="w-4 h-4 text-warrior-blue rounded"
          />
          <label htmlFor="autoPromote" className="ml-2 block text-sm text-gray-700">
            Promover automaticamente após 3 dias
          </label>
        </div>
        
        <div className="mt-4 sm:mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-3 py-1.5 text-sm text-white bg-warrior-blue rounded-md hover:bg-blue-700"
          >
            {editEnemy ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnemyForm;
