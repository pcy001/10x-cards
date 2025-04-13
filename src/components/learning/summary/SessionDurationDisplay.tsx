import React from 'react';
import { Clock } from 'lucide-react';
import { SessionDurationDisplayProps } from './types';

export function SessionDurationDisplay({ durationSeconds }: SessionDurationDisplayProps) {
  // Format the duration in a user-friendly way
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} sekund`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      if (remainingSeconds === 0) {
        return `${minutes} ${minutes === 1 ? 'minuta' : (minutes < 5 ? 'minuty' : 'minut')}`;
      } else {
        return `${minutes} ${minutes === 1 ? 'minuta' : (minutes < 5 ? 'minuty' : 'minut')} ${remainingSeconds} ${remainingSeconds === 1 ? 'sekunda' : (remainingSeconds < 5 ? 'sekundy' : 'sekund')}`;
      }
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'godzina' : (hours < 5 ? 'godziny' : 'godzin')}`;
    } else {
      return `${hours} ${hours === 1 ? 'godzina' : (hours < 5 ? 'godziny' : 'godzin')} ${remainingMinutes} ${remainingMinutes === 1 ? 'minuta' : (remainingMinutes < 5 ? 'minuty' : 'minut')}`;
    }
  };

  return (
    <div className="flex items-center justify-center mt-6 text-muted-foreground">
      <Clock className="w-5 h-5 mr-2" />
      <span>Czas trwania: <span className="font-medium">{formatDuration(durationSeconds)}</span></span>
    </div>
  );
} 