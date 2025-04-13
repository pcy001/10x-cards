import React, { ChangeEvent } from 'react';
import { LanguageSelectorProps } from './types';

export default function LanguageSelector({
  value,
  onChange,
  disabled,
  languages
}: LanguageSelectorProps) {
  // Obsługa zmiany wybranego języka
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      id="target-language"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="w-full p-2.5 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      aria-invalid={value === ''}
    >
      <option value="" disabled>
        Wybierz język
      </option>
      {languages.map(language => (
        <option key={language.value} value={language.value}>
          {language.label}
        </option>
      ))}
    </select>
  );
} 