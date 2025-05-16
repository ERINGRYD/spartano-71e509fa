import React, { useState, useEffect } from 'react';
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
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true);
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
                className={`option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelection(index)}
              >
                {option}
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
