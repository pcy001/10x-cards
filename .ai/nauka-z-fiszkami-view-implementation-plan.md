# Plan implementacji widoku Nauka z Fiszkami

## 1. Przegląd
Widok sesji nauki jest kluczowym elementem aplikacji 10xCards, umożliwiającym użytkownikom naukę z wykorzystaniem fiszek i algorytmu powtórek odstępowanych w czasie. Widok prezentuje fiszki jedna po drugiej, umożliwiając użytkownikowi sprawdzenie swojej wiedzy oraz ocenę trudności materiału, co wpływa na częstotliwość pojawiania się fiszek w przyszłych sesjach nauki.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/learning/session` i zostanie zaimplementowany w pliku `src/pages/learning/session.astro`.

## 3. Struktura komponentów
```
LearningSessionPage (strona)
└── MainLayout (layout)
    └── LearningSessionContainer (komponent React)
        ├── SessionHeader
        │   ├── ProgressIndicator
        │   └── EndSessionButton
        ├── FlashcardDisplay
        │   ├── FlashcardFront
        │   └── FlashcardBack
        └── DifficultyRatingControls
            ├── RatingButton (wielokrotne użycie)
            └── SkipButton
```

## 4. Szczegóły komponentów

### LearningSessionPage
- **Opis komponentu**: Główna strona sesji nauki, obsługująca inicjalizację sesji poprzez wywołanie API i przekazanie danych do komponentów React.
- **Główne elementy**: Komponent Astro zawierający `MainLayout` i inicjalizujący React w trybie klienta dla interaktywnych komponentów.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, działa jako kontener.
- **Obsługiwana walidacja**: Sprawdzenie, czy użytkownik jest zalogowany (przekierowanie do logowania, jeśli nie).
- **Typy**: Wykorzystuje typy API dla rozpoczęcia sesji.
- **Propsy**: Brak (komponent najwyższego poziomu).

### MainLayout
- **Opis komponentu**: Wspólny layout aplikacji zapewniający spójny interfejs użytkownika.
- **Główne elementy**: Nagłówek, obszar główny (main) i stopka.
- **Obsługiwane interakcje**: Nawigacja po aplikacji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Standardowe propsy layoutu.
- **Propsy**: `title: string`, `children: ReactNode`.

### LearningSessionContainer
- **Opis komponentu**: Główny kontener React zarządzający stanem sesji nauki, komunikacją z API i koordynujący podkomponenty.
- **Główne elementy**: `SessionHeader`, `FlashcardDisplay`, `DifficultyRatingControls` oraz logika obsługi stanu sesji i komunikacji z API.
- **Obsługiwane interakcje**: 
  - Inicjalizacja sesji
  - Przechodzenie między fiszkami
  - Odwracanie aktualnej fiszki
  - Ocenianie trudności fiszek
  - Zakończenie sesji
- **Obsługiwana walidacja**: 
  - Sprawdzenie, czy sesja jest aktywna
  - Weryfikacja, czy istnieją fiszki do nauki
- **Typy**: 
  - `LearningSessionState`
  - `FlashcardWithFrontContent` (z odpowiedzi API)
  - `FlashcardWithFullContent` (z odpowiedzi API)
- **Propsy**: 
  - `initialSessionId?: UUID`
  - `initialFlashcards?: LearningSessionFlashcardDto[]`

### SessionHeader
- **Opis komponentu**: Nagłówek sesji nauki zawierający wskaźnik postępu i przycisk zakończenia sesji.
- **Główne elementy**: Tytuł sesji, `ProgressIndicator`, `EndSessionButton`.
- **Obsługiwane interakcje**: Kliknięcie przycisku zakończenia sesji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Proste typy dla propsów.
- **Propsy**: 
  - `currentIndex: number`
  - `totalFlashcards: number`
  - `onEndSession: () => void`

### ProgressIndicator
- **Opis komponentu**: Wizualizacja postępu w sesji nauki.
- **Główne elementy**: Pasek postępu lub numeryczny wskaźnik (np. "3/10").
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Proste typy dla propsów.
- **Propsy**: 
  - `current: number`
  - `total: number`

### EndSessionButton
- **Opis komponentu**: Przycisk umożliwiający wcześniejsze zakończenie sesji nauki.
- **Główne elementy**: Przycisk z ikoną lub tekstem.
- **Obsługiwane interakcje**: Kliknięcie przycisku.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Funkcja zwrotna.
- **Propsy**: 
  - `onClick: () => void`

### FlashcardDisplay
- **Opis komponentu**: Komponent wyświetlający aktualną fiszkę z możliwością odwracania.
- **Główne elementy**: Karta z animacją odwracania, zawierająca `FlashcardFront` i `FlashcardBack`.
- **Obsługiwane interakcje**: 
  - Kliknięcie karty (odwrócenie)
  - Obsługa klawiszy (np. spacja do odwrócenia)
- **Obsługiwana walidacja**: Sprawdzenie, czy zawartość fiszki jest dostępna.
- **Typy**: Dane fiszki i stan odwrócenia.
- **Propsy**: 
  - `flashcard: FlashcardViewModel`
  - `isFlipped: boolean`
  - `onFlip: () => void`

### FlashcardFront
- **Opis komponentu**: Przednia strona fiszki zawierająca pytanie lub termin.
- **Główne elementy**: Tekst, opcjonalnie formatowany HTML.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Proste typy dla propsów.
- **Propsy**: 
  - `content: string`

### FlashcardBack
- **Opis komponentu**: Tylna strona fiszki zawierająca odpowiedź lub definicję.
- **Główne elementy**: Tekst, opcjonalnie formatowany HTML.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Proste typy dla propsów.
- **Propsy**: 
  - `content: string`

### DifficultyRatingControls
- **Opis komponentu**: Panel z przyciskami oceny trudności fiszki.
- **Główne elementy**: Zestaw przycisków `RatingButton` dla różnych poziomów trudności oraz `SkipButton`.
- **Obsługiwane interakcje**: Kliknięcie przycisku oceny trudności.
- **Obsługiwana walidacja**: Sprawdzenie, czy fiszka jest odwrócona (przyciski aktywne tylko po zobaczeniu odpowiedzi).
- **Typy**: Typy dla propsów i wartości DifficultyRating.
- **Propsy**: 
  - `isCardFlipped: boolean`
  - `onRatingSelect: (rating: DifficultyRating, isCorrect: boolean) => void`
  - `onSkip: () => void`

### RatingButton
- **Opis komponentu**: Pojedynczy przycisk oceny trudności.
- **Główne elementy**: Przycisk z tekstem/ikoną reprezentującą poziom trudności.
- **Obsługiwane interakcje**: Kliknięcie przycisku.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Typy dla propsów i wartości DifficultyRating.
- **Propsy**: 
  - `rating: DifficultyRating`
  - `isCorrect: boolean`
  - `label: string`
  - `onClick: (rating: DifficultyRating, isCorrect: boolean) => void`
  - `disabled: boolean`

### SkipButton
- **Opis komponentu**: Przycisk umożliwiający pominięcie aktualnej fiszki.
- **Główne elementy**: Przycisk z tekstem "Pomiń" lub ikoną.
- **Obsługiwane interakcje**: Kliknięcie przycisku.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Funkcja zwrotna.
- **Propsy**: 
  - `onClick: () => void`

## 5. Typy
```typescript
// Nowe typy dla obsługi sesji nauki

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

// Model widoku dla fiszki
export interface FlashcardViewModel {
  id: UUID;
  frontContent: string;
  backContent?: string;
  isFullyLoaded: boolean;
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

// Typ dla obsługi animacji fiszki
export interface FlashcardAnimationState {
  isFlipping: boolean;
  isFlipped: boolean;
}

// Typ dla akcji w hookach stanu
export type LearningSessionAction =
  | { type: 'SESSION_STARTED', payload: { sessionId: UUID, flashcards: LearningSessionFlashcardDto[] } }
  | { type: 'FLASHCARD_LOADED', payload: { flashcard: GetFlashcardForReviewResponseDto } }
  | { type: 'FLIP_CARD' }
  | { type: 'RATE_CARD', payload: { rating: DifficultyRating, isCorrect: boolean } }
  | { type: 'NEXT_CARD' }
  | { type: 'SKIP_CARD' }
  | { type: 'ERROR', payload: { message: string } }
  | { type: 'SESSION_ENDED', payload: { summary: SessionSummaryDto } };
```

## 6. Zarządzanie stanem

### Hook useLearningSession
Główny hook zarządzający stanem sesji nauki, odpowiedzialny za:
- Inicjalizację sesji nauki
- Pobieranie zawartości fiszek
- Obsługę odwracania fiszek
- Ocenianie trudności i przechodzenie między fiszkami
- Zakończenie sesji i pobranie podsumowania

```typescript
function useLearningSession(initialSessionId?: UUID, initialFlashcards?: LearningSessionFlashcardDto[]) {
  const [state, dispatch] = useReducer(learningSessionReducer, {
    sessionId: initialSessionId || null,
    flashcards: initialFlashcards ? mapToViewModels(initialFlashcards) : [],
    currentIndex: 0,
    isLoading: initialSessionId ? false : true,
    isFlipped: false,
    isSessionComplete: false,
    error: null,
    sessionSummary: null
  });

  // Inicjalizacja sesji, jeśli nie została dostarczona
  useEffect(() => {
    if (!state.sessionId) {
      startNewSession();
    }
  }, []);

  // Ładowanie pełnej zawartości aktualnej fiszki, jeśli nie jest załadowana
  useEffect(() => {
    const currentFlashcard = state.flashcards[state.currentIndex];
    if (currentFlashcard && !currentFlashcard.isFullyLoaded) {
      loadFlashcardContent(currentFlashcard.id);
    }
  }, [state.currentIndex, state.flashcards]);

  // Funkcje obsługujące sesję nauki
  async function startNewSession() { /* implementacja */ }
  async function loadFlashcardContent(id: UUID) { /* implementacja */ }
  function flipCard() { /* implementacja */ }
  async function rateCard(rating: DifficultyRating, isCorrect: boolean) { /* implementacja */ }
  function nextCard() { /* implementacja */ }
  function skipCard() { /* implementacja */ }
  async function endSession() { /* implementacja */ }

  return {
    state,
    flipCard,
    rateCard,
    skipCard,
    endSession
  };
}
```

### Reducer stanu
```typescript
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
    // inne przypadki obsługi akcji
    default:
      return state;
  }
}
```

## 7. Integracja API

### 1. Rozpoczęcie sesji nauki
```typescript
async function startNewSession() {
  try {
    const response = await fetch('/api/learning/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 20 })
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się rozpocząć sesji nauki');
    }
    
    const data: StartLearningSessionResponseDto = await response.json();
    dispatch({ 
      type: 'SESSION_STARTED', 
      payload: { 
        sessionId: data.session_id, 
        flashcards: data.flashcards 
      } 
    });
  } catch (error) {
    dispatch({ 
      type: 'ERROR', 
      payload: { message: error instanceof Error ? error.message : 'Nieznany błąd' } 
    });
  }
}
```

### 2. Pobieranie pełnej zawartości fiszki
```typescript
async function loadFlashcardContent(id: UUID) {
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
}
```

### 3. Ocenianie fiszki
```typescript
async function rateCard(rating: DifficultyRating, isCorrect: boolean) {
  try {
    if (!state.sessionId || state.currentIndex >= state.flashcards.length) {
      return;
    }
    
    const currentFlashcard = state.flashcards[state.currentIndex];
    
    const response = await fetch(`/api/flashcards/${currentFlashcard.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty_rating: rating,
        is_correct: isCorrect,
        session_id: state.sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się zapisać oceny fiszki');
    }
    
    // Po udanej ocenie przejdź do następnej fiszki
    nextCard();
  } catch (error) {
    dispatch({ 
      type: 'ERROR', 
      payload: { message: error instanceof Error ? error.message : 'Nieznany błąd' } 
    });
  }
}
```

### 4. Zakończenie sesji nauki
```typescript
async function endSession() {
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
}
```

## 8. Interakcje użytkownika

### Odwracanie fiszki
Użytkownik może odwrócić fiszkę (zobaczyć odpowiedź/definicję) poprzez:
- Kliknięcie na fiszkę
- Naciśnięcie spacji
- Naciśnięcie klawisza Enter

Po odwróceniu fiszki pokazują się przyciski oceny trudności.

### Ocena trudności
Po obejrzeniu tylnej strony fiszki, użytkownik ocenia swoją znajomość poprzez wybranie jednego z przycisków:
- "Nie pamiętam" - użytkownik nie znał odpowiedzi
- "Trudne" - użytkownik miał problem z przypomnieniem sobie odpowiedzi
- "Średnie" - użytkownik przypomniał sobie odpowiedź z pewnym wysiłkiem
- "Łatwe" - użytkownik znał odpowiedź bez problemu

Po wybraniu oceny, system automatycznie przechodzi do następnej fiszki.

### Zakończenie sesji
Użytkownik może zakończyć sesję nauki w dowolnym momencie poprzez:
- Kliknięcie przycisku "Zakończ sesję"
- Zakończenie ostatniej fiszki

Po zakończeniu sesji użytkownik widzi podsumowanie, które zawiera:
- Liczbę przejrzanych fiszek
- Liczbę poprawnych odpowiedzi
- Czas trwania sesji
- Przycisk powrotu do głównego ekranu aplikacji

## 9. Warunki i walidacja

### Dostępność przycisków oceny
- Przyciski oceny trudności są dostępne tylko po odwróceniu fiszki (zobaczeniu odpowiedzi)
- Przed odwróceniem fiszki przyciski są nieaktywne lub ukryte

### Poprawność danych sesji
- Sprawdzenie, czy sesja została poprawnie zainicjowana przed pokazaniem fiszek
- Walidacja, czy aktualna fiszka posiada zawartość zarówno przedniej, jak i tylnej strony

### Zakończenie sesji
- Automatyczne zakończenie sesji po ocenieniu ostatniej fiszki
- Możliwość manualnego zakończenia sesji w dowolnym momencie

## 10. Obsługa błędów

### Niepowodzenie inicjalizacji sesji
- Pokazanie komunikatu o błędzie
- Przycisk umożliwiający ponowną próbę rozpoczęcia sesji

### Błąd pobierania zawartości fiszki
- Pokazanie komunikatu o błędzie na karcie fiszki
- Opcja ponowienia próby pobrania lub przejścia do następnej fiszki

### Błąd oceniania fiszki
- Pokazanie komunikatu o błędzie
- Zachowanie stanu oceny i umożliwienie ponownej próby wysłania

### Błąd zakończenia sesji
- Pokazanie komunikatu o błędzie
- Oferowanie alternatywnej drogi powrotu do głównego ekranu

### Utrata połączenia internetowego
- Monitorowanie stanu połączenia
- Możliwość zachowania postępu sesji w pamięci lokalnej
- Automatyczna synchronizacja po odzyskaniu połączenia

## 11. Kroki implementacji

1. **Konfiguracja projektu**
   - Utworzenie struktury folderów i plików dla nowego widoku
   - Sprawdzenie zależności i komponentów UI

2. **Implementacja warstwy danych**
   - Definicja typów i modeli danych
   - Implementacja hooka useLearningSession i reducera stanu

3. **Implementacja komponentów bazowych**
   - Struktura podstawowa FlashcardDisplay
   - Implementacja logiki odwracania fiszki z animacją

4. **Implementacja widoku sesji nauki**
   - Stworzenie strony w Astro (LearningSessionPage)
   - Implementacja głównego kontenera React (LearningSessionContainer)

5. **Integracja z API**
   - Implementacja funkcji komunikacji z endpointami
   - Testowanie integracji z backendem

6. **Implementacja komponentów interfejsu użytkownika**
   - Utworzenie SessionHeader z ProgressIndicator
   - Implementacja DifficultyRatingControls
   - Dodanie animacji i przejść między stanami

7. **Zarządzanie stanem i przepływ danych**
   - Połączenie komponentów z hookiem stanu
   - Implementacja przechodzenia między fiszkami

8. **Obsługa błędów i przypadków brzegowych**
   - Dodanie komunikatów o błędach
   - Implementacja obsługi przypadków specjalnych

9. **Optymalizacja wydajności**
   - Użycie React.memo dla komponentów niezmieniających się często
   - Optymalizacja renderowania i animacji

10. **Testy**
    - Testy jednostkowe dla kluczowych funkcji
    - Testy integracyjne dla przepływu użytkownika

11. **Stylizacja i dostępność**
    - Implementacja stylów Tailwind
    - Zapewnienie dostępności (ARIA, obsługa klawiatury)

12. **Finalizacja i dokumentacja**
    - Przegląd kodu i refaktoryzacja
    - Dokumentacja komponentów i hooka 