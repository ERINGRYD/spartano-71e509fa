
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic, SubTopic, Question } from '@/utils/types';
import { saveSubject } from '@/utils/storage';
import { generateSampleImportData } from '@/utils/exampleData';
import { Download, FileUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ImportEnemies = ({ onImport, onCancel }: { onImport: () => void, onCancel: () => void }) => {
  const [importText, setImportText] = useState('');
  const [selectedType, setSelectedType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImport = () => {
    try {
      if (!importText.trim()) {
        toast.error('Por favor, adicione algum conteúdo para importar.');
        return;
      }
      
      const importData = JSON.parse(importText.trim()) as Partial<Subject>;
      
      if (!importData.name) {
        toast.error('O nome da matéria é obrigatório.');
        return;
      }
      
      if (!importData.topics || !Array.isArray(importData.topics) || importData.topics.length === 0) {
        toast.error('Pelo menos um tema é obrigatório.');
        return;
      }
      
      // Validate and create IDs for all entities
      const newSubject: Subject = {
        id: uuidv4(),
        name: importData.name,
        topics: [],
        progress: 0
      };
      
      importData.topics.forEach(importTopic => {
        if (!importTopic.name) {
          toast.error('Todos os temas devem ter um nome.');
          return;
        }
        
        const newTopic: Topic = {
          id: uuidv4(),
          name: importTopic.name,
          subTopics: [],
          questions: [],
          progress: 0
        };
        
        // Process questions directly in the topic
        if (importTopic.questions && Array.isArray(importTopic.questions)) {
          importTopic.questions.forEach((importQuestion: any) => {
            if (!validateQuestion(importQuestion)) {
              return;
            }
            
            const newQuestion: Question = {
              id: uuidv4(),
              text: importQuestion.text,
              type: importQuestion.type || 'multiple_choice',
              options: importQuestion.options.map((opt: any) => ({
                id: uuidv4(),
                text: opt.text,
                isCorrect: opt.isCorrect,
                comment: opt.comment
              })),
              difficulty: importQuestion.difficulty || 'medium',
              examBoard: importQuestion.examBoard,
              year: importQuestion.year,
              organization: importQuestion.organization
            };
            
            newTopic.questions.push(newQuestion);
          });
        }
        
        // Process subtopics
        if (importTopic.subTopics && Array.isArray(importTopic.subTopics)) {
          importTopic.subTopics.forEach((importSubTopic: any) => {
            if (!importSubTopic.name) {
              toast.error('Todos os subtemas devem ter um nome.');
              return;
            }
            
            const newSubTopic: SubTopic = {
              id: uuidv4(),
              name: importSubTopic.name,
              questions: [],
              progress: 0
            };
            
            // Process questions in subtopic
            if (importSubTopic.questions && Array.isArray(importSubTopic.questions)) {
              importSubTopic.questions.forEach((importQuestion: any) => {
                if (!validateQuestion(importQuestion)) {
                  return;
                }
                
                const newQuestion: Question = {
                  id: uuidv4(),
                  text: importQuestion.text,
                  type: importQuestion.type || 'multiple_choice',
                  options: importQuestion.options.map((opt: any) => ({
                    id: uuidv4(),
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    comment: opt.comment
                  })),
                  difficulty: importQuestion.difficulty || 'medium',
                  examBoard: importQuestion.examBoard,
                  year: importQuestion.year,
                  organization: importQuestion.organization
                };
                
                newSubTopic.questions.push(newQuestion);
              });
            }
            
            newTopic.subTopics.push(newSubTopic);
          });
        }
        
        newSubject.topics.push(newTopic);
      });
      
      // Save the new subject
      saveSubject(newSubject);
      toast.success('Conteúdo importado com sucesso!');
      onImport();
    } catch (error) {
      console.error('Error importing enemies:', error);
      toast.error('Erro ao importar. Por favor, verifique o formato JSON.');
    }
  };
  
  const validateQuestion = (question: any): boolean => {
    if (!question.text) {
      toast.error('Todas as questões devem ter um enunciado.');
      return false;
    }
    
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
      toast.error('Todas as questões devem ter pelo menos duas opções.');
      return false;
    }
    
    if (!question.options.some((opt: any) => opt.isCorrect)) {
      toast.error('Cada questão deve ter pelo menos uma opção correta.');
      return false;
    }
    
    return true;
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };
  
  const downloadSample = () => {
    const content = generateSampleImportData(selectedType);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `example_${selectedType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Importar Inimigos</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="w-6 h-6 text-blue-500 mr-2" />
          <div>
            <p className="text-sm text-blue-700">
              Importe matérias, temas, subtemas e questões em formato JSON. 
              Baixe o exemplo para ver a estrutura correta.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Formato do exemplo:</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="multiple_choice"
              checked={selectedType === 'multiple_choice'}
              onChange={() => setSelectedType('multiple_choice')}
              className="mr-2"
            />
            Múltipla Escolha
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="true_false"
              checked={selectedType === 'true_false'}
              onChange={() => setSelectedType('true_false')}
              className="mr-2"
            />
            Certo ou Errado
          </label>
        </div>
      </div>
      
      <div className="flex mb-6 space-x-4">
        <button
          onClick={downloadSample}
          className="flex items-center px-4 py-2 bg-warrior-blue text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Exemplo
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          <FileUp className="w-4 h-4 mr-2" />
          Carregar Arquivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conteúdo JSON:
        </label>
        <textarea
          className="w-full h-64 border rounded-md p-2 font-mono text-sm"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='{"name": "Matéria", "topics": [...]}'
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleImport}
          className="px-4 py-2 text-white bg-warrior-primary rounded-md hover:opacity-90"
        >
          Importar
        </button>
      </div>
    </div>
  );
};

export default ImportEnemies;
