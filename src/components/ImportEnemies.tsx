import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Topic, SubTopic, Question } from '@/utils/types';
import { saveSubject } from '@/utils/storage';
import { Download, FileUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportEnemiesProps {
  onImportComplete: () => void; // Keep this name consistent
  onCancel: () => void;
}

const ImportEnemies = ({ onImportComplete, onCancel }: ImportEnemiesProps) => {
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
      onImportComplete(); // Use consistent naming here
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
  
  const generateSampleMultipleChoice = () => {
    return JSON.stringify({
      name: "Matemática",
      topics: [
        {
          name: "Álgebra",
          questions: [
            {
              text: "Qual é o resultado de 2x + 5 = 15?",
              type: "multiple_choice",
              difficulty: "medium",
              examBoard: "ENEM",
              year: 2023,
              organization: "MEC",
              options: [
                {
                  text: "x = 5",
                  isCorrect: true,
                  comment: "Correto! Subtraindo 5 de ambos os lados temos 2x = 10, e dividindo por 2, x = 5."
                },
                {
                  text: "x = 7",
                  isCorrect: false,
                  comment: "Incorreto. Substituindo x = 7 na equação, teríamos 2(7) + 5 = 19, não 15."
                },
                {
                  text: "x = 10",
                  isCorrect: false,
                  comment: "Incorreto. Substituindo x = 10 na equação, teríamos 2(10) + 5 = 25, não 15."
                },
                {
                  text: "x = 3",
                  isCorrect: false,
                  comment: "Incorreto. Substituindo x = 3 na equação, teríamos 2(3) + 5 = 11, não 15."
                }
              ]
            }
          ],
          subTopics: [
            {
              name: "Equações de 2º Grau",
              questions: [
                {
                  text: "Quais são as raízes da equação x² - 5x + 6 = 0?",
                  type: "multiple_choice",
                  difficulty: "hard",
                  examBoard: "ENEM",
                  year: 2023,
                  organization: "MEC",
                  options: [
                    {
                      text: "x = 2 e x = 3",
                      isCorrect: true,
                      comment: "Correto! Usando a fórmula de Bhaskara ou fatorando (x - 2)(x - 3) = 0."
                    },
                    {
                      text: "x = -2 e x = -3",
                      isCorrect: false,
                      comment: "Incorreto. Substituindo esses valores na equação original, não se obtém zero."
                    },
                    {
                      text: "x = 1 e x = 6",
                      isCorrect: false,
                      comment: "Incorreto. Substituindo esses valores na equação original, não se obtém zero."
                    },
                    {
                      text: "x = -1 e x = -6",
                      isCorrect: false,
                      comment: "Incorreto. Substituindo esses valores na equação original, não se obtém zero."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }, null, 2);
  };
  
  const generateSampleTrueFalse = () => {
    return JSON.stringify({
      name: "História do Brasil",
      topics: [
        {
          name: "Período Colonial",
          questions: [
            {
              text: "O Brasil foi descoberto oficialmente em 22 de abril de 1500 por Pedro Álvares Cabral.",
              type: "true_false",
              difficulty: "easy",
              examBoard: "ENEM",
              year: 2023,
              organization: "MEC",
              options: [
                {
                  text: "Certo",
                  isCorrect: true,
                  comment: "Correto! O descobrimento oficial do Brasil por Pedro Álvares Cabral ocorreu em 22 de abril de 1500."
                },
                {
                  text: "Errado",
                  isCorrect: false,
                  comment: "Incorreto. A data oficial do descobrimento do Brasil é 22 de abril de 1500, quando Pedro Álvares Cabral chegou à costa brasileira."
                }
              ]
            }
          ],
          subTopics: [
            {
              name: "Ciclo do Ouro",
              questions: [
                {
                  text: "O Ciclo do Ouro no Brasil ocorreu principalmente no século XIX.",
                  type: "true_false",
                  difficulty: "medium",
                  examBoard: "ENEM",
                  year: 2022,
                  organization: "MEC",
                  options: [
                    {
                      text: "Certo",
                      isCorrect: false,
                      comment: "Incorreto. O Ciclo do Ouro ocorreu principalmente durante o século XVIII (1700-1799)."
                    },
                    {
                      text: "Errado",
                      isCorrect: true,
                      comment: "Correto! O Ciclo do Ouro ocorreu principalmente durante o século XVIII, não no século XIX."
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }, null, 2);
  };
  
  const downloadSample = () => {
    let content = '';
    
    if (selectedType === 'multiple_choice') {
      content = generateSampleMultipleChoice();
    } else {
      content = generateSampleTrueFalse();
    }
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exemplo_${selectedType === 'multiple_choice' ? 'multipla_escolha' : 'certo_errado'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Importar Inimigos</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" />
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
        <div className="flex flex-wrap gap-4">
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
      
      <div className="flex flex-wrap mb-6 gap-4">
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
