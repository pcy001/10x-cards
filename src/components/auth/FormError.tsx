import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
}

export default function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded mt-1",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
} 