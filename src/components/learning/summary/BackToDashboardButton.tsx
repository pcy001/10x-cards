import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BackToDashboardButtonProps } from './types';

export function BackToDashboardButton({ onClick, href = '/dashboard' }: BackToDashboardButtonProps) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Powrót do panelu głównego
      </button>
    );
  }

  return (
    <a
      href={href}
      className="flex items-center justify-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Powrót do panelu głównego
    </a>
  );
} 