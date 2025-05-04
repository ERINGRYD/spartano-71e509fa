
import { useState, useEffect } from 'react';
import { Plus, FileUp, Trash2 } from 'lucide-react';
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
import QuestionForm from '@/components/QuestionForm';
import ImportEnemies from '@/components/ImportEnemies';
import { toast } from 'sonner';

// Import components
import SubjectList from '@/components/enemies/SubjectList';
import EnemyList from '@/components/enemies/EnemyList';

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
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const loadedSubjects = await getSubjects();
    const loadedEnemies = await getEnemies();
    
    setSubjects(loadedSubjects);
    setEnemies(loadedEnemies);
    
    // Expand the first subject by default if there's only one
    if (loadedSubjects.length === 1) {
      setExpandedSubjects({ [loadedSubjects[0].id]: true });
    }
  };
  
  // Subject operations
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
  
  // Topic operations
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
  
  // SubTopic operations
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
  
  // Question operations
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
        <SubjectList
          subjects={subjects}
          setSubjects={setSubjects}
          expandedSubjects={expandedSubjects}
          expandedTopics={expandedTopics}
          setExpandedSubjects={setExpandedSubjects}
          setExpandedTopics={setExpandedTopics}
          showSubjectForm={showSubjectForm}
          setShowSubjectForm={setShowSubjectForm}
          showTopicForm={showTopicForm}
          setShowTopicForm={setShowTopicForm}
          showSubTopicForm={showSubTopicForm}
          setShowSubTopicForm={setShowSubTopicForm}
          currentSubject={currentSubject}
          setCurrentSubject={setCurrentSubject}
          currentTopic={currentTopic}
          setCurrentTopic={setCurrentTopic}
          onDeleteSubject={handleDeleteSubject}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onDeleteTopic={handleDeleteTopic}
          onDeleteSubTopic={handleDeleteSubTopic}
        />

        {/* Right column: Enemy list */}
        <div className="lg:col-span-1">
          <EnemyList 
            enemies={enemies}
            onEdit={handleEditEnemy}
            onDelete={handleDeleteEnemy}
          />
        </div>
      </div>

      {/* Modals */}
      {showQuestionForm && (
        <QuestionForm
          question={editingQuestion || undefined}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          subjectId={currentSubject?.id}
          topicId={currentTopic?.id}
          subTopicId={currentSubTopic?.id}
        />
      )}

      {showEnemyForm && (
        <EnemyForm
          enemy={editingEnemy || undefined}
          subjects={subjects}
          onSave={handleSaveEnemy}
          onCancel={() => {
            setShowEnemyForm(false);
            setEditingEnemy(null);
          }}
        />
      )}
      
      {showImportForm && (
        <ImportEnemies
          onImportComplete={handleImportComplete}
          onCancel={() => setShowImportForm(false)}
        />
      )}
    </div>
  );
};

export default Enemies;
