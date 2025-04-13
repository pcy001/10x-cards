import React from 'react';

interface SummaryHeaderProps {
  endTime?: Date | string;
}

export function SummaryHeader({ endTime }: SummaryHeaderProps) {
  // Format the date if it exists
  const formattedDate = endTime 
    ? new Date(endTime).toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;
    
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-foreground">
        Podsumowanie sesji nauki
      </h1>
      {formattedDate && (
        <p className="text-sm text-muted-foreground mt-2">
          Zakończono: {formattedDate}
        </p>
      )}
    </div>
  );
} 