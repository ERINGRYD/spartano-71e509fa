
import React from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "An error occurred while loading data.", 
  onRetry 
}) => {
  const { t } = useTranslation();
  
  return (
    <Alert 
      variant="destructive" 
      className="bg-white p-6 md:p-8 rounded-lg shadow text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
      <AlertTitle className="text-lg font-semibold mb-2 text-center">
        {t("error.title") || "Error"}
      </AlertTitle>
      <AlertDescription className="text-gray-600 text-sm md:text-base mb-4">
        {message}
      </AlertDescription>
      
      {onRetry && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onRetry}
            variant="outline"
          >
            {t("error.retry") || "Try Again"}
          </Button>
        </div>
      )}
    </Alert>
  );
};

export default ErrorState;
