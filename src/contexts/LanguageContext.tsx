
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Available languages
export type Language = "pt" | "en";

// Translation dictionary type
type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

// Our translations
const translations: Translations = {
  // Common translations
  "skills.title": {
    pt: "Skills",
    en: "Skills",
  },
  "skills.noStats": {
    pt: "Nenhuma estatística disponível",
    en: "No statistics available",
  },
  "skills.completeToSee": {
    pt: "Complete batalhas e revisões para visualizar suas skills e progressos!",
    en: "Complete battles and reviews to see your skills and progress!",
  },
  "skills.questionsResolved": {
    pt: "Questões Resolvidas",
    en: "Questions Solved",
  },
  "skills.accuracyRate": {
    pt: "Taxa de acerto",
    en: "Accuracy rate",
  },
  "skills.totalTime": {
    pt: "Tempo Total",
    en: "Total Time",
  },
  "skills.averagePerQuestion": {
    pt: "Média por questão",
    en: "Average per question",
  },
  "skills.averageConfidence": {
    pt: "Confiança Média",
    en: "Average Confidence",
  },
  "skills.basedOn": {
    pt: "Baseada nas suas auto-avaliações",
    en: "Based on your self-assessments",
  },
  "skills.observedEnemies": {
    pt: "Inimigos Observados",
    en: "Observed Enemies",
  },
  "skills.ofTotal": {
    pt: "De um total de",
    en: "Of a total of",
  },
  "skills.enemies": {
    pt: "inimigos",
    en: "enemies",
  },
  "skills.dailyActivity": {
    pt: "Atividade Diária",
    en: "Daily Activity",
  },
  "skills.questions": {
    pt: "Questões",
    en: "Questions",
  },
  "skills.performance": {
    pt: "Desempenho Geral",
    en: "Overall Performance",
  },
  "skills.confidenceDistribution": {
    pt: "Distribuição de Confiança",
    en: "Confidence Distribution",
  },
  "skills.allSubjects": {
    pt: "Todas as matérias",
    en: "All subjects",
  },
  "skills.notEnoughData": {
    pt: "Sem dados suficientes para gerar gráfico.",
    en: "Not enough data to generate chart.",
  },
  // Chart translations
  "chart.correct": {
    pt: "Acertos",
    en: "Correct",
  },
  "chart.incorrect": {
    pt: "Erros",
    en: "Incorrect",
  },
  "chart.certainty": {
    pt: "Certeza",
    en: "Certainty",
  },
  "chart.doubt": {
    pt: "Dúvida",
    en: "Doubt",
  },
  "chart.unknown": {
    pt: "Não sabia",
    en: "Unknown",
  },
  "chart.amount": {
    pt: "Quantidade",
    en: "Amount",
  },
  // No data displays
  "noData.achievements": {
    pt: "Nenhuma conquista ainda",
    en: "No achievements yet",
  },
  "noData.achievementsDesc": {
    pt: "Complete seus primeiros quizzes para desbloquear conquistas!",
    en: "Complete your first quizzes to unlock achievements!",
  },
  "noData.subjects": {
    pt: "Nenhuma matéria encontrada",
    en: "No subjects found",
  },
  "noData.subjectsDesc": {
    pt: "Adicione matérias na aba \"Inimigos\" para começar sua jornada!",
    en: "Add subjects in the \"Enemies\" tab to start your journey!",
  },
};

// Interface for the context
interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Language provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with browser language or default to Portuguese
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'pt'; // Default to Portuguese if not English
  };
  
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from local storage first
    const savedLang = localStorage.getItem("language") as Language;
    return savedLang || getBrowserLanguage();
  });

  // Translate function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using translations
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
