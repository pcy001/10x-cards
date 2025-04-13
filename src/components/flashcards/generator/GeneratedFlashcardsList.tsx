import React from 'react';
import { GeneratedFlashcardsListProps } from './types';
import FlashcardPreviewItem from './FlashcardPreviewItem';
import SelectionControls from './SelectionControls';
import SaveSelectedButton from './SaveSelectedButton';

export default function GeneratedFlashcardsList({
  flashcards,
  selectedFlashcards,
  onSelectionChange,
  onSelectAll,
  onDeselectAll,
  onSaveSelected,
  isSaving
}: GeneratedFlashcardsListProps) {
  // Obliczenie liczby zaznaczonych fiszek
  const selectedCount = Object.values(selectedFlashcards).filter(Boolean).length;
  const totalCount = flashcards.length;

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">Wygenerowane fiszki</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SelectionControls
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            selectedCount={selectedCount}
            totalCount={totalCount}
          />
          
          <SaveSelectedButton
            onClick={onSaveSelected}
            disabled={selectedCount === 0 || isSaving}
            isLoading={isSaving}
            selectedCount={selectedCount}
          />
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        {flashcards.map(flashcard => (
          <FlashcardPreviewItem
            key={flashcard.temp_id}
            flashcard={flashcard}
            isSelected={!!selectedFlashcards[flashcard.temp_id]}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </div>
      
      {/* Przycisk zapisania na dole listy dla wygody */}
      {totalCount > 3 && (
        <div className="mt-6 flex justify-end">
          <SaveSelectedButton
            onClick={onSaveSelected}
            disabled={selectedCount === 0 || isSaving}
            isLoading={isSaving}
            selectedCount={selectedCount}
          />
        </div>
      )}
    </div>
  );
} 