import React from 'react';
import { cn } from '@/lib/utils';
import { StatCardProps } from './types';

export function StatCard({ icon, value, label, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-lg border bg-card",
      variant === 'success' && "border-green-200 bg-green-50",
      variant === 'error' && "border-red-200 bg-red-50"
    )}>
      <div className={cn(
        "mb-2 text-muted-foreground",
        variant === 'success' && "text-green-500",
        variant === 'error' && "text-red-500"
      )}>
        {icon}
      </div>
      <div className={cn(
        "text-3xl font-bold text-foreground",
        variant === 'success' && "text-green-700",
        variant === 'error' && "text-red-700"
      )}>
        {value}
      </div>
      <div className={cn(
        "text-sm text-muted-foreground mt-1",
        variant === 'success' && "text-green-600",
        variant === 'error' && "text-red-600"
      )}>
        {label}
      </div>
    </div>
  );
} 