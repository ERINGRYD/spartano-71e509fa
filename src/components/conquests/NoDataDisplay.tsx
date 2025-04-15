
import React from "react";
import { Flag, BookOpen } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

type NoDataDisplayProps = {
  type: 'achievements' | 'subjects';
};

const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ type }) => {
  const { t } = useTranslation();
  
  if (type === 'achievements') {
    return (
      <div 
        className="col-span-3 text-center py-12"
        role="region"
        aria-label="No achievements"
      >
        <Flag className="w-12 h-12 mx-auto text-gray-400 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-gray-700" tabIndex={0}>
          {t("noData.achievements")}
        </h3>
        <p className="text-gray-500 mt-2" tabIndex={0}>
          {t("noData.achievementsDesc")}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="text-center py-12"
      role="region"
      aria-label="No subjects"
    >
      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-gray-700" tabIndex={0}>
        {t("noData.subjects")}
      </h3>
      <p className="text-gray-500 mt-2" tabIndex={0}>
        {t("noData.subjectsDesc")}
      </p>
    </div>
  );
};

export default NoDataDisplay;
