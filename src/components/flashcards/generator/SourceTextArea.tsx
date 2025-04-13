import React, { useState, useEffect, ChangeEvent } from 'react';
import { SourceTextAreaProps } from './types';

export default function SourceTextArea({
  value,
  onChange,
  disabled,
  placeholder = 'Wklej tekst źródłowy...',
  maxLength = 10000
}: SourceTextAreaProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  // Aktualizacja licznika znaków przy zmianie wartości
  useEffect(() => {
    setCharacterCount(value.length);
    setIsOverLimit(value.length > maxLength);
  }, [value, maxLength]);

  // Obsługa zmiany tekstu
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="relative">
      <textarea
        id="source-text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={10}
        className={`w-full p-3 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
          isOverLimit ? 'border-red-500 focus:ring-red-500' : 'border-input'
        }`}
        aria-invalid={isOverLimit}
      />
      
      <div className={`text-xs flex justify-end mt-1 ${
        isOverLimit ? 'text-red-500' : 'text-muted-foreground'
      }`}>
        <span>{characterCount}</span>
        <span>/</span>
        <span>{maxLength}</span>
        <span className="ml-1">znaków</span>
        {isOverLimit && (
          <span className="ml-2 font-medium">
            Przekroczono limit o {characterCount - maxLength} znaków
          </span>
        )}
      </div>
    </div>
  );
} 