import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Shield, 
  Plus, 
  FileUp, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash 
} from 'lucide-react';
import { 
  Subject, 
  Topic, 
  SubTopic, 
  Question, 
  Enemy 
} from '@/utils/types';
import { 
  getSubjects, 
  saveSubject, 
  deleteSubject, 
  deleteAllSubjects, 
  getEnemies,
  deleteEnemy,
  deleteAllEnemies
} from '@/utils/storage';
import EnemyForm from '@/components/EnemyForm';
import EnemyCard from '@/components/EnemyCard';
import QuestionForm from '@/components/QuestionForm';
import ImportEnemies from '@/components/ImportEnemies';
import ProgressBar from '@/components/ProgressBar';
import { toast } from 'sonner';

const Enemies = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<{[key: string]: boolean}>({});
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubTopicForm, setShowSubTopicForm] = useState(false);
  const [showEnemyForm, setShowEnemyForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentSubTopic, setCurrentSubTopic] = useState<SubTopic | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null);
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubTopicName, setNewSubTopicName] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const loadedSubjects = getSubjects();
    const loadedEnemies = getEnemies();
    
    setSubjects(loadedSubjects);
    setEnemies(loadedEnemies);
    
    // Expand the first subject by default if there's only one
    if (loadedSubjects.length === 1) {
      setExpandedSubjects({ [loadedSubjects[0].id]: true });
    }
  };
  
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
  
  // Subject CRUD operations
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
  
  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria? Todos os temas, subtemas, questões e inimigos associados serão excluídos!')) {
      deleteSubject(id);
      
      // Remove from state
      setSubjects(subjects.filter(subject => subject.id !== id));
      
      // Also update enemies state by removing enemies tied to this subject
      setEnemies(enemies.filter(enemy => enemy.subjectId !== id));
      
      toast.success('Matéria excluída com sucesso!');
    }
  };
  
  const handleDeleteAllSubjects = () => {
    if (window.confirm('Tem certeza que deseja excluir todas as matérias? Todos os temas, subtemas, questões e inimigos serão excluídos!')) {
      deleteAllSubjects();
      setSubjects([]);
      setEnemies([]);
      toast.success('Todas as matérias foram excluídas!');
    }
  };
  
  // Topic CRUD operations
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
  
  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tema? Todos os subtemas, questões e inimigos associados serão excluídos!')) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const updatedSubject = {
        ...subject,
        topics: subject.topics.filter(t => t.id !== topicId)
      };
      
      // Update state
      setSubjects(subjects.map(s => 
        s.id === subjectId ? updatedSubject : s
      ));
      
      // Save to storage
      saveSubject(updatedSubject);
      
      // Also update enemies state by removing enemies tied to this topic
      const updatedEnemies = enemies.filter(e => !(e.subjectId === subjectId && e.topicId === topicId));
      setEnemies(updatedEnemies);
      
      toast.success('Tema excluído com sucesso!');
    }
  };
  
  // SubTopic CRUD operations
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
  
  const handleDeleteSubTopic = (subjectId: string, topicId: string, subTopicId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este subtema? Todas as questões e inimigos associados serão excluídos!')) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const topic = subject.topics.find(t => t.id === topicId);
      if (!topic) return;
      
      const updatedTopic = {
        ...topic,
        subTopics: topic.subTopics.filter(st => st.id !== subTopicId)
      };
      
      const updatedSubject = {
        ...subject,
        topics: subject.topics.map(t => 
          t.id === topicId ? updatedTopic : t
        )
      };
      
      // Update state
      setSubjects(subjects.map(s => 
        s.id === subjectId ? updatedSubject : s
      ));
      
      // Save to storage
      saveSubject(updatedSubject);
      
      // Also update enemies state by removing enemies tied to this subtopic
      const updatedEnemies = enemies.filter(e => 
        !(e.subjectId === subjectId && e.topicId === topicId && e.subTopicId === subTopicId)
      );
      setEnemies(updatedEnemies);
      
      toast.success('Subtema excluído com sucesso!');
    }
  };
  
  // Question CRUD operations
  const handleAddQuestion = (targetSubjectId: string, targetTopicId: string, targetSubTopicId?: string) => {
    const subject = subjects.find(s => s.id === targetSubjectId);
    if (!subject) return;
    
    const topic = subject.topics.find(t => t.id === targetTopicId);
    if (!topic) return;
    
    setCurrentSubject(subject);
    setCurrentTopic(topic);
    
    if (targetSubTopicId) {
      const subTopic = topic.subTopics.find(st => st.id === targetSubTopicId);
      if (subTopic) {
        setCurrentSubTopic(subTopic);
      }
    } else {
      setCurrentSubTopic(null);
    }
    
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };
  
  const handleEditQuestion = (
    question: Question, 
    targetSubjectId: string, 
    targetTopicId: string, 
    targetSubTopicId?: string
  ) => {
    const subject = subjects.find(s => s.id === targetSubjectId);
    if (!subject) return;
    
    const topic = subject.topics.find(t => t.id === targetTopicId);
    if (!topic) return;
    
    setCurrentSubject(subject);
    setCurrentTopic(topic);
    
    if (targetSubTopicId) {
      const subTopic = topic.subTopics.find(st => st.id === targetSubTopicId);
      if (subTopic) {
        setCurrentSubTopic(subTopic);
      }
    } else {
      setCurrentSubTopic(null);
    }
    
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };
  
  const handleSaveQuestion = (question: Question) => {
    if (!currentSubject || !currentTopic) return;
    
    let updatedSubject: Subject;
    
    if (currentSubTopic) {
      // Update question in subtopic
      const updatedSubTopic = {
        ...currentSubTopic,
        questions: editingQuestion 
          ? currentSubTopic.questions.map(q => q.id === question.id ? question : q)
          : [...currentSubTopic.questions, question]
      };
      
      const updatedTopic = {
        ...currentTopic,
        subTopics: currentTopic.subTopics.map(st => 
          st.id === currentSubTopic.id ? updatedSubTopic : st
        )
      };
      
      updatedSubject = {
        ...currentSubject,
        topics: currentSubject.topics.map(t => 
          t.id === currentTopic.id ? updatedTopic : t
        )
      };
    } else {
      // Update question directly in topic
      const updatedTopic = {
        ...currentTopic,
        questions: editingQuestion 
          ? currentTopic.questions.map(q => q.id === question.id ? question : q)
          : [...currentTopic.questions, question]
      };
      
      updatedSubject = {
        ...currentSubject,
        topics: currentSubject.topics.map(t => 
          t.id === currentTopic.id ? updatedTopic : t
        )
      };
    }
    
    // Update state
    setSubjects(subjects.map(s => 
      s.id === currentSubject.id ? updatedSubject : s
    ));
    
    // Save to storage
    saveSubject(updatedSubject);
    
    // Reset form
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setCurrentSubject(null);
    setCurrentTopic(null);
    setCurrentSubTopic(null);
    
    toast.success(editingQuestion ? 'Questão atualizada com sucesso!' : 'Questão adicionada com sucesso!');
    
    // Update enemies that might be using this question (for topic or subtopic)
    updateEnemiesForTopic(currentSubject.id, currentTopic.id, currentSubTopic?.id);
  };
  
  const handleDeleteQuestion = (
    questionId: string, 
    targetSubjectId: string, 
    targetTopicId: string, 
    targetSubTopicId?: string
  ) => {
    if (window.confirm('Tem certeza que deseja excluir esta questão?')) {
      const subject = subjects.find(s => s.id === targetSubjectId);
      if (!subject) return;
      
      const topic = subject.topics.find(t => t.id === targetTopicId);
      if (!topic) return;
      
      let updatedSubject: Subject;
      
      if (targetSubTopicId) {
        const subTopic = topic.subTopics.find(st => st.id === targetSubTopicId);
        if (!subTopic) return;
        
        const updatedSubTopic = {
          ...subTopic,
          questions: subTopic.questions.filter(q => q.id !== questionId)
        };
        
        const updatedTopic = {
          ...topic,
          subTopics: topic.subTopics.map(st => 
            st.id === targetSubTopicId ? updatedSubTopic : st
          )
        };
        
        updatedSubject = {
          ...subject,
          topics: subject.topics.map(t => 
            t.id === targetTopicId ? updatedTopic : t
          )
        };
      } else {
        const updatedTopic = {
          ...topic,
          questions: topic.questions.filter(q => q.id !== questionId)
        };
        
        updatedSubject = {
          ...subject,
          topics: subject.topics.map(t => 
            t.id === targetTopicId ? updatedTopic : t
          )
        };
      }
      
      // Update state
      setSubjects(subjects.map(s => 
        s.id === targetSubjectId ? updatedSubject : s
      ));
      
      // Save to storage
      saveSubject(updatedSubject);
      
      toast.success('Questão excluída com sucesso!');
      
      // Update enemies that might be using this question (for topic or subtopic)
      updateEnemiesForTopic(targetSubjectId, targetTopicId, targetSubTopicId);
    }
  };
  
  // Enemy operations
  const handleAddEnemy = () => {
    setEditingEnemy(null);
    setShowEnemyForm(true);
  };
  
  const handleEditEnemy = (enemy: Enemy) => {
    setEditingEnemy(enemy);
    setShowEnemyForm(true);
  };
  
  const handleSaveEnemy = (enemy: Enemy) => {
    if (editingEnemy) {
      // Update existing enemy
      setEnemies(enemies.map(e => e.id === enemy.id ? enemy : e));
    } else {
      // Add new enemy
      setEnemies([...enemies, enemy]);
    }
    
    setShowEnemyForm(false);
    setEditingEnemy(null);
  };
  
  const handleDeleteEnemy = (enemyId: string) => {
    deleteEnemy(enemyId);
    setEnemies(enemies.filter(e => e.id !== enemyId));
    toast.success('Inimigo excluído com sucesso!');
  };
  
  const handleDeleteAllEnemies = () => {
    if (window.confirm('Tem certeza que deseja excluir todos os inimigos?')) {
      deleteAllEnemies();
      setEnemies([]);
      toast.success('Todos os inimigos foram excluídos!');
    }
  };
  
  // Update enemies tied to a topic or subtopic 
  // (e.g., when a question is added/edited/deleted)
  const updateEnemiesForTopic = (subjectId: string, topicId: string, subTopicId?: string) => {
    // Find enemies tied to this topic/subtopic and refresh them
    const updatedEnemies = enemies.map(enemy => {
      if (
        enemy.subjectId === subjectId && 
        enemy.topicId === topicId && 
        (subTopicId ? enemy.subTopicId === subTopicId : true)
      ) {
        // Just trigger a minor update to refresh the enemy
        return { ...enemy };
      }
      return enemy;
    });
    
    setEnemies(updatedEnemies);
  };
  
  const handleImportComplete = () => {
    loadData();
    setShowImportForm(false);
    toast.success('Importação concluída com sucesso!');
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Inimigos</h1>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={handleAddEnemy}
            className="btn-warrior-primary flex items-center text-xs sm:text-sm p-1.5 sm:p-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Adicionar
          </button>
          <button
            onClick={() => setShowImportForm(true)}
            className="btn-warrior-secondary flex items-center text-xs sm:text-sm p-1.5 sm:p-2"
          >
            <FileUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Importar
          </button>
          <button
            onClick={handleDeleteAllEnemies}
            className="btn-warrior-danger flex items-center text-xs sm:text-sm p-1.5 sm:p-2"
            title="Apagar todos os inimigos"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Apagar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column: Subject/Topic/Question tree */}
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
          {showSubjectForm && (
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
          )}
          
          {/* Subject/Topic/Subtopic tree */}
          <div className="overflow-y-auto max-h-[500px] sm:max-h-[600px]">
            {subjects.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                Nenhuma matéria cadastrada. Adicione uma matéria para começar!
              </div>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="mb-3 sm:mb-4">
                  {/* Subject row */}
                  <div 
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center flex-grow">
                      {expandedSubjects[subject.id] ? 
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
                        handleDeleteSubject(subject.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  {/* Topics */}
                  {expandedSubjects[subject.id] && (
                    <div className="pl-4 sm:pl-6 mt-2">
                      {/* Add topic button */}
                      <button
                        onClick={() => {
                          setCurrentSubject(subject);
                          setShowTopicForm(true);
                        }}
                        className="mb-2 text-xs sm:text-sm text-warrior-blue hover:text-blue-700 flex items-center"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Adicionar Tema
                      </button>
                      
                      {/* Topic form */}
                      {showTopicForm && currentSubject?.id === subject.id && (
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
                      )}
                      
                      {subject.topics.length === 0 ? (
                        <div className="text-xs sm:text-sm text-gray-500 py-1 sm:py-2">
                          Nenhum tema cadastrado nesta matéria.
                        </div>
                      ) : (
                        subject.topics.map((topic) => (
                          <div key={topic.id} className="mb-2">
                            {/* Topic row */}
                            <div 
                              className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleTopic(topic.id)}
                            >
                              <div className="flex items-center flex-grow">
                                {expandedTopics[topic.id] ? 
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
                                    handleAddQuestion(subject.id, topic.id);
                                  }}
                                  className="text-green-500 hover:text-green-700 p-0.5 sm:p-1"
                                  title="Adicionar questão"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTopic(subject.id, topic.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
                                  title="Excluir tema"
                                >
                                  <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Topic content when expanded */}
                            {expandedTopics[topic.id] && (
                              <div className="pl-3 sm:pl-4 mt-1 sm:mt-2">
                                {/* Topic questions */}
                                {topic.questions.length > 0 && (
                                  <div className="mb-2 sm:mb-3">
                                    <div className="text-xs sm:text-sm font-medium mb-1">Questões do tema:</div>
                                    {topic.questions.map((question) => (
                                      <div key={question.id} className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 border border-gray-200 rounded-md mb-1">
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
                                            onClick={() => handleEditQuestion(question, subject.id, topic.id)}
                                            className="text-blue-500 hover:text-blue-700 p-0.5 sm:p-1"
                                            title="Editar questão"
                                          >
                                            <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteQuestion(question.id, subject.id, topic.id)}
                                            className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
                                            title="Excluir questão"
                                          >
                                            <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Add subtopic button */}
                                <button
                                  onClick={() => {
                                    setCurrentSubject(subject);
                                    setCurrentTopic(topic);
                                    setShowSubTopicForm(true);
                                  }}
                                  className="mb-1 sm:mb-2 text-xs sm:text-sm text-warrior-blue hover:text-blue-700 flex items-center"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                  Adicionar Subtema
                                </button>
                                
                                {/* Subtopic form */}
                                {showSubTopicForm && currentSubject?.id === subject.id && currentTopic?.id === topic.id && (
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
                                )}
                                
                                {/* Subtopics */}
                                {topic.subTopics.map((subTopic) => (
                                  <div key={subTopic.id} className="mb-2">
                                    <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-
