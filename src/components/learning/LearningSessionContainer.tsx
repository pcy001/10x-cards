import React, { useEffect } from 'react';
import { useLearningSession } from '@/hooks/useLearningSession';
import { Spinner } from '@/components/ui/Spinner';
import { Book, CheckCircle, XCircle, SkipForward, ChevronRight } from 'lucide-react';
import { difficultyLabels, difficultyCorrectness } from '@/hooks/useLearningSession';
import type { DifficultyRating } from '@/types';

export default function LearningSessionContainer() {
  const { state, flipCard, rateCard, skipCard, endSession } = useLearningSession();

  // Efekt do przekierowania na stronę podsumowania, gdy sesja się zakończy
  useEffect(() => {
    if (state.isSessionComplete && state.sessionSummary) {
      // Zapisz podsumowanie sesji w sessionStorage do wykorzystania przez widok podsumowania
      sessionStorage.setItem(
        'learningSessionSummary', 
        JSON.stringify(state.sessionSummary)
      );
      
      // Przekieruj do strony podsumowania z ID sesji
      window.location.href = `/learning/summary?session_id=${state.sessionId}`;
    }
  }, [state.isSessionComplete, state.sessionSummary, state.sessionId]);

  // Jeśli trwa ładowanie, pokaż spinner
  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Ładowanie sesji nauki...</p>
      </div>
    );
  }

  // Jeśli wystąpił błąd, pokaż komunikat
  if (state.error) {
    return (
      <div className="max-w-md mx-auto text-center p-6 border rounded-lg bg-card mt-8">
        <div className="text-red-500 mb-4">
          {state.error.includes("Brak fiszek") ? (
            <>
              <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2 text-foreground">Brak fiszek do nauki</h2>
              <p className="text-muted-foreground mb-4">
                {state.error}
              </p>
            </>
          ) : (
            state.error
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Spróbuj ponownie
          </button>
          
          {state.error.includes("Brak fiszek") && (
            <a 
              href="/flashcards/generate" 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Dodaj nowe fiszki
            </a>
          )}
        </div>
      </div>
    );
  }

  // Jeśli nie ma fiszek do nauki, pokaż informację
  if (state.flashcards.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center p-6 border rounded-lg bg-card mt-8">
        <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Brak fiszek do nauki</h2>
        <p className="text-muted-foreground mb-4">
          Nie masz żadnych fiszek dostępnych do nauki w tej chwili.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => window.location.href = '/flashcards'}
        >
          Dodaj fiszki
        </button>
      </div>
    );
  }

  // Pobierz aktualną fiszkę
  const currentFlashcard = state.flashcards[state.currentIndex];
  
  // Sprawdź, czy fiszka jest w pełni załadowana
  const isLoaded = currentFlashcard && currentFlashcard.isFullyLoaded;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nagłówek sesji */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sesja nauki</h1>
        <div className="text-sm text-muted-foreground">
          Fiszka {state.currentIndex + 1} z {state.flashcards.length}
        </div>
      </div>

      {/* Karta fiszki */}
      <div 
        className={`
          relative w-full aspect-[3/2] rounded-xl border bg-card shadow-sm mb-6
          flex items-center justify-center p-6 cursor-pointer select-none
          ${isLoaded ? 'hover:shadow-md transition-shadow' : 'opacity-70'}
        `}
        onClick={() => isLoaded && flipCard()}
      >
        {!isLoaded ? (
          <Spinner size="md" />
        ) : (
          <div className="text-center">
            <div className={`text-xl ${state.isFlipped ? 'font-normal' : 'font-bold'}`}>
              {state.isFlipped 
                ? currentFlashcard.backContent 
                : currentFlashcard.frontContent}
            </div>
            
            {!state.isFlipped && (
              <div className="absolute bottom-3 right-3 text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ocena fiszki - widoczna tylko po odwróceniu */}
      {state.isFlipped && (
        <div className="space-y-3">
          <h2 className="font-medium text-center mb-2">Jak dobrze pamiętasz tę fiszkę?</h2>
          
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(Object.entries(difficultyLabels) as [DifficultyRating, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => rateCard(key as DifficultyRating, difficultyCorrectness[key as DifficultyRating])}
                className={`
                  py-2 px-3 rounded-md border font-medium text-sm
                  ${key === 'nie_pamietam' 
                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' 
                    : key === 'trudne' 
                    ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                    : key === 'srednie' 
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => skipCard()}
            className="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground mt-2"
          >
            <SkipForward className="h-4 w-4" />
            <span>Pomiń</span>
          </button>
        </div>
      )}

      {/* Pasek postępu */}
      <div className="mt-8">
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-primary"
            style={{ width: `${(state.currentIndex / state.flashcards.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Początek</span>
          <span>Koniec</span>
        </div>
      </div>

      {/* Przycisk do zakończenia sesji */}
      <div className="mt-8 text-center">
        <button
          onClick={() => endSession()}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-md hover:bg-muted/50"
        >
          Zakończ sesję
        </button>
      </div>
    </div>
  );
} 