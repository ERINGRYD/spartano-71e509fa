
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

type SkeletonChartProps = {
  title?: string;
};

const SkeletonChart: React.FC<SkeletonChartProps> = ({ title }) => {
  const isMobile = useIsMobile();
  const height = isMobile ? "180px" : "240px";
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title ? (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      ) : (
        <Skeleton className="h-6 w-40 mb-4" />
      )}
      <Skeleton className="w-full" style={{ height }} />
    </div>
  );
};

export default React.memo(SkeletonChart);
