import React from 'react';
import { DeleteFlashcardButtonProps } from './types';
import { Trash } from 'lucide-react';

export default function DeleteFlashcardButton({ onClick }: DeleteFlashcardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      aria-label="Usuń fiszkę"
    >
      <Trash className="h-5 w-5" />
    </button>
  );
} 