import React from 'react';
import { FlashcardsHeaderProps } from './types';
import SortControls from './SortControls';

export default function FlashcardsHeader({ sortBy, sortDir, onSortChange }: FlashcardsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-0">Twoje fiszki</h1>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <SortControls sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
        <a 
          href="/flashcards/create" 
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md ml-4 inline-flex items-center text-sm"
        >
          <span className="inline-block mr-2">+</span> Dodaj fiszkę
        </a>
      </div>
    </div>
  );
} 