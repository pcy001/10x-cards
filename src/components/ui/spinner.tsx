import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Komponent Spinner służący do wyświetlania wskaźnika ładowania
 */
export function Spinner({ 
  size = "md", 
  className 
}: SpinnerProps) {
  // Mapowanie rozmiarów na konkretne wartości CSS
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  // Wybierz odpowiedni styl dla danego rozmiaru
  const sizeClass = sizeStyles[size];
  
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-primary", 
        sizeClass,
        className
      )}
      style={{
        // Zapewnienie, że border-t jest przezroczysty
        borderTopColor: 'transparent'
      }}
      aria-hidden="true"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Ładowanie...</span>
    </div>
  );
} 