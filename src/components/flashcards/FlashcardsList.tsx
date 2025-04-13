import React from 'react';
import { FlashcardsListProps } from './types';
import FlashcardItem from './FlashcardItem';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlashcardsList({ flashcards, onDeleteFlashcard, isLoading }: FlashcardsListProps) {
  // Renderowanie skeletonów podczas ładowania
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <div className="mt-4 pt-4 border-t">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {flashcards.map(flashcard => (
        <FlashcardItem
          key={flashcard.id}
          flashcard={flashcard}
          onDelete={() => onDeleteFlashcard(flashcard.id)}
        />
      ))}
    </div>
  );
} 