import React from 'react';
import { FlashcardContentProps } from './types';

export default function FlashcardContent({ frontContent, backContent }: FlashcardContentProps) {
  // Funkcja do obsługi długiego tekstu
  const truncate = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Przód</h3>
        <p className="p-3 bg-muted/50 rounded-md text-foreground">{truncate(frontContent)}</p>
      </div>
      
      <div className="pt-2 border-t border-border/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tył</h3>
        <p className="p-3 bg-muted/50 rounded-md text-foreground">{truncate(backContent)}</p>
      </div>
    </div>
  );
} 