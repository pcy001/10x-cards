import { FlashcardResponseDto } from '@/types';

// Model widoku dla fiszki
export interface FlashcardViewModel {
  id: string;
  frontContent: string;
  backContent: string;
  isAiGenerated: boolean;
  createdAt: string | Date;
  correctAnswersCount: number;
}

// Parametry zapytania dla listy fiszek
export interface FlashcardsQueryParams {
  page: number;
  perPage: number;
  sortBy: 'created_at' | 'correct_answers_count';
  sortDir: 'asc' | 'desc';
}

// Mapowanie DTO na ViewModel
export function mapFlashcardToViewModel(dto: FlashcardResponseDto): FlashcardViewModel {
  return {
    id: dto.id,
    frontContent: dto.front_content,
    backContent: dto.back_content,
    isAiGenerated: dto.is_ai_generated,
    createdAt: new Date(dto.created_at || ''),
    correctAnswersCount: dto.correct_answers_count
  };
}

// Propsy dla komponentów
export interface FlashcardsHeaderProps {
  sortBy: string;
  sortDir: string;
  onSortChange: (sortBy: string, sortDir: string) => void;
}

export interface SortControlsProps {
  sortBy: string;
  sortDir: string;
  onSortChange: (sortBy: string, sortDir: string) => void;
}

export interface FlashcardsListProps {
  flashcards: FlashcardViewModel[];
  onDeleteFlashcard: (id: string) => void;
  isLoading: boolean;
}

export interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onDelete: () => void;
}

export interface FlashcardContentProps {
  frontContent: string;
  backContent: string;
  isAiGenerated?: boolean;
}

export interface DeleteFlashcardButtonProps {
  onClick: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  flashcardId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
} 