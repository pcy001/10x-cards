import React from 'react';
import { FlashcardItemProps } from './types';
import FlashcardContent from './FlashcardContent';
import DeleteFlashcardButton from './DeleteFlashcardButton';
import { formatDate } from '@/lib/utils'; // Zakładam, że istnieje taka funkcja

export default function FlashcardItem({ flashcard, onDelete }: FlashcardItemProps) {
  return (
    <div className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              {formatDate(flashcard.createdAt)}
            </span>
            {flashcard.isAiGenerated && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                AI
              </span>
            )}
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              Poprawne: {flashcard.correctAnswersCount}
            </span>
          </div>
          
          <FlashcardContent
            frontContent={flashcard.frontContent}
            backContent={flashcard.backContent}
            isAiGenerated={flashcard.isAiGenerated}
          />
        </div>
        
        <DeleteFlashcardButton onClick={onDelete} />
      </div>
    </div>
  );
}

// Funkcja formatowania daty (będzie lepiej przenieść ją do utils)
function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
} 