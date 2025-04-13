import React from 'react';
import { FlashcardPreviewItemProps } from './types';
import { cn } from '@/lib/utils';
import { Check, Pencil } from 'lucide-react';

export default function FlashcardPreviewItem({
  flashcard,
  isSelected,
  onSelectionChange,
}: FlashcardPreviewItemProps) {
  // Obsługuje zmianę zaznaczenia fiszki
  const handleSelectionChange = () => {
    onSelectionChange(flashcard.temp_id, !isSelected);
  };

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox do zaznaczania */}
        <button
          type="button"
          onClick={handleSelectionChange}
          className={cn(
            "mt-1 flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center",
            isSelected 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-muted-foreground"
          )}
          aria-label={isSelected ? "Odznacz fiszkę" : "Zaznacz fiszkę"}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>

        {/* Zawartość fiszki */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Front - pytanie */}
            <div>
              <div className="text-sm font-medium mb-1 text-muted-foreground">Pytanie</div>
              <div className="min-h-[40px]">{flashcard.front_content}</div>
            </div>
            
            {/* Back - odpowiedź */}
            <div>
              <div className="text-sm font-medium mb-1 text-muted-foreground">Odpowiedź</div>
              <div className="min-h-[40px]">{flashcard.back_content}</div>
            </div>
          </div>

          {/* Przycisk edycji - do przyszłej implementacji */}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex items-center text-xs opacity-70 hover:opacity-100"
              aria-label="Edytuj fiszkę"
              disabled={true} // Wyłączone, do przyszłej implementacji
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edytuj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 