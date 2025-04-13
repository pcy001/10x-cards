import React from 'react';
import { BookOpen, Check, X } from 'lucide-react';
import { StatCard } from './StatCard';
import { CompletionProgressBar } from './CompletionProgressBar';

interface StatisticsDisplayProps {
  flashcardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionPercentage: number;
}

export function StatisticsDisplay({ 
  flashcardsReviewed,
  correctAnswers,
  incorrectAnswers,
  completionPercentage
}: StatisticsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<BookOpen className="h-6 w-6" />}
          value={flashcardsReviewed}
          label="Przejrzanych fiszek"
        />
        
        <StatCard 
          icon={<Check className="h-6 w-6" />}
          value={correctAnswers}
          label="Poprawnych odpowiedzi"
          variant="success"
        />
        
        <StatCard 
          icon={<X className="h-6 w-6" />}
          value={incorrectAnswers}
          label="Niepoprawnych odpowiedzi"
          variant="error"
        />
      </div>
      
      <CompletionProgressBar completionPercentage={completionPercentage} />
    </div>
  );
} 