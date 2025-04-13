# Plan implementacji widoku Podsumowanie Sesji Nauki

## 1. Przegląd
Widok Podsumowanie Sesji Nauki jest istotnym elementem aplikacji 10xCards, prezentującym użytkownikowi statystyki i podsumowanie po zakończonej sesji nauki z fiszkami. Celem tego widoku jest dostarczenie użytkownikowi informacji zwrotnej na temat jego wyników i postępów, a także umożliwienie powrotu do głównego panelu aplikacji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/learning/summary` i zostanie zaimplementowany w pliku `src/pages/learning/summary.astro`.

## 3. Struktura komponentów
```
LearningSessionSummaryPage (strona)
└── MainLayout (layout)
    └── SessionSummaryContainer (komponent React)
        ├── SummaryHeader
        ├── StatisticsDisplay
        │   ├── StatCard (wielokrotne użycie)
        │   └── CompletionProgressBar
        ├── SessionDurationDisplay
        └── ActionButtons
            └── BackToDashboardButton
```

## 4. Szczegóły komponentów

### LearningSessionSummaryPage
- **Opis komponentu**: Główna strona podsumowania sesji nauki, pobierająca dane podsumowania z parametrów URL i przekazująca je do komponentów React.
- **Główne elementy**: Komponent Astro zawierający `MainLayout` i inicjalizujący React w trybie klienta.
- **Obsługiwane interakcje**: Przetwarzanie danych sesji z URL i/lub stanu (zależnie od implementacji).
- **Obsługiwana walidacja**: Sprawdzenie, czy użytkownik jest zalogowany i czy istnieją dane podsumowania.
- **Typy**: Wykorzystuje typy zdefiniowane w `SessionSummaryDto` z `types.ts`.
- **Propsy**: Brak (komponent najwyższego poziomu).

### MainLayout
- **Opis komponentu**: Wspólny layout aplikacji zapewniający spójny interfejs użytkownika.
- **Główne elementy**: Nagłówek, obszar główny (main) i stopka.
- **Obsługiwane interakcje**: Nawigacja po aplikacji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Standardowe propsy layoutu.
- **Propsy**: `title: string`, `children: ReactNode`.

### SessionSummaryContainer
- **Opis komponentu**: Główny kontener React wyświetlający podsumowanie sesji nauki.
- **Główne elementy**: `SummaryHeader`, `StatisticsDisplay`, `SessionDurationDisplay`, `ActionButtons`.
- **Obsługiwane interakcje**: Przekazywanie danych do komponentów potomnych.
- **Obsługiwana walidacja**: Sprawdzenie kompletności danych sesji.
- **Typy**: `SessionSummaryViewModel`.
- **Propsy**: `sessionSummary: SessionSummaryViewModel`.

### SummaryHeader
- **Opis komponentu**: Nagłówek widoku podsumowania z tytułem i ewentualnie datą sesji.
- **Główne elementy**: Tytuł "Podsumowanie sesji nauki" i opcjonalnie data zakończenia sesji.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Opcjonalna data zakończenia sesji.
- **Propsy**: `endTime?: Date | string`.

### StatisticsDisplay
- **Opis komponentu**: Kontener wyświetlający główne statystyki sesji w formie kart.
- **Główne elementy**: Karty statystyk (`StatCard`) i pasek postępu (`CompletionProgressBar`).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Statystyki sesji z `SessionSummaryViewModel`.
- **Propsy**: 
  - `flashcardsReviewed: number`
  - `correctAnswers: number`
  - `incorrectAnswers: number`
  - `completionPercentage: number`

### StatCard
- **Opis komponentu**: Pojedyncza karta prezentująca określoną statystykę.
- **Główne elementy**: Ikona, wartość liczbowa i etykieta opisowa.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Proste typy dla propsów.
- **Propsy**: 
  - `icon: ReactNode`
  - `value: number`
  - `label: string`
  - `variant?: 'default' | 'success' | 'error'` (opcjonalnie)

### CompletionProgressBar
- **Opis komponentu**: Wizualny wskaźnik procentu ukończenia sesji.
- **Główne elementy**: Pasek postępu z etykietą procentową.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Prosty typ numeryczny.
- **Propsy**: `completionPercentage: number`.

### SessionDurationDisplay
- **Opis komponentu**: Komponent wyświetlający czas trwania sesji nauki.
- **Główne elementy**: Ikona zegara i sformatowany czas trwania (np. "5 minut 30 sekund").
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Prosty typ numeryczny.
- **Propsy**: `durationSeconds: number`.

### ActionButtons
- **Opis komponentu**: Kontener z przyciskami akcji dostępnymi po zakończeniu sesji.
- **Główne elementy**: `BackToDashboardButton` i potencjalnie inne przyciski akcji.
- **Obsługiwane interakcje**: Przekierowanie po kliknięciu przycisku.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Funkcja obsługi kliknięcia.
- **Propsy**: 
  - `onBackToDashboard: () => void` (opcjonalnie, jeśli używamy React Router)
  - `dashboardUrl: string` (opcjonalnie, jeśli używamy zwykłego linku)

### BackToDashboardButton
- **Opis komponentu**: Przycisk umożliwiający powrót do głównego panelu aplikacji.
- **Główne elementy**: Przycisk z tekstem i ikoną (opcjonalnie).
- **Obsługiwane interakcje**: Kliknięcie powodujące przekierowanie.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Funkcja obsługi kliknięcia lub URL.
- **Propsy**: 
  - `onClick?: () => void` (opcjonalnie, jeśli używamy React Router)
  - `href?: string` (opcjonalnie, jeśli używamy zwykłego linku)

## 5. Typy
```typescript
// Model widoku dla podsumowania sesji
export interface SessionSummaryViewModel {
  flashcardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionPercentage: number;
  durationSeconds: number;
  endTime?: Date | string;
}

// Mapper do konwersji DTO na ViewModel
export function mapSessionSummaryToViewModel(summaryDto: SessionSummaryDto): SessionSummaryViewModel {
  return {
    flashcardsReviewed: summaryDto.flashcards_reviewed,
    correctAnswers: summaryDto.correct_answers,
    incorrectAnswers: summaryDto.incorrect_answers,
    completionPercentage: summaryDto.completion_percentage,
    durationSeconds: summaryDto.duration_seconds,
    endTime: new Date()
  };
}

// Typy dla komponentów
export interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  variant?: 'default' | 'success' | 'error';
}

export interface CompletionProgressBarProps {
  completionPercentage: number;
}

export interface SessionDurationDisplayProps {
  durationSeconds: number;
}

export interface ActionButtonsProps {
  onBackToDashboard?: () => void;
  dashboardUrl?: string;
}

export interface BackToDashboardButtonProps {
  onClick?: () => void;
  href?: string;
}
```

## 6. Zarządzanie stanem

Dla tego widoku nie jest konieczne użycie zaawansowanego zarządzania stanem, ponieważ podsumowanie sesji opiera się głównie na wyświetlaniu statycznych danych otrzymanych z API lub przechowywanych w stanie aplikacji. Można użyć prostego podejścia z wykorzystaniem propsów.

Widok będzie otrzymywał dane sesji na dwa możliwe sposoby:
1. Z parametrów URL (session_id)
2. Z stanu przekazanego podczas nawigacji (w przypadku bezpośredniego przekierowania z widoku nauki)

```typescript
function useSummaryData(initialSummary?: SessionSummaryDto) {
  const [summaryData, setSummaryData] = useState<SessionSummaryViewModel | null>(
    initialSummary ? mapSessionSummaryToViewModel(initialSummary) : null
  );
  const [isLoading, setIsLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);
  
  // Jeśli nie mamy początkowych danych, próbujemy pobrać je z URL
  useEffect(() => {
    if (!initialSummary) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        fetchSessionSummary(sessionId);
      } else {
        setError('Brak identyfikatora sesji');
      }
    }
  }, [initialSummary]);
  
  async function fetchSessionSummary(sessionId: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/learning/sessions/${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać podsumowania sesji');
      }
      
      const data: { session_summary: SessionSummaryDto } = await response.json();
      setSummaryData(mapSessionSummaryToViewModel(data.session_summary));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  }
  
  return { summaryData, isLoading, error };
}
```

## 7. Integracja API

W przypadku gdy podsumowanie nie jest przekazane bezpośrednio do komponentu, będziemy musieli pobrać dane z API. Poniżej znajduje się przykład integracji z API dla tego widoku:

```typescript
// Funkcja pobierająca podsumowanie sesji
async function fetchSessionSummary(sessionId: string): Promise<SessionSummaryViewModel> {
  try {
    const response = await fetch(`/api/learning/sessions/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać podsumowania sesji');
    }
    
    const data: { session_summary: SessionSummaryDto } = await response.json();
    return mapSessionSummaryToViewModel(data.session_summary);
  } catch (error) {
    throw error;
  }
}
```

Możemy również wykorzystać podsumowanie z PUT request, który został już wykonany podczas zakończenia sesji:

```typescript
// Funkcja kończąca sesję nauki i pobierająca podsumowanie
async function endLearningSession(sessionId: string): Promise<SessionSummaryViewModel> {
  try {
    const response = await fetch(`/api/learning/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się zakończyć sesji nauki');
    }
    
    const data: EndLearningSessionResponseDto = await response.json();
    return mapSessionSummaryToViewModel(data.session_summary);
  } catch (error) {
    throw error;
  }
}
```

## 8. Interakcje użytkownika

Interakcje użytkownika w tym widoku są ograniczone, ponieważ jest to widok podsumowujący, który głównie prezentuje dane.

1. **Przeglądanie statystyk**: Użytkownik może przeglądać statystyki sesji, które są prezentowane w formie kart i pasków postępu.

2. **Powrót do panelu głównego**: Główną interakcją jest kliknięcie przycisku "Powrót do panelu", który przekierowuje użytkownika do głównego widoku aplikacji.

```typescript
function handleBackToDashboard() {
  // Opcja 1: Użycie React Router lub podobnej biblioteki
  navigate('/dashboard');
  
  // Opcja 2: Bezpośrednia nawigacja
  window.location.href = '/dashboard';
}
```

3. **Identyfikacja sesji przez URL**: Jeśli użytkownik odświeży stronę lub przejdzie do niej bezpośrednio przez URL, widok powinien odczytać parametr `session_id` z URL i na jego podstawie pobrać podsumowanie:

```typescript
// W komponencie lub hooku
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  fetchSessionSummary(sessionId);
}
```

## 9. Warunki i walidacja

Widok podsumowania sesji nauki wymaga stosunkowo niewielkiej walidacji, ponieważ głównie prezentuje dane. Jednak istnieje kilka warunków, które należy sprawdzić:

### Walidacja dostępu do widoku
- Użytkownik musi być zalogowany (obsługiwane przez middleware na poziomie Astro)
- Musi istnieć identyfikator sesji (w URL lub stanie aplikacji)

### Walidacja danych podsumowania
- Sprawdzenie, czy dane podsumowania są dostępne
- Obsługa przypadku, gdy dane są niekompletne

```typescript
// Przykład walidacji w komponencie
function SessionSummaryContainer({ sessionSummary }: { sessionSummary: SessionSummaryViewModel | null }) {
  // Sprawdzenie, czy dane są dostępne
  if (!sessionSummary) {
    return <div className="text-center py-8">Brak danych podsumowania sesji</div>;
  }
  
  // Walidacja wartości liczbowych
  const flashcardsReviewed = sessionSummary.flashcardsReviewed || 0;
  const correctAnswers = sessionSummary.correctAnswers || 0;
  const incorrectAnswers = sessionSummary.incorrectAnswers || 0;
  const completionPercentage = sessionSummary.completionPercentage || 0;
  const durationSeconds = sessionSummary.durationSeconds || 0;
  
  // Wyświetlenie danych
  return (
    <div>
      {/* Komponenty z danymi */}
    </div>
  );
}
```

## 10. Obsługa błędów

### Błąd pobierania danych
- Wyświetlenie komunikatu o błędzie, jeśli nie udało się pobrać podsumowania sesji
- Przycisk umożliwiający ponowną próbę

```tsx
function SessionSummaryContainer() {
  const { summaryData, isLoading, error } = useSummaryData();
  
  if (isLoading) {
    return <div className="text-center py-8">Ładowanie podsumowania sesji...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  
  // Renderowanie normalnego widoku, gdy dane są dostępne
  return (
    <div>
      {/* Komponenty podsumowania */}
    </div>
  );
}
```

### Brak identyfikatora sesji
- Informacja dla użytkownika, że brak identyfikatora sesji
- Przycisk powrotu do panelu głównego

```tsx
function SessionSummaryPage() {
  const sessionId = new URLSearchParams(window.location.search).get('session_id');
  
  if (!sessionId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Brak identyfikatora sesji</p>
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Powrót do panelu głównego
        </a>
      </div>
    );
  }
  
  // Renderowanie normalnego widoku, gdy identyfikator sesji jest dostępny
  return <SessionSummaryContainer sessionId={sessionId} />;
}
```

### Niepełne dane podsumowania
- Obsługa przypadku, gdy niektóre dane są niezdefiniowane
- Wyświetlenie wartości domyślnych (0) dla brakujących danych

## 11. Kroki implementacji

1. **Konfiguracja projektu**
   - Utworzenie pliku `src/pages/learning/summary.astro`
   - Utworzenie struktury folderów dla komponentów React

2. **Implementacja typów i funkcji pomocniczych**
   - Definicja modelu widoku `SessionSummaryViewModel`
   - Implementacja funkcji mappującej `mapSessionSummaryToViewModel`
   - Definicja typów dla komponentów

3. **Implementacja komponentów bazowych**
   - Tworzenie komponentów presentational (StatCard, CompletionProgressBar, SessionDurationDisplay)
   - Implementacja komponentu BackToDashboardButton

4. **Implementacja hooka do pobierania danych**
   - Utworzenie hooka `useSummaryData` do pobierania i obsługi danych podsumowania

5. **Implementacja głównych komponentów kontenera**
   - Implementacja SessionSummaryContainer
   - Implementacja StatisticsDisplay
   - Implementacja ActionButtons

6. **Integracja komponentów**
   - Połączenie wszystkich komponentów w SessionSummaryContainer
   - Integracja z danymi sesji

7. **Implementacja strony Astro**
   - Utworzenie strony `summary.astro`
   - Integracja z MainLayout
   - Dodanie obsługi parametrów URL

8. **Obsługa błędów i walidacji**
   - Dodanie obsługi błędów w hooku useSummaryData
   - Implementacja walidacji danych sesji

9. **Stylizacja komponentów**
   - Implementacja stylów Tailwind dla komponentów
   - Zapewnienie responsywności widoku

10. **Testowanie**
    - Testowanie różnych scenariuszy i przypadków granicznych
    - Zapewnienie poprawnego wyświetlania danych
    
11. **Integracja z nawigacją**
    - Zapewnienie poprawnego przekierowania z widoku nauki
    - Implementacja powrotu do panelu głównego

12. **Optymalizacja i finalizacja**
    - Refaktoryzacja kodu i optymalizacja wydajności
    - Sprawdzenie dostępności i responsywności widoku
</rewritten_file> 