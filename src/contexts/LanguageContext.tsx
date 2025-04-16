import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'pt';

export type TranslationKeys = {
  [key: string]: string | TranslationKeys;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const defaultLanguage: Language = 'pt';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: () => '',
});

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  
  // Simple translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

// Define translations
const translations = {
  en: {
    app: {
      title: 'Knowledge Warrior',
    },
    nav: {
      enemies: 'Enemies',
      battlefield: 'Battlefield',
      strategy: 'Strategy',
      skills: 'Skills',
      conquests: 'Conquests',
      summary: 'Summary',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      calculating: 'Calculating...'
    },
    home: {
      title: 'Welcome to Knowledge Warrior',
      subtitle: 'Train your knowledge with battle strategies',
    },
    skills: {
      title: 'Skills',
      questionsResolved: 'Questions Resolved',
      accuracyRate: 'Accuracy Rate',
      totalTime: 'Total Time',
      averagePerQuestion: 'Average per Question',
      averageConfidence: 'Average Confidence',
      basedOn: 'Based on your quiz results',
      observedEnemies: 'Observed Enemies',
      ofTotal: 'of total',
      enemies: 'enemies',
      totalQuestions: 'Total Questions',
      correctAnswers: 'Correct Answers',
      timeSpent: 'Time Spent',
      timeSpentSeconds: 'Time (seconds)',
      confidence: 'Confidence',
      subjectProgress: 'Subject Progress',
      dailyActivity: 'Daily Activity',
      performance: 'Performance',
      confidenceDistribution: 'Confidence Distribution',
      filterBySubject: 'Filter by Subject',
      allSubjects: 'All Subjects',
      filterByTopic: 'Filter by Topic',
      allTopics: 'All Topics',
      noData: 'No data available',
      advancedAnalytics: 'Advanced Analytics',
      questionTypes: 'Question Types',
      difficulty: 'Difficulty',
      timeAnalysis: 'Time Analysis',
      errorPatterns: 'Error Patterns',
      progress: 'Learning Curve',
      strategy: 'Strategy',
      strategyMatrix: 'Strategy Matrix',
      incorrectAnswers: 'Incorrect Answers',
      slowLowConfidence: 'Slow & Low Confidence',
      fastLowConfidence: 'Fast & Low Confidence',
      slowHighConfidence: 'Slow & High Confidence',
      fastHighConfidence: 'Fast & High Confidence',
      quadrant1Desc: 'You took your time but were unsure. These might be topics to review more deeply.',
      quadrant2Desc: 'Quick answers with low confidence. You may be guessing or need more practice.',
      quadrant3Desc: 'Slow but confident answers. You know the material but need to work on speed.',
      quadrant4Desc: 'Quick and confident answers. These are your strengths!',
      selectSubject: 'Select subject'
    },
    battlefield: {
      title: 'Battlefield',
      addEnemy: 'Add Enemy',
      deleteAll: 'Delete All',
      empty: 'Battlefield Empty',
      addEnemyPrompt: 'Add enemies to start training!',
      redRoom: 'Front Line (Red)',
      yellowRoom: 'Advanced Line (Yellow)',
      greenRoom: 'Contact Line (Green)',
      safeZone: 'Safe Zone (Triage)',
      noEnemies: 'No enemies in this area.',
    },
    chart: {
      correct: 'Correct',
      incorrect: 'Incorrect'
    }
  },
  pt: {
    app: {
      title: 'Guerreiro do Conhecimento',
    },
    nav: {
      enemies: 'Inimigos',
      battlefield: 'Campo de Batalha',
      strategy: 'Estratégia',
      skills: 'Habilidades',
      conquests: 'Conquistas',
      summary: 'Resumo',
    },
    common: {
      loading: 'Carregando...',
      error: 'Ocorreu um erro',
      retry: 'Tentar novamente',
      calculating: 'Calculando...'
    },
    home: {
      title: 'Bem-vindo ao Guerreiro do Conhecimento',
      subtitle: 'Treine seu conhecimento com estratégias de batalha',
    },
    skills: {
      title: 'Habilidades',
      questionsResolved: 'Questões Resolvidas',
      accuracyRate: 'Taxa de Acerto',
      totalTime: 'Tempo Total',
      averagePerQuestion: 'Média por Questão',
      averageConfidence: 'Confiança Média',
      basedOn: 'Baseado nos seus resultados',
      observedEnemies: 'Inimigos Observados',
      ofTotal: 'de um total de',
      enemies: 'inimigos',
      totalQuestions: 'Total de Questões',
      correctAnswers: 'Respostas Corretas',
      timeSpent: 'Tempo Gasto',
      timeSpentSeconds: 'Tempo (segundos)',
      confidence: 'Confiança',
      subjectProgress: 'Progresso por Matéria',
      dailyActivity: 'Atividade Diária',
      performance: 'Desempenho',
      confidenceDistribution: 'Distribuição de Confiança',
      filterBySubject: 'Filtrar por Matéria',
      allSubjects: 'Todas as Matérias',
      filterByTopic: 'Filtrar por Tema',
      allTopics: 'Todos os Temas',
      noData: 'Sem dados disponíveis',
      advancedAnalytics: 'Análise Avançada',
      questionTypes: 'Tipos de Questão',
      difficulty: 'Dificuldade',
      timeAnalysis: 'Análise de Tempo',
      errorPatterns: 'Padrões de Erro',
      progress: 'Curva de Aprendizado',
      strategy: 'Estratégia',
      strategyMatrix: 'Matriz Estratégica',
      incorrectAnswers: 'Respostas Incorretas',
      slowLowConfidence: 'Lento & Baixa Confiança',
      fastLowConfidence: 'Rápido & Baixa Confiança',
      slowHighConfidence: 'Lento & Alta Confiança',
      fastHighConfidence: 'Rápido & Alta Confiança',
      quadrant1Desc: 'Você demorou mas estava inseguro. Estes podem ser tópicos para revisar com mais profundidade.',
      quadrant2Desc: 'Respostas rápidas com baixa confiança. Você pode estar adivinhando ou precisar de mais prática.',
      quadrant3Desc: 'Respostas lentas mas confiantes. Você conhece o material mas precisa trabalhar na velocidade.',
      quadrant4Desc: 'Respostas rápidas e confiantes. Estes são seus pontos fortes!',
      selectSubject: 'Selecionar matéria'
    },
    battlefield: {
      title: 'Campo de Batalha',
      addEnemy: 'Adicionar Inimigo',
      deleteAll: 'Apagar Todos',
      empty: 'Campo de Batalha Vazio',
      addEnemyPrompt: 'Adicione inimigos para começar o treinamento!',
      redRoom: 'Linha de Frente (Vermelha)',
      yellowRoom: 'Linha Avançada (Amarela)',
      greenRoom: 'Linha de Contato (Verde)',
      safeZone: 'Zona de Segurança (Triagem)',
      noEnemies: 'Nenhum inimigo nesta área.',
    },
    chart: {
      correct: 'Corretas',
      incorrect: 'Incorretas'
    }
  }
};
