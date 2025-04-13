import { useReducer, useEffect, useCallback } from 'react';
import type { UUID } from '@/types';
import type { 
  LearningSessionFlashcardDto, 
  GetFlashcardForReviewResponseDto,
  ReviewFlashcardDto,
  DifficultyRating,
  SessionSummaryDto,
  StartLearningSessionResponseDto,
  EndLearningSessionResponseDto 
} from '@/types';

// Model widoku dla fiszki
export interface FlashcardViewModel {
  id: UUID;
  frontContent: string;
  backContent?: string;
  isFullyLoaded: boolean;
}

// Stan sesji nauki
export interface LearningSessionState {
  sessionId: UUID | null;
  flashcards: FlashcardViewModel[];
  currentIndex: number;
  isLoading: boolean;
  isFlipped: boolean;
  isSessionComplete: boolean;
  error: string | null;
  sessionSummary: SessionSummaryDto | null;
}

// Mapowanie poziomów trudności na wartości tekstowe
export const difficultyLabels: Record<DifficultyRating, string> = {
  'nie_pamietam': 'Nie pamiętam',
  'trudne': 'Trudne',
  'srednie': 'Średnie',
  'latwe': 'Łatwe'
};

// Mapowanie poziomów trudności na wartości logiczne poprawności
export const difficultyCorrectness: Record<DifficultyRating, boolean> = {
  'nie_pamietam': false,
  'trudne': true,
  'srednie': true,
  'latwe': true
};

// Typ dla akcji w reducerze
export type LearningSessionAction =
  | { type: 'SESSION_STARTED', payload: { sessionId: UUID, flashcards: LearningSessionFlashcardDto[] } }
  | { type: 'FLASHCARD_LOADED', payload: { flashcard: GetFlashcardForReviewResponseDto } }
  | { type: 'FLIP_CARD' }
  | { type: 'RATE_CARD', payload: { rating: DifficultyRating, isCorrect: boolean } }
  | { type: 'NEXT_CARD' }
  | { type: 'SKIP_CARD' }
  | { type: 'ERROR', payload: { message: string } }
  | { type: 'SESSION_ENDED', payload: { summary: SessionSummaryDto } };

// Reducer do zarządzania stanem sesji
function learningSessionReducer(state: LearningSessionState, action: LearningSessionAction): LearningSessionState {
  switch (action.type) {
    case 'SESSION_STARTED':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        flashcards: action.payload.flashcards.map(f => ({
          id: f.id,
          frontContent: f.front_content,
          isFullyLoaded: false
        })),
        isLoading: false,
        currentIndex: 0,
        isFlipped: false,
        isSessionComplete: false,
        error: null
      };
      
    case 'FLASHCARD_LOADED':
      return {
        ...state,
        flashcards: state.flashcards.map(f => 
          f.id === action.payload.flashcard.id 
            ? { 
                ...f, 
                backContent: action.payload.flashcard.back_content, 
                isFullyLoaded: true 
              } 
            : f
        )
      };
      
    case 'FLIP_CARD':
      return {
        ...state,
        isFlipped: true
      };
      
    case 'NEXT_CARD': {
      const newIndex = state.currentIndex + 1;
      const isLastCard = newIndex >= state.flashcards.length;
      
      return {
        ...state,
        currentIndex: isLastCard ? state.currentIndex : newIndex,
        isFlipped: false,
        isSessionComplete: isLastCard
      };
    }
      
    case 'SKIP_CARD': {
      const newIndex = state.currentIndex + 1;
      const isLastCard = newIndex >= state.flashcards.length;
      
      return {
        ...state,
        currentIndex: isLastCard ? state.currentIndex : newIndex,
        isFlipped: false,
        isSessionComplete: isLastCard
      };
    }
      
    case 'ERROR':
      return {
        ...state,
        error: action.payload.message,
        isLoading: false
      };
      
    case 'SESSION_ENDED':
      return {
        ...state,
        sessionSummary: action.payload.summary,
        isSessionComplete: true
      };
      
    default:
      return state;
  }
}

// Helper do mapowania fiszek z API na model widoku
function mapToViewModels(flashcards: LearningSessionFlashcardDto[]): FlashcardViewModel[] {
  return flashcards.map(f => ({
    id: f.id,
    frontContent: f.front_content,
    isFullyLoaded: false
  }));
}

// Główny hook do obsługi sesji nauki
export function useLearningSession(initialSessionId?: UUID, initialFlashcards?: LearningSessionFlashcardDto[]) {
  const [state, dispatch] = useReducer(learningSessionReducer, {
    sessionId: initialSessionId || null,
    flashcards: initialFlashcards ? mapToViewModels(initialFlashcards) : [],
    currentIndex: 0,
    isLoading: !initialSessionId, // Jeśli nie mamy ID sesji, to zaczynamy od ładowania
    isFlipped: false,
    isSessionComplete: false,
    error: null,
    sessionSummary: null
  });

  // Inicjalizacja sesji, jeśli nie została dostarczona
  useEffect(() => {
    if (!state.sessionId && state.isLoading) {
      startNewSession();
    }
  }, []);

  // Ładowanie pełnej zawartości aktualnej fiszki, jeśli nie jest załadowana
  useEffect(() => {
    const currentFlashcard = state.flashcards[state.currentIndex];
    if (currentFlashcard && !currentFlashcard.isFullyLoaded && !state.isLoading) {
      loadFlashcardContent(currentFlashcard.id);
    }
  }, [state.currentIndex, state.flashcards, state.isLoading]);

  // Funkcja do rozpoczęcia nowej sesji nauki
  const startNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/learning/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Błąd rozpoczęcia sesji nauki:', responseData);
        throw new Error(
          responseData.message || 
          responseData.error || 
          `Nie udało się rozpocząć sesji nauki (${response.status})`
        );
      }
      
      // Sprawdź, czy są fiszki do nauki
      if (Array.isArray(responseData.flashcards) && responseData.flashcards.length === 0) {
        console.log('Brak fiszek do nauki w tym momencie');
        dispatch({ 
          type: 'ERROR', 
          payload: { message: 'Brak fiszek do nauki. Dodaj nowe fiszki lub poczekaj, aż będą gotowe do powtórki.' } 
        });
        return;
      }
      
      if (!responseData.session_id) {
        console.error('Brak ID sesji w odpowiedzi:', responseData);
        throw new Error('Brak ID sesji w odpowiedzi z serwera');
      }
      
      if (!Array.isArray(responseData.flashcards)) {
        console.warn('Brak fiszek w odpowiedzi lub niepoprawny format:', responseData);
        responseData.flashcards = []; // Zapewnij, że to będzie zawsze tablica
      }
      
      console.log('Rozpoczęto sesję nauki:', responseData.session_id, 'z', responseData.flashcards.length, 'fiszkami');
      
      dispatch({ 
        type: 'SESSION_STARTED', 
        payload: { 
          sessionId: responseData.session_id, 
          flashcards: responseData.flashcards 
        } 
      });
    } catch (error) {
      console.error('Błąd podczas inicjalizacji sesji nauki:', error);
      
      let errorMessage = 'Nie udało się rozpocząć sesji nauki.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({ 
        type: 'ERROR', 
        payload: { message: errorMessage } 
      });
    }
  }, [dispatch]);

  // Funkcja do ładowania pełnej zawartości fiszki
  const loadFlashcardContent = useCallback(async (id: UUID) => {
    try {
      const response = await fetch(`/api/flashcards/${id}/review`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać zawartości fiszki');
      }
      
      const data: GetFlashcardForReviewResponseDto = await response.json();
      dispatch({ type: 'FLASHCARD_LOADED', payload: { flashcard: data } });
    } catch (error) {
      dispatch({ 
        type: 'ERROR', 
        payload: { message: error instanceof Error ? error.message : 'Nieznany błąd' } 
      });
    }
  }, []);

  // Funkcja do odwracania fiszki
  const flipCard = useCallback(() => {
    if (!state.isFlipped && state.flashcards[state.currentIndex]?.isFullyLoaded) {
      dispatch({ type: 'FLIP_CARD' });
    }
  }, [state.isFlipped, state.flashcards, state.currentIndex]);

  // Funkcja do oceniania fiszki
  const rateCard = useCallback(async (rating: DifficultyRating, isCorrect: boolean) => {
    try {
      if (!state.sessionId || state.currentIndex >= state.flashcards.length) {
        return;
      }
      
      const currentFlashcard = state.flashcards[state.currentIndex];
      
      const reviewData: ReviewFlashcardDto = {
        difficulty_rating: rating,
        is_correct: isCorrect,
        session_id: state.sessionId
      };
      
      const response = await fetch(`/api/flashcards/${currentFlashcard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się zapisać oceny fiszki');
      }
      
      dispatch({ type: 'NEXT_CARD' });
      
      // Jeśli to była ostatnia fiszka, zakończ sesję
      if (state.currentIndex === state.flashcards.length - 1) {
        await endSession();
      }
    } catch (error) {
      dispatch({ 
        type: 'ERROR', 
        payload: { message: error instanceof Error ? error.message : 'Nieznany błąd' } 
      });
    }
  }, [state.sessionId, state.currentIndex, state.flashcards]);

  // Funkcja do pomijania fiszki
  const skipCard = useCallback(() => {
    dispatch({ type: 'SKIP_CARD' });
    
    // Jeśli to była ostatnia fiszka, zakończ sesję
    if (state.currentIndex === state.flashcards.length - 1) {
      endSession();
    }
  }, [state.currentIndex, state.flashcards]);

  // Funkcja do zakończenia sesji nauki
  const endSession = useCallback(async () => {
    try {
      if (!state.sessionId) {
        return;
      }
      
      const response = await fetch(`/api/learning/sessions/${state.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się zakończyć sesji nauki');
      }
      
      const data: EndLearningSessionResponseDto = await response.json();
      dispatch({ type: 'SESSION_ENDED', payload: { summary: data.session_summary } });
    } catch (error) {
      dispatch({ 
        type: 'ERROR', 
        payload: { message: error instanceof Error ? error.message : 'Nieznany błąd' } 
      });
    }
  }, [state.sessionId]);

  return {
    state,
    flipCard,
    rateCard,
    skipCard,
    endSession
  };
} 