import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import './Simulado.scss';

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface SimuladoConfig {
  duration: number;
  totalQuestions: number;
  selectedSubjects: string[];
}

const SimuladoPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [config, setConfig] = useState<SimuladoConfig>({
    duration: 120,
    totalQuestions: 30,
    selectedSubjects: []
  });
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar o simulado.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (!showConfig && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setIsFinished(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showConfig, isFinished]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startSimulado = () => {
    setTimeLeft(config.duration * 60);
    setShowConfig(false);
    // Mock questions - replace with API call
    const mockQuestions: Question[] = [
      {
        id: 1,
        subject: "Matemática",
        question: "Quanto é 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1
      },
      // Add more mock questions here
    ];
    setQuestions(mockQuestions);
  };

  const handleAnswerSelection = (optionIndex: number) => {
    if (answeredQuestions.has(currentQuestion)) {
      return;
    }

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowAnswer(true);
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));

    // Feedback visual
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      toast({
        title: "Resposta Correta!",
        description: "Continue assim!",
        variant: "default"
      });
    } else {
      toast({
        title: "Resposta Incorreta",
        description: "Não desanime, continue tentando!",
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true);
      // Atualizar progresso do usuário
      updateUserProgress();
    }
  };

  const updateUserProgress = async () => {
    try {
      const score = calculateScore();
      // TODO: Integrar com o sistema de progresso
      toast({
        title: "Progresso Salvo",
        description: `Simulado concluído com ${score.toFixed(2)}% de aproveitamento`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar seu progresso",
        variant: "destructive"
      });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  return (
    <div className="simulado-container">
      {showConfig ? (
        <div className="config-card">
          <h2>Configurar Simulado</h2>
          <div className="config-form">
            <div className="form-group">
              <label>Duração (minutos):</label>
              <input 
                type="number" 
                value={config.duration}
                onChange={(e) => setConfig({...config, duration: Number(e.target.value)})}
                min="30"
                max="240"
              />
            </div>
            <div className="form-group">
              <label>Número de Questões:</label>
              <input 
                type="number" 
                value={config.totalQuestions}
                onChange={(e) => setConfig({...config, totalQuestions: Number(e.target.value)})}
                min="10"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Matérias:</label>
              <select 
                multiple
                value={config.selectedSubjects}
                onChange={(e) => setConfig({
                  ...config, 
                  selectedSubjects: Array.from(e.target.selectedOptions, option => option.value)
                })}
              >
                <option value="matematica">Matemática</option>
                <option value="portugues">Português</option>
                <option value="historia">História</option>
                <option value="geografia">Geografia</option>
                <option value="ciencias">Ciências</option>
              </select>
            </div>
            <button 
              className="start-button"
              onClick={startSimulado}
              disabled={config.selectedSubjects.length === 0}
            >
              Iniciar Simulado
            </button>
          </div>
        </div>
      ) : !isFinished ? (
        <div className="question-card">
          <div className="header">
            <div className="timer">Tempo Restante: {formatTime(timeLeft)}</div>
            <div className="progress">
              Questão {currentQuestion + 1} de {questions.length}
            </div>
          </div>
          <p className="subject">Matéria: {questions[currentQuestion]?.subject}</p>
          <p className="question">{questions[currentQuestion]?.question}</p>
          
          <div className="options">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                className={`option 
                  ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}
                  ${showAnswer ? (index === questions[currentQuestion].correctAnswer ? 'correct' : 'incorrect') : ''}
                `}
                onClick={() => handleAnswerSelection(index)}
                disabled={answeredQuestions.has(currentQuestion)}
              >
                {option}
                {showAnswer && index === questions[currentQuestion].correctAnswer && (
                  <span className="correct-indicator">✓</span>
                )}
              </button>
            ))}
          </div>

          <button 
            className="next-button"
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </button>
        </div>
      ) : (
        <div className="result-card">
          <h2>Resultado do Simulado</h2>
          <p>Sua pontuação: {calculateScore().toFixed(2)}%</p>
          <div className="details">
            <h3>Detalhes por Matéria:</h3>
            {config.selectedSubjects.map(subject => {
              const subjectQuestions = questions.filter(q => q.subject.toLowerCase() === subject);
              const correct = subjectQuestions.reduce((acc, q, idx) => 
                selectedAnswers[idx] === q.correctAnswer ? acc + 1 : acc, 0
              );
              return (
                <div key={subject} className="subject-result">
                  <span>{subject}</span>
                  <span>{(correct / subjectQuestions.length * 100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
          <button onClick={() => window.location.reload()}>
            Fazer novo simulado
          </button>
        </div>
      )}
    </div>
  );
};

export default SimuladoPage;
