import React from 'react';
import { SaveSelectedButtonProps } from './types';
import { Save } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function SaveSelectedButton({
  onClick,
  disabled,
  isLoading,
  selectedCount
}: SaveSelectedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-w-32"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="text-primary-foreground" />
          <span>Zapisywanie...</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>Zapisz {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
        </>
      )}
    </button>
  );
} 