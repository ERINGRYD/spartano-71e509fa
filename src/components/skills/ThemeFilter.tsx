
import React from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Topic } from "@/utils/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter } from "lucide-react";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent 
} from "@/components/ui/popover";

interface ThemeFilterProps {
  topics: Topic[];
  selectedTopic: string | null;
  onSelectTopic: (topicId: string | null) => void;
  subjectName?: string;
}

const ThemeFilter: React.FC<ThemeFilterProps> = ({ 
  topics, 
  selectedTopic,
  onSelectTopic,
  subjectName
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // If no topics, don't render anything
  if (!topics || topics.length === 0) return null;

  const clearFilter = () => {
    onSelectTopic(null);
  };

  const renderTopicButton = (topic: Topic) => (
    <Button
      key={topic.id}
      variant={selectedTopic === topic.id ? "default" : "outline"}
      size="sm"
      className="mb-1 mr-1 text-xs whitespace-nowrap p-1 h-7"
      onClick={() => onSelectTopic(topic.id)}
    >
      {topic.name}
    </Button>
  );

  return (
    <div className="mb-2 sm:mb-4">
      {!isMobile ? (
        <div>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium mr-2">{t('skills.filterByTheme')}:</h3>
            {selectedTopic && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilter} 
                className="text-xs"
              >
                {t('skills.clearFilter')}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap">
            {topics.map(renderTopicButton)}
          </div>
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center h-8 px-2 py-1"
            >
              <Filter className="h-3 w-3 mr-1" />
              {t('skills.filterThemes')}
              {selectedTopic && <span className="ml-1 bg-blue-100 px-1 rounded-full text-xs">1</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2 bg-white max-h-72 overflow-y-auto">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-medium">
                {subjectName ? `${t('skills.themesIn')} ${subjectName}` : t('skills.themes')}
              </h3>
              {selectedTopic && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilter} 
                  className="text-xs h-6 px-2"
                >
                  {t('skills.clearFilter')}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap">
              {topics.map(renderTopicButton)}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default React.memo(ThemeFilter);
