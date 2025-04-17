
import { useState, useEffect, useRef } from 'react';
import { Question, QuizAnswer, QuizResult, Enemy } from '@/utils/types';
import { getQuizResultsByEnemyId, saveQuizResult } from '@/utils/storage';
import { ArrowLeft, ArrowRight, Timer, ThumbsUp, Lightbulb, HelpCircle, Sword, Shield, Award } from 'lucide-react';
import { toast } from 'sonner';
import ResultsChart from './ResultsChart';
import { useCharacter } from '@/hooks/useCharacter';
import { useTranslation } from '@/contexts/LanguageContext';

interface QuizSessionProps {
  enemy: Enemy;
  questions: Question[];
  onComplete: (result: QuizResult) => void;
  onCancel: () => void;
  isReview?: boolean;
}

const QuizSession = ({ enemy, questions, onComplete, onCancel, isReview = false }: QuizSessionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<'certainty' | 'doubt' | 'unknown' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  
  const character = useCharacter();
  const { t } = useTranslation();
  
  // Timer state
  const [quizTime, setQuizTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const quizTimerRef = useRef<number | null>(null);
  const questionTimerRef = useRef<number | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Start timers when component mounts
  useEffect(() => {
    startTimers();
    
    // Clean up timers when component unmounts
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);
  
  // Reset question timer when moving to a new question
  useEffect(() => {
    setSelectedOptionId(null);
    setConfidenceLevel(null);
    setShowAnswer(false);
    setShowComments(false);
    setQuestionTime(0);
    
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    // Only start the question timer if the quiz is not finished
    if (!quizFinished) {
      questionTimerRef.current = window.setInterval(() => {
        setQuestionTime(prevTime => prevTime + 1000);
      }, 1000);
    }
  }, [currentQuestionIndex, quizFinished]);
  
  const startTimers = () => {
    // Quiz timer - increments every second
    quizTimerRef.current = window.setInterval(() => {
      setQuizTime(prevTime => prevTime + 1000);
    }, 1000);
    
    // Question timer - increments every second
    questionTimerRef.current = window.setInterval(() => {
      setQuestionTime(prevTime => prevTime + 1000);
    }, 1000);
  };
  
  const stopTimers = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
  };
  
  const handleOptionSelect = (optionId: string) => {
    if (showAnswer) return;
    
    setSelectedOptionId(optionId);
    setShowAnswer(true);
    
    const question = questions[currentQuestionIndex];
    const option = question.options.find(o => o.id === optionId);
    
    if (!option) return;
    
    // Record the answer
    const answer: QuizAnswer = {
      questionId: question.id,
      selectedOptionId: optionId,
      isCorrect: option.isCorrect,
      timeSpent: questionTime,
    };
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    
    // Spartan theme feedback
    if (option.isCorrect) {
      toast.success(t('spartan.enemyDefeated') || 'Inimigo derrotado!', {
        icon: <Shield className="h-4 w-4 text-green-500" />
      });
    } else {
      toast.error(t('spartan.woundReceived') || 'Você foi ferido!', {
        icon: <Sword className="h-4 w-4 text-red-500" />
      });
    }
  };
  
  const handleConfidenceSelect = (level: 'certainty' | 'doubt' | 'unknown') => {
    if (!showAnswer || confidenceLevel) return;
    
    setConfidenceLevel(level);
    
    // Update the answer with confidence level
    const newAnswers = [...answers];
    if (newAnswers[currentQuestionIndex]) {
      newAnswers[currentQuestionIndex] = {
        ...newAnswers[currentQuestionIndex],
        confidenceLevel: level,
      };
      setAnswers(newAnswers);
      
      // If this is the last question and confidence is selected, finish the quiz
      if (currentQuestionIndex === questions.length - 1) {
        finishQuiz(newAnswers);
      } else if (autoAdvance) {
        // If auto-advance is on, go to the next question
        setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      }
    }
    
    // If this is the last question, stop all timers
    if (currentQuestionIndex === questions.length - 1) {
      stopTimers();
    }
    
    // Spartan theme - XP gain based on confidence
    if (newAnswers[currentQuestionIndex]?.isCorrect) {
      let confidenceXp = 0;
      if (level === 'certainty') confidenceXp = 2;
      if (level === 'doubt') confidenceXp = 1;
      
      if (confidenceXp > 0) {
        setXpGained(prev => prev + confidenceXp);
        toast.success(`+${confidenceXp} XP`, {
          icon: <Award className="h-4 w-4 text-yellow-500" />
        });
      }
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!quizFinished && answers.every(a => a.confidenceLevel)) {
      finishQuiz(answers);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const finishQuiz = (finalAnswers: QuizAnswer[]) => {
    stopTimers();
    setQuizFinished(true);
    
    // Calculate results
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    
    // Calculate confidence score (percentage of correct answers marked with certainty)
    const correctWithCertainty = finalAnswers.filter(
      a => a.isCorrect && a.confidenceLevel === 'certainty'
    ).length;
    
    const confidenceScore = correctAnswers > 0 
      ? (correctWithCertainty / correctAnswers) * 100 
      : 0;
    
    const result: QuizResult = {
      enemyId: enemy.id,
      correctAnswers,
      totalQuestions: questions.length,
      confidenceScore,
      timeSpent: quizTime,
      answers: finalAnswers,
      date: new Date().toISOString(), // Convert Date to string
    };
    
    setQuizResult(result);
    saveQuizResult(result);
    
    // Update character stats
    const totalXp = character.recordStudyActivity(
      questions.length,
      correctAnswers,
      quizTime
    );
    
    // Add the XP gained from confidence to total XP
    setXpGained(prev => prev + totalXp);
    setShowXpGain(true);
    
    // Show toast with XP gained
    toast.success(`+${totalXp} XP ${t('spartan.gained') || 'ganhos'}!`, {
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      duration: 3000
    });
    
    // Achievements based on result
    if (correctAnswers === questions.length) {
      character.addAchievement('perfect_battle');
      toast.success(t('spartan.perfectVictory') || 'Vitória Perfeita! +25 XP', {
        icon: <Shield className="h-5 w-5 text-yellow-500" />,
        duration: 4000
      });
    }
    
    setTimeout(() => {
      onComplete(result);
    }, 1000);
  };
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  if (quizFinished && quizResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-700">
          {t('spartan.battleResults') || 'Resultado da Batalha'}
        </h2>
        
        {/* XP Gain */}
        {showXpGain && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg text-center animate-pulse">
            <div className="flex justify-center items-center text-yellow-600">
              <Award className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">+{xpGained} XP</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('spartan.battleXpDescription') || 'XP ganho por suas conquistas em batalha!'}
            </p>
          </div>
        )}
        
        <ResultsChart result={quizResult} />
        
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            {t('spartan.returnToBase') || 'Retornar à Base'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Sword className="mr-2 w-5 h-5 text-red-700" />
          <span className="text-red-700">
            {t('spartan.battle') || 'Batalha'}: {enemy.name}
          </span>
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Timer className="mr-1 w-5 h-5 text-warrior-primary" />
            <span>Total: {formatTime(quizTime)}</span>
          </div>
          <div className="flex items-center">
            <Timer className="mr-1 w-5 h-5 text-warrior-red" />
            <span>Questão: {formatTime(questionTime)}</span>
          </div>
          
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoAdvance} 
              onChange={() => setAutoAdvance(!autoAdvance)}
              className="sr-only"
            />
            <div className={`relative w-10 h-5 ${autoAdvance ? 'bg-blue-600' : 'bg-gray-300'} rounded-full transition-colors`}>
              <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform ${autoAdvance ? 'translate-x-5' : ''}`}></div>
            </div>
            <span className="ml-2 text-sm">{t('quiz.autoAdvance') || 'Avanço automático'}</span>
          </label>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2 mb-6 rounded-full">
        <div 
          className="bg-red-700 h-2 rounded-full"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">
          {t('spartan.enemy') || 'Inimigo'} {currentQuestionIndex + 1} {t('spartan.of') || 'de'} {questions.length}
        </h3>
        <p className="text-gray-800">{currentQuestion.text}</p>
        
        {/* Optional information */}
        {(currentQuestion.examBoard || currentQuestion.year || currentQuestion.organization) && (
          <div className="mt-2 text-sm text-gray-600">
            {currentQuestion.examBoard && <span>Banca: {currentQuestion.examBoard} </span>}
            {currentQuestion.year && <span>Ano: {currentQuestion.year} </span>}
            {currentQuestion.organization && <span>Órgão: {currentQuestion.organization}</span>}
          </div>
        )}
      </div>
      
      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showCorrectness = showAnswer;
          
          let optionClass = "border rounded-lg p-3 cursor-pointer transition-all";
          
          if (isSelected) {
            optionClass += " border-2";
            if (showCorrectness) {
              optionClass += option.isCorrect 
                ? " border-green-500 bg-green-50" 
                : " border-red-500 bg-red-50";
            } else {
              optionClass += " border-blue-500";
            }
          } else if (showCorrectness && option.isCorrect) {
            optionClass += " border-green-500 bg-green-50";
          }
          
          return (
            <div 
              key={option.id}
              className={optionClass}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'
                }`}>
                  {currentQuestion.type === 'multiple_choice' 
                    ? String.fromCharCode(65 + currentQuestion.options.findIndex(o => o.id === option.id)) 
                    : option.text === 'Certo' ? 'C' : 'E'
                  }
                </div>
                <div>
                  <p className={currentQuestion.type === 'true_false' ? 'sr-only' : ''}>
                    {option.text}
                  </p>
                  
                  {showComments && option.comment && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <strong>Comentário:</strong> {option.comment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Confidence level selection */}
      {showAnswer && !confidenceLevel && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">{t('quiz.confidenceLevel') || 'Qual seu nível de confiança?'}</h4>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleConfidenceSelect('certainty')}
              className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Shield className="w-4 h-4" />
              <span>{t('confidence.certainty') || 'Certeza'}</span>
            </button>
            <button 
              onClick={() => handleConfidenceSelect('doubt')}
              className="flex items-center space-x-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('confidence.doubt') || 'Dúvida'}</span>
            </button>
            <button 
              onClick={() => handleConfidenceSelect('unknown')}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{t('confidence.unknown') || 'Não sabia'}</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Show comments toggle */}
      {showAnswer && (
        <button 
          onClick={toggleComments}
          className="text-red-700 hover:underline mb-6 text-sm"
        >
          {showComments ? t('quiz.hideComments') || 'Ocultar comentários' : t('quiz.viewComments') || 'Ver comentários'}
        </button>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {t('quiz.exit') || 'Sair'}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md 
                      ${currentQuestionIndex === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('quiz.previous') || 'Anterior'}</span>
          </button>
          
          <button
            onClick={handleNextQuestion}
            disabled={!showAnswer || (currentQuestionIndex === questions.length - 1 && !answers[currentQuestionIndex]?.confidenceLevel)}
            className={`flex items-center space-x-1 px-4 py-2 rounded-md 
                      ${!showAnswer || (currentQuestionIndex === questions.length - 1 && !answers[currentQuestionIndex]?.confidenceLevel)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-700 text-white hover:bg-red-800'
                      }`}
          >
            <span>{currentQuestionIndex === questions.length - 1 ? t('quiz.seeResults') || 'Ver resultado' : t('quiz.next') || 'Próxima'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
