
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  colorClass?: string;
}

const ProgressBar = ({
  progress,
  className,
  showPercentage = false,
  colorClass = 'bg-green-600'
}: ProgressBarProps) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5", className)}>
      <div 
        className={cn("h-2.5 rounded-full", colorClass)}
        style={{ width: `${safeProgress}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-gray-600 mt-1 text-right">
          {Math.round(safeProgress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
