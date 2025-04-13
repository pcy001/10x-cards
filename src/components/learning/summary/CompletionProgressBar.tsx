import React from 'react';
import { cn } from '@/lib/utils';
import { CompletionProgressBarProps } from './types';

export function CompletionProgressBar({ completionPercentage }: CompletionProgressBarProps) {
  // Ensure the percentage is between 0 and 100
  const percentage = Math.min(100, Math.max(0, completionPercentage));
  
  // Determine colors based on completion percentage
  const getProgressColor = () => {
    if (percentage < 33) return 'bg-red-500';
    if (percentage < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-medium">Ukończenie sesji</span>
        <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div 
          className={cn("h-2.5 rounded-full", getProgressColor())}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
} 