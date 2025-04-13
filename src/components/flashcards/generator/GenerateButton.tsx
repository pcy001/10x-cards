import React from 'react';
import { GenerateButtonProps } from './types';
import { Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function GenerateButton({
  onClick,
  disabled,
  isLoading
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="text-primary-foreground" />
          <span>Generowanie...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span>Generuj fiszki</span>
        </>
      )}
    </button>
  );
} 