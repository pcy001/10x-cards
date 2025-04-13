import React from 'react';
import { DeleteConfirmationModalProps } from './types';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({
  isOpen,
  flashcardId,
  onConfirm,
  onCancel
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  // Zatrzymaj propagację kliknięcia w oknie modalnym
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={handleModalClick}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">Usunąć fiszkę?</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
} 