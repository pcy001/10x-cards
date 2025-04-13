# Plan implementacji widoku Lista Fiszek

## 1. Przegląd
Widok Lista Fiszek to kluczowy element aplikacji 10xCards, umożliwiający użytkownikom przeglądanie ich istniejących fiszek edukacyjnych. Widok prezentuje listę wszystkich fiszek użytkownika z możliwością paginacji, sortowania oraz usuwania niepotrzebnych fiszek. Jest to podstawowy widok zarządzania zawartością w aplikacji, dający użytkownikowi pełen wgląd w jego materiały edukacyjne.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/flashcards` i zostanie zaimplementowany w pliku `src/pages/flashcards/index.astro`.

## 3. Struktura komponentów
```
FlashcardsListPage (strona)
└── MainLayout (layout)
    └── FlashcardsListContainer (komponent React)
        ├── FlashcardsHeader
        │   ├── SortControls
        │   └── CreateFlashcardButton (opcjonalnie)
        ├── FlashcardsList
        │   └── FlashcardItem (wielokrotne użycie)
        │       ├── FlashcardContent
        │       └── DeleteFlashcardButton
        ├── Pagination
        └── DeleteConfirmationModal
```

## 4. Szczegóły komponentów

### FlashcardsListPage
- **Opis komponentu**: Główna strona listy fiszek, obsługująca inicjalizację stanu i przekazanie go do komponentu React.
- **Główne elementy**: Komponent Astro zawierający `MainLayout` i inicjalizujący React w trybie klienta dla interaktywnych komponentów.
- **Obsługiwane interakcje**: Obsługa parametrów URL dla paginacji i sortowania.
- **Obsługiwana walidacja**: Sprawdzenie, czy użytkownik jest zalogowany (przekierowanie do logowania, jeśli nie).
- **Typy**: Wykorzystuje typy zdefiniowane w `types.ts` dla fiszek i parametrów zapytania.
- **Propsy**: Brak (komponent najwyższego poziomu).

### MainLayout
- **Opis komponentu**: Wspólny layout aplikacji zapewniający spójny interfejs użytkownika.
- **Główne elementy**: Nagłówek, obszar główny (main) i stopka.
- **Obsługiwane interakcje**: Nawigacja po aplikacji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Standardowe propsy layoutu.
- **Propsy**: `title: string`, `children: ReactNode`.

### FlashcardsListContainer
- **Opis komponentu**: Główny kontener React zarządzający stanem listy fiszek i koordynujący pozostałe komponenty.
- **Główne elementy**: `FlashcardsHeader`, `FlashcardsList`, `Pagination`, `DeleteConfirmationModal`.
- **Obsługiwane interakcje**: 
  - Pobieranie listy fiszek
  - Zarządzanie paginacją
  - Zarządzanie sortowaniem
  - Inicjowanie usuwania fiszek
- **Obsługiwana walidacja**: Sprawdzenie, czy udało się pobrać dane.
- **Typy**: `FlashcardsListState`, `FlashcardViewModel`.
- **Propsy**: 
  - `initialPage?: number`
  - `initialPerPage?: number`
  - `initialSortBy?: string`
  - `initialSortDir?: string`

### FlashcardsHeader
- **Opis komponentu**: Nagłówek widoku listy fiszek zawierający kontrolki sortowania i opcjonalnie przycisk tworzenia nowej fiszki.
- **Główne elementy**: Tytuł sekcji, `SortControls`, opcjonalnie `CreateFlashcardButton`.
- **Obsługiwane interakcje**: Przekazywanie zmian sortowania do komponentu nadrzędnego.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Typy dla kontrolek sortowania.
- **Propsy**:
  - `onSortChange: (sortBy: string, sortDir: string) => void`
  - `sortBy: string`
  - `sortDir: string`

### SortControls
- **Opis komponentu**: Kontrolki umożliwiające sortowanie listy fiszek.
- **Główne elementy**: Dropdown z opcjami sortowania, przycisk zmiany kierunku sortowania.
- **Obsługiwane interakcje**: Zmiana opcji sortowania, zmiana kierunku sortowania.
- **Obsługiwana walidacja**: Ograniczenie opcji sortowania do dozwolonych wartości.
- **Typy**: Proste typy dla propsów.
- **Propsy**:
  - `onSortChange: (sortBy: string, sortDir: string) => void`
  - `sortBy: string`
  - `sortDir: string`

### FlashcardsList
- **Opis komponentu**: Lista fiszek z możliwością ich przeglądania i usuwania.
- **Główne elementy**: Kontener listy, elementy `FlashcardItem`.
- **Obsługiwane interakcje**: Renderowanie listy fiszek, przekazywanie akcji usuwania.
- **Obsługiwana walidacja**: Obsługa stanu pustej listy.
- **Typy**: `FlashcardViewModel[]`.
- **Propsy**:
  - `flashcards: FlashcardViewModel[]`
  - `onDeleteFlashcard: (id: string) => void`
  - `isLoading: boolean`

### FlashcardItem
- **Opis komponentu**: Pojedynczy element listy reprezentujący fiszkę.
- **Główne elementy**: `FlashcardContent` (przód i tył fiszki), `DeleteFlashcardButton`.
- **Obsługiwane interakcje**: Inicjowanie usuwania fiszki.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardViewModel`.
- **Propsy**:
  - `flashcard: FlashcardViewModel`
  - `onDelete: () => void`

### FlashcardContent
- **Opis komponentu**: Komponent wyświetlający zawartość fiszki (przód i tył).
- **Główne elementy**: Dwa pola tekstowe (przód i tył fiszki).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Obsługa długiego tekstu.
- **Typy**: Fragmenty danych z `FlashcardViewModel`.
- **Propsy**:
  - `frontContent: string`
  - `backContent: string`
  - `isAiGenerated: boolean` (opcjonalnie, do oznaczenia fiszek wygenerowanych przez AI)

### DeleteFlashcardButton
- **Opis komponentu**: Przycisk umożliwiający usunięcie fiszki.
- **Główne elementy**: Przycisk z ikoną kosza.
- **Obsługiwane interakcje**: Kliknięcie inicjujące potwierdzenie usunięcia.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Funkcja obsługi kliknięcia.
- **Propsy**:
  - `onClick: () => void`

### Pagination
- **Opis komponentu**: Komponent paginacji umożliwiający nawigację między stronami listy fiszek.
- **Główne elementy**: Przyciski poprzedniej/następnej strony, wskaźnik aktualnej strony, dropdown z liczbą elementów na stronę.
- **Obsługiwane interakcje**: Zmiana strony, zmiana liczby elementów na stronę.
- **Obsługiwana walidacja**: Dezaktywacja przycisków dla pierwszej/ostatniej strony.
- **Typy**: Metadane paginacji.
- **Propsy**:
  - `currentPage: number`
  - `totalPages: number`
  - `perPage: number`
  - `onPageChange: (page: number) => void`
  - `onPerPageChange: (perPage: number) => void`

### DeleteConfirmationModal
- **Opis komponentu**: Modal potwierdzenia usunięcia fiszki.
- **Główne elementy**: Tło modalu, okno dialogowe, przyciski potwierdzenia i anulowania.
- **Obsługiwane interakcje**: Potwierdzenie lub anulowanie usunięcia fiszki.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Identyfikator fiszki do usunięcia, funkcje obsługi akcji.
- **Propsy**:
  - `isOpen: boolean`
  - `flashcardId: string | null`
  - `onConfirm: () => void`
  - `onCancel: () => void`

## 5. Typy
```typescript
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

// Stan komponentu listy fiszek
export interface FlashcardsListState {
  flashcards: FlashcardViewModel[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
  sortBy: 'created_at' | 'correct_answers_count';
  sortDir: 'asc' | 'desc';
  flashcardToDelete: string | null;
  isDeleteModalOpen: boolean;
}

// Mapper DTO na ViewModel
export function mapFlashcardToViewModel(dto: FlashcardResponseDto): FlashcardViewModel {
  return {
    id: dto.id,
    frontContent: dto.front_content,
    backContent: dto.back_content,
    isAiGenerated: dto.is_ai_generated,
    createdAt: new Date(dto.created_at),
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
```

## 6. Zarządzanie stanem

Dla tego widoku będziemy używać hooka `useFlashcardsList` do zarządzania stanem listy fiszek, paginacją, sortowaniem oraz procesem usuwania.

```typescript
function useFlashcardsList(initialParams: Partial<FlashcardsQueryParams> = {}) {
  const [state, setState] = useState<FlashcardsListState>({
    flashcards: [],
    isLoading: true,
    error: null,
    pagination: {
      currentPage: initialParams.page || 1,
      totalPages: 0,
      totalItems: 0,
      perPage: initialParams.perPage || 20
    },
    sortBy: initialParams.sortBy || 'created_at',
    sortDir: initialParams.sortDir || 'desc',
    flashcardToDelete: null,
    isDeleteModalOpen: false
  });

  // Funkcja do pobierania fiszek z API
  const fetchFlashcards = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, pagination } = await getFlashcards({
        page: state.pagination.currentPage,
        perPage: state.pagination.perPage,
        sortBy: state.sortBy,
        sortDir: state.sortDir
      });
      
      setState(prev => ({
        ...prev,
        flashcards: data.map(mapFlashcardToViewModel),
        pagination: {
          currentPage: pagination.current_page,
          totalPages: pagination.pages,
          totalItems: pagination.total,
          perPage: pagination.per_page
        },
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Nie udało się pobrać fiszek',
        isLoading: false
      }));
    }
  }, [state.pagination.currentPage, state.pagination.perPage, state.sortBy, state.sortDir]);

  // Efekt do pobierania fiszek przy zmianie parametrów
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Funkcje do zarządzania paginacją
  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page }
    }));
  };

  const handlePerPageChange = (perPage: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, perPage, currentPage: 1 }
    }));
  };

  // Funkcje do zarządzania sortowaniem
  const handleSortChange = (sortBy: string, sortDir: string) => {
    setState(prev => ({
      ...prev,
      sortBy: sortBy as 'created_at' | 'correct_answers_count',
      sortDir: sortDir as 'asc' | 'desc',
      pagination: { ...prev.pagination, currentPage: 1 }
    }));
  };

  // Funkcje do zarządzania usuwaniem fiszek
  const handleDeleteInitiate = (id: string) => {
    setState(prev => ({
      ...prev,
      flashcardToDelete: id,
      isDeleteModalOpen: true
    }));
  };

  const handleDeleteConfirm = async () => {
    if (!state.flashcardToDelete) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteFlashcard(state.flashcardToDelete);
      
      setState(prev => ({
        ...prev,
        flashcards: prev.flashcards.filter(f => f.id !== prev.flashcardToDelete),
        flashcardToDelete: null,
        isDeleteModalOpen: false,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Nie udało się usunąć fiszki',
        isLoading: false
      }));
    }
  };

  const handleDeleteCancel = () => {
    setState(prev => ({
      ...prev,
      flashcardToDelete: null,
      isDeleteModalOpen: false
    }));
  };

  return {
    state,
    handlePageChange,
    handlePerPageChange,
    handleSortChange,
    handleDeleteInitiate,
    handleDeleteConfirm,
    handleDeleteCancel,
    refreshList: fetchFlashcards
  };
}
```

## 7. Integracja API

Widok "Lista Fiszek" integruje się z API poprzez następujące funkcje:

```typescript
// Funkcja pobierająca listę fiszek
async function getFlashcards(params: FlashcardsQueryParams): Promise<FlashcardsResponseDto> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    per_page: params.perPage.toString(),
    sort_by: params.sortBy,
    sort_dir: params.sortDir
  });
  
  try {
    const response = await fetch(`/api/flashcards?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać listy fiszek');
    }
    
    const data: FlashcardsResponseDto = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Funkcja usuwająca fiszkę
async function deleteFlashcard(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się usunąć fiszki');
    }
  } catch (error) {
    throw error;
  }
}
```

## 8. Interakcje użytkownika

### Przeglądanie listy fiszek
Użytkownik może przeglądać listę swoich fiszek, która prezentuje zarówno przednią jak i tylną zawartość każdej fiszki. Lista jest paginowana, a użytkownik może przechodzić między stronami.

### Sortowanie fiszek
Użytkownik może sortować fiszki według:
- Daty utworzenia (`created_at`)
- Liczby poprawnych odpowiedzi (`correct_answers_count`)

Dla każdego kryterium można wybrać kierunek sortowania (rosnąco/malejąco).

### Usuwanie fiszek
1. Użytkownik klika przycisk usuwania przy wybranej fiszce
2. Pojawia się modal z prośbą o potwierdzenie operacji
3. Użytkownik potwierdza lub anuluje usunięcie
4. W przypadku potwierdzenia, fiszka zostaje usunięta z systemu i znika z listy

### Nawigacja po stronach
Użytkownik może:
- Przejść do poprzedniej/następnej strony
- Przejść do konkretnej strony (jeśli zaimplementowany jest numerowany paginator)
- Zmienić liczbę fiszek wyświetlanych na stronie (np. 10, 20, 50, 100)

## 9. Warunki i walidacja

### Dostępność widoku
- Widok dostępny tylko dla zalogowanych użytkowników
- Przekierowanie do strony logowania, jeśli użytkownik nie jest zalogowany

### Paginacja
- Przyciski poprzedniej strony są wyłączone na pierwszej stronie
- Przyciski następnej strony są wyłączone na ostatniej stronie
- Liczba elementów na stronę jest ograniczona do maksymalnie 100

### Sortowanie
- Dostępne tylko dwa kryteria sortowania: "created_at" i "correct_answers_count"
- Dostępne tylko dwa kierunki sortowania: "asc" i "desc"

### Usuwanie fiszek
- Potwierdzenie przed usunięciem fiszki
- Usunięcie możliwe tylko dla własnych fiszek użytkownika

## 10. Obsługa błędów

### Błąd pobierania danych
- Wyświetlenie komunikatu o błędzie
- Przycisk umożliwiający ponowną próbę pobrania danych

```tsx
{state.error && (
  <div className="text-center py-8">
    <p className="text-red-500 mb-4">{state.error}</p>
    <Button onClick={refreshList}>Spróbuj ponownie</Button>
  </div>
)}
```

### Brak fiszek
- Wyświetlenie informacji o braku fiszek
- Opcjonalny przycisk do przejścia do widoku tworzenia nowych fiszek

```tsx
{!state.isLoading && state.flashcards.length === 0 && !state.error && (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych fiszek</p>
    <Button asChild>
      <a href="/flashcards/create">Utwórz pierwszą fiszkę</a>
    </Button>
  </div>
)}
```

### Błąd usuwania fiszki
- Wyświetlenie komunikatu o błędzie w modalu
- Możliwość ponownej próby lub anulowania operacji

```tsx
{deleteError && (
  <p className="text-red-500 mb-4">{deleteError}</p>
)}
```

### Utrata połączenia
- Obsługa błędów sieciowych
- Automatyczne ponowienie próby pobrania danych po przywróceniu połączenia

## 11. Kroki implementacji

1. **Konfiguracja projektu**
   - Utworzenie pliku `src/pages/flashcards/index.astro`
   - Utworzenie struktury folderów dla komponentów React

2. **Implementacja typów i funkcji pomocniczych**
   - Definicja modelu widoku `FlashcardViewModel`
   - Implementacja funkcji mappującej `mapFlashcardToViewModel`
   - Definicja typów dla komponentów

3. **Implementacja funkcji API**
   - Utworzenie funkcji `getFlashcards` do pobierania listy fiszek
   - Utworzenie funkcji `deleteFlashcard` do usuwania fiszek

4. **Implementacja hooka stanu**
   - Stworzenie hooka `useFlashcardsList` zarządzającego stanem widoku

5. **Implementacja komponentów bazowych**
   - Tworzenie drobnych komponentów UI (FlashcardContent, DeleteFlashcardButton)
   - Implementacja komponentu DeleteConfirmationModal

6. **Implementacja komponentów paginacji i sortowania**
   - Utworzenie komponentu Pagination
   - Utworzenie komponentu SortControls

7. **Implementacja komponentów listy**
   - Utworzenie komponentu FlashcardItem
   - Implementacja komponentu FlashcardsList

8. **Implementacja głównego kontenera**
   - Stworzenie FlashcardsListContainer integrującego wszystkie komponenty

9. **Implementacja strony Astro**
   - Dodanie MainLayout do strony
   - Inicjalizacja komponentu React z parametrami z URL

10. **Stylizacja komponentów**
    - Zastosowanie stylów Tailwind do wszystkich komponentów
    - Zapewnienie responsywności widoku

11. **Obsługa błędów i stanów pustych**
    - Dodanie obsługi błędów do wszystkich komponentów
    - Implementacja widoku dla pustej listy fiszek

12. **Testowanie**
    - Testowanie paginacji, sortowania i usuwania fiszek
    - Sprawdzenie obsługi błędów i przypadków brzegowych

13. **Optymalizacja wydajności**
    - Zastosowanie memoizacji dla komponentów listy
    - Optymalizacja renderowania przy zmianach stanu
``` 