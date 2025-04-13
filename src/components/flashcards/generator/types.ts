import type {
  GenerateFlashcardsDto,
  GeneratedFlashcardDto,
  GenerateFlashcardsResponseDto,
  FlashcardToAcceptDto,
  AcceptFlashcardsDto,
  AcceptFlashcardsResponseDto,
  AcceptedFlashcardDto
} from "@/types";

// Opcja języka dla komponentu wyboru języka
export interface LanguageOption {
  value: string; // kod ISO języka
  label: string; // nazwa języka do wyświetlenia
}

// Typ dla statusu generowania fiszek
export enum GenerationStatusType {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Dane formularza generatora
export interface GeneratorFormData {
  sourceText: string;
  targetLanguage: string;
  generationType?: 'vocabulary' | 'phrases' | 'definitions';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
}

// Typ dla zarządzania zaznaczeniem fiszek
export interface FlashcardSelection {
  [flashcardId: string]: boolean;
}

// ViewModel dla widoku generatora
export interface FlashcardGeneratorViewModel {
  form: GeneratorFormData;
  generationStatus: {
    status: GenerationStatusType;
    message?: string;
  };
  generatedFlashcards: GeneratedFlashcardDto[];
  selectedFlashcards: FlashcardSelection;
  isSaving: boolean;
  languages: LanguageOption[];
}

// Propsy dla komponentów
export interface SourceTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  languages: LanguageOption[];
}

export interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export interface GenerationStatusProps {
  status: GenerationStatusType;
  message?: string;
}

export interface FlashcardPreviewItemProps {
  flashcard: GeneratedFlashcardDto;
  isSelected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
}

export interface FlashcardContentProps {
  flashcard: GeneratedFlashcardDto;
  expanded?: boolean;
}

export interface SelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectedCount: number;
  totalCount: number;
}

export interface SaveSelectedButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  selectedCount: number;
}

export interface GeneratedFlashcardsListProps {
  flashcards: GeneratedFlashcardDto[];
  selectedFlashcards: FlashcardSelection;
  onSelectionChange: (id: string, selected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSaveSelected: () => void;
  isSaving: boolean;
}

export interface GeneratorFormProps {
  form: GeneratorFormData;
  onFieldChange: (field: keyof GeneratorFormData, value: any) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  disabled: boolean;
  languages: LanguageOption[];
} 