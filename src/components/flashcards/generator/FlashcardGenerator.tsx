import React, { useState, useCallback } from 'react';
import { 
  GeneratorFormData, 
  GenerationStatusType, 
  FlashcardSelection,
  FlashcardGeneratorViewModel,
  LanguageOption
} from './types';
import GeneratorForm from './GeneratorForm';
import GenerationStatus from './GenerationStatus';
import GeneratedFlashcardsList from './GeneratedFlashcardsList';
import { 
  GenerateFlashcardsResponseDto, 
  GeneratedFlashcardDto,
  AcceptFlashcardsResponseDto 
} from '@/types';

const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { value: 'en', label: 'Angielski' },
  { value: 'pl', label: 'Polski' },
  { value: 'es', label: 'Hiszpański' },
  { value: 'de', label: 'Niemiecki' },
  { value: 'fr', label: 'Francuski' },
  { value: 'it', label: 'Włoski' },
  { value: 'ru', label: 'Rosyjski' },
  { value: 'pt', label: 'Portugalski' },
  { value: 'zh', label: 'Chiński' },
  { value: 'ja', label: 'Japoński' }
];

export default function FlashcardGenerator() {
  const [state, setState] = useState<FlashcardGeneratorViewModel>({
    form: {
      sourceText: '',
      targetLanguage: '',
      generationType: undefined,
      difficultyLevel: undefined,
      limit: undefined
    },
    generationStatus: {
      status: GenerationStatusType.IDLE
    },
    generatedFlashcards: [],
    selectedFlashcards: {},
    isSaving: false,
    languages: AVAILABLE_LANGUAGES
  });

  // Aktualizacja pola formularza
  const handleFieldChange = useCallback((field: keyof GeneratorFormData, value: any) => {
    setState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        [field]: value
      }
    }));
  }, []);

  // Generowanie fiszek
  const handleGenerateFlashcards = useCallback(async () => {
    try {
      setState(prevState => ({
        ...prevState,
        generationStatus: {
          status: GenerationStatusType.GENERATING,
          message: 'Generowanie fiszek...'
        }
      }));

      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_text: state.form.sourceText,
          target_language: state.form.targetLanguage,
          generation_type: state.form.generationType,
          difficulty_level: state.form.difficultyLevel,
          limit: state.form.limit
        })
      });

      if (!response.ok) {
        throw new Error(`Błąd generowania: ${response.status}`);
      }

      const data: GenerateFlashcardsResponseDto = await response.json();

      // Inicjalizacja zaznaczenia wszystkich fiszek jako domyślnie zaznaczone
      const selection: FlashcardSelection = {};
      data.flashcards.forEach(flashcard => {
        selection[flashcard.temp_id] = true;
      });

      setState(prevState => ({
        ...prevState,
        generatedFlashcards: data.flashcards,
        selectedFlashcards: selection,
        generationStatus: {
          status: GenerationStatusType.SUCCESS,
          message: `Wygenerowano ${data.flashcards.length} fiszek`
        }
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        generationStatus: {
          status: GenerationStatusType.ERROR,
          message: error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
        }
      }));
    }
  }, [state.form]);

  // Zmiana zaznaczenia fiszki
  const handleFlashcardSelectionChange = useCallback((id: string, selected: boolean) => {
    setState(prevState => ({
      ...prevState,
      selectedFlashcards: {
        ...prevState.selectedFlashcards,
        [id]: selected
      }
    }));
  }, []);

  // Zaznaczenie wszystkich fiszek
  const handleSelectAllFlashcards = useCallback(() => {
    const selection: FlashcardSelection = {};
    state.generatedFlashcards.forEach(flashcard => {
      selection[flashcard.temp_id] = true;
    });
    setState(prevState => ({
      ...prevState,
      selectedFlashcards: selection
    }));
  }, [state.generatedFlashcards]);

  // Odznaczenie wszystkich fiszek
  const handleDeselectAllFlashcards = useCallback(() => {
    const selection: FlashcardSelection = {};
    state.generatedFlashcards.forEach(flashcard => {
      selection[flashcard.temp_id] = false;
    });
    setState(prevState => ({
      ...prevState,
      selectedFlashcards: selection
    }));
  }, [state.generatedFlashcards]);

  // Zapisanie wybranych fiszek
  const handleSaveSelectedFlashcards = useCallback(async () => {
    try {
      setState(prevState => ({
        ...prevState,
        isSaving: true
      }));

      // Przygotowanie fiszek do zapisania
      const selectedFlashcards = state.generatedFlashcards
        .filter(flashcard => state.selectedFlashcards[flashcard.temp_id])
        .map(flashcard => ({
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
          is_ai_generated: true
        }));

      if (selectedFlashcards.length === 0) {
        throw new Error('Nie wybrano żadnych fiszek do zapisania');
      }

      const response = await fetch('/api/flashcards/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flashcards: selectedFlashcards
        })
      });

      if (!response.ok) {
        throw new Error(`Błąd zapisywania: ${response.status}`);
      }

      const data: AcceptFlashcardsResponseDto = await response.json();

      // Przekierowanie do listy fiszek z informacją o sukcesie
      window.location.href = '/flashcards?flashcardsAdded=true&count=' + data.accepted_count;
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isSaving: false,
        generationStatus: {
          status: GenerationStatusType.ERROR,
          message: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania fiszek'
        }
      }));
    }
  }, [state.generatedFlashcards, state.selectedFlashcards]);

  // Obliczenie liczby zaznaczonych fiszek
  const selectedCount = Object.values(state.selectedFlashcards).filter(Boolean).length;

  // Sprawdzenie, czy formularz jest kompletny (walidacja)
  const isFormValid = state.form.sourceText.trim().length > 0 && state.form.targetLanguage.length > 0;

  // Renderowanie komponentu na podstawie stanu generowania
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Generator Fiszek</h1>
      
      <GeneratorForm
        form={state.form}
        onFieldChange={handleFieldChange}
        onSubmit={handleGenerateFlashcards}
        isGenerating={state.generationStatus.status === GenerationStatusType.GENERATING}
        disabled={state.generationStatus.status === GenerationStatusType.GENERATING || state.isSaving}
        languages={state.languages}
      />
      
      {state.generationStatus.status !== GenerationStatusType.IDLE && (
        <GenerationStatus
          status={state.generationStatus.status}
          message={state.generationStatus.message}
        />
      )}
      
      {state.generatedFlashcards.length > 0 && (
        <GeneratedFlashcardsList
          flashcards={state.generatedFlashcards}
          selectedFlashcards={state.selectedFlashcards}
          onSelectionChange={handleFlashcardSelectionChange}
          onSelectAll={handleSelectAllFlashcards}
          onDeselectAll={handleDeselectAllFlashcards}
          onSaveSelected={handleSaveSelectedFlashcards}
          isSaving={state.isSaving}
        />
      )}
    </div>
  );
}