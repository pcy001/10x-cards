import React from 'react';
import { GeneratorFormProps } from './types';
import SourceTextArea from './SourceTextArea';
import LanguageSelector from './LanguageSelector';
import GenerateButton from './GenerateButton';

export default function GeneratorForm({
  form,
  onFieldChange,
  onSubmit,
  isGenerating,
  disabled,
  languages
}: GeneratorFormProps) {
  // Sprawdzenie, czy przycisk generowania powinien być aktywny
  const isSubmitDisabled = 
    disabled || 
    form.sourceText.trim().length === 0 || 
    form.targetLanguage.length === 0;

  // Obsługa zatwierdzenia formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitDisabled) {
      onSubmit();
    }
  };

  // Obsługa zmiany pola tekstowego
  const handleSourceTextChange = (value: string) => {
    onFieldChange('sourceText', value);
  };

  // Obsługa zmiany języka docelowego
  const handleTargetLanguageChange = (value: string) => {
    onFieldChange('targetLanguage', value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Obszar tekstowy */}
        <div className="md:col-span-2">
          <label htmlFor="source-text" className="block text-sm font-medium mb-2">
            Tekst źródłowy
          </label>
          <SourceTextArea
            value={form.sourceText}
            onChange={handleSourceTextChange}
            disabled={disabled}
            placeholder="Wklej tekst źródłowy, z którego chcesz wygenerować fiszki..."
            maxLength={10000}
          />
        </div>

        {/* Opcje generowania */}
        <div className="space-y-4">
          <div>
            <label htmlFor="target-language" className="block text-sm font-medium mb-2">
              Język docelowy
            </label>
            <LanguageSelector
              value={form.targetLanguage}
              onChange={handleTargetLanguageChange}
              disabled={disabled}
              languages={languages}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wybierz język, na który chcesz przetłumaczyć tekst
            </p>
          </div>

          {/* Dodatkowe opcje - można rozszerzyć w przyszłości */}
          <div className="pt-4">
            <GenerateButton
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              isLoading={isGenerating}
            />
          </div>
        </div>
      </div>
    </form>
  );
} 