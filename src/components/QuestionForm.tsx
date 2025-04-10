
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, Option } from '@/utils/types';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionFormProps {
  onSave: (question: Question) => void;
  onCancel: () => void;
  editQuestion?: Question;
}

const QuestionForm = ({ onSave, onCancel, editQuestion }: QuestionFormProps) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [options, setOptions] = useState<Omit<Option, 'id'>[]>([
    { text: '', isCorrect: false, comment: '' },
    { text: '', isCorrect: false, comment: '' }
  ]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [examBoard, setExamBoard] = useState('');
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [organization, setOrganization] = useState('');

  useEffect(() => {
    if (editQuestion) {
      setQuestionText(editQuestion.text);
      setQuestionType(editQuestion.type);
      setOptions(
        editQuestion.options.map(({ id, ...rest }) => rest)
      );
      setDifficulty(editQuestion.difficulty);
      setExamBoard(editQuestion.examBoard || '');
      setYear(editQuestion.year);
      setOrganization(editQuestion.organization || '');
    }
  }, [editQuestion]);

  useEffect(() => {
    // Reset options when question type changes
    if (questionType === 'true_false') {
      setOptions([
        { text: 'Certo', isCorrect: false, comment: '' },
        { text: 'Errado', isCorrect: false, comment: '' }
      ]);
    } else if (options.length < 2) {
      setOptions([
        { text: '', isCorrect: false, comment: '' },
        { text: '', isCorrect: false, comment: '' }
      ]);
    }
  }, [questionType]);

  const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // If setting this option as correct and it's multiple choice, set others to false
    if (field === 'isCorrect' && value === true && questionType === 'multiple_choice') {
      newOptions.forEach((option, i) => {
        if (i !== index) {
          newOptions[i] = { ...newOptions[i], isCorrect: false };
        }
      });
    }
    
    // For true/false, if one option is set to correct, the other must be false
    if (field === 'isCorrect' && questionType === 'true_false') {
      const otherIndex = index === 0 ? 1 : 0;
      newOptions[otherIndex] = { ...newOptions[otherIndex], isCorrect: !value };
    }
    
    setOptions(newOptions);
  };

  const addOption = () => {
    if (questionType === 'true_false') return;
    
    setOptions([...options, { text: '', isCorrect: false, comment: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('A questão precisa ter pelo menos duas opções!');
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!questionText.trim()) {
      toast.error('O texto da questão não pode estar vazio!');
      return;
    }
    
    // Check if there's at least one correct option
    if (!options.some(option => option.isCorrect)) {
      toast.error('Pelo menos uma opção deve ser correta!');
      return;
    }
    
    // Check if all option texts are filled
    if (options.some(option => !option.text.trim())) {
      toast.error('Todas as opções precisam ter texto!');
      return;
    }
    
    const question: Question = {
      id: editQuestion?.id || uuidv4(),
      text: questionText.trim(),
      type: questionType,
      options: options.map(option => ({
        id: uuidv4(),
        text: option.text.trim(),
        isCorrect: option.isCorrect,
        comment: option.comment ? option.comment.trim() : undefined
      })),
      difficulty,
      examBoard: examBoard.trim() || undefined,
      year: year || undefined,
      organization: organization.trim() || undefined
    };
    
    onSave(question);
    toast.success(editQuestion ? 'Questão atualizada!' : 'Questão adicionada!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{editQuestion ? 'Editar Questão' : 'Nova Questão'}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado da Questão</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Digite o enunciado da questão..."
            required
          />
        </div>
        
        {/* Question Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Questão</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="multiple_choice"
                checked={questionType === 'multiple_choice'}
                onChange={() => setQuestionType('multiple_choice')}
                className="mr-2"
              />
              Múltipla Escolha
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="true_false"
                checked={questionType === 'true_false'}
                onChange={() => setQuestionType('true_false')}
                className="mr-2"
              />
              Certo ou Errado
            </label>
          </div>
        </div>
        
        {/* Options */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Opções</label>
            {questionType === 'multiple_choice' && (
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-warrior-blue hover:underline"
              >
                + Adicionar opção
              </button>
            )}
          </div>
          
          {options.map((option, index) => (
            <div key={index} className="mb-4 border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <input
                    type={questionType === 'multiple_choice' ? 'radio' : 'radio'}
                    checked={option.isCorrect}
                    onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    name="correctOption"
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {questionType === 'true_false' ? option.text : `Opção ${String.fromCharCode(65 + index)}`}
                  </span>
                </div>
                
                {questionType === 'multiple_choice' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-warrior-red hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {questionType === 'multiple_choice' && (
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                  placeholder={`Texto da opção ${String.fromCharCode(65 + index)}`}
                  required
                />
              )}
              
              <textarea
                value={option.comment || ''}
                onChange={(e) => handleOptionChange(index, 'comment', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Comentário (opcional)"
              />
            </div>
          ))}
        </div>
        
        {/* Difficulty */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="easy">Fácil</option>
            <option value="medium">Média</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exam Board */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banca (Opcional)</label>
            <input
              type="text"
              value={examBoard}
              onChange={(e) => setExamBoard(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ex: CESPE, FCC"
            />
          </div>
          
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano (Opcional)</label>
            <input
              type="number"
              value={year || ''}
              onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ex: 2023"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          
          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Órgão (Opcional)</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ex: TRT, STF"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
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
            {editQuestion ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
