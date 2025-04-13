# Plan implementacji widoku Generatora Fiszek

## 1. Przegląd
Generator Fiszek jest kluczowym widokiem aplikacji 10xCards, który umożliwia użytkownikom generowanie fiszek edukacyjnych przy pomocy sztucznej inteligencji. Użytkownik wprowadza tekst źródłowy, wybiera język docelowy i otrzymuje wygenerowane fiszki, które może następnie przejrzeć i wybrać te, które chce zapisać do swojej kolekcji. Jest to główna funkcjonalność aplikacji, która realizuje jej podstawowy cel - szybkie tworzenie fiszek edukacyjnych bez konieczności ręcznego ich przygotowywania.

## 2. Routing widoku
- **Ścieżka**: `/flashcards/generate`
- **Komponent strony**: `src/pages/flashcards/generate.astro`
- **Ochrona routingu**: Wymagane uwierzytelnienie (użycie middleware Astro)

## 3. Struktura komponentów
```
GeneratorPage (Astro Page)
├── MainLayout
│   ├── NavBar
│   └── MainContent
│       ├── GeneratorForm
│       │   ├── SourceTextArea
│       │   ├── LanguageSelector
│       │   ├── GenerateButton
│       │   └── GenerationOptions (opcjonalnie)
│       ├── GenerationStatus
│       │   └── LoadingIndicator
│       └── GeneratedFlashcardsList
│           ├── FlashcardPreviewItem
│           │   ├── FlashcardContent
│           │   └── SelectionCheckbox
│           ├── SelectionControls
│           └── SaveSelectedButton
```

## 4. Szczegóły komponentów

### MainLayout
- **Opis komponentu**: Główny układ strony, zawierający nagłówek z nawigacją i obszar treści. Jest to komponent współdzielony między różnymi widokami aplikacji.
- **Główne elementy**:
  - Komponent `NavBar` z logo, nawigacją i menu użytkownika
  - Kontener `MainContent` z elastycznym układem dla treści strony
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, służy jako kontener.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**:
  - `title: string` - tytuł strony
  - `children: ReactNode` - zawartość strony

### GeneratorForm
- **Opis komponentu**: Formularz zawierający pola do wprowadzenia tekstu źródłowego, wyboru języka i opcji generowania.
- **Główne elementy**:
  - Komponent `SourceTextArea` - obszar tekstowy do wprowadzenia tekstu źródłowego
  - Komponent `LanguageSelector` - lista rozwijana do wyboru języka docelowego
  - Komponent `GenerateButton` - przycisk uruchamiający generowanie fiszek
  - Opcjonalnie: `GenerationOptions` - dodatkowe opcje generowania (typ generacji, poziom trudności)
- **Obsługiwane interakcje**:
  - Wprowadzanie tekstu i aktualizacja stanu formularza
  - Wybór języka docelowego z listy
  - Kliknięcie przycisku generowania
- **Obsługiwana walidacja**:
  - Sprawdzanie limitu znaków tekstu źródłowego (max 10 000)
  - Weryfikacja, czy tekst źródłowy nie jest pusty
  - Weryfikacja, czy wybrano język docelowy
- **Typy**:
  - `GeneratorFormData`
  - `GenerateFlashcardsDto`
- **Propsy**:
  - `onSubmit: (data: GeneratorFormData) => Promise<void>` - funkcja wywoływana po kliknięciu przycisku generowania
  - `isGenerating: boolean` - flaga wskazująca, czy trwa generowanie
  - `disabled: boolean` - flaga wyłączająca formularz (np. podczas generowania)

### SourceTextArea
- **Opis komponentu**: Komponent obszaru tekstowego z licznikiem znaków.
- **Główne elementy**:
  - Pole tekstowe `<textarea>` do wprowadzania tekstu źródłowego
  - Licznik znaków pokazujący wykorzystane/dostępne znaki
- **Obsługiwane interakcje**:
  - Wprowadzanie i edycja tekstu
  - Aktualizacja licznika znaków podczas pisania
- **Obsługiwana walidacja**:
  - Weryfikacja limitu 10 000 znaków
  - Wizualne oznaczenie przekroczenia limitu
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**:
  - `value: string` - bieżąca wartość pola
  - `onChange: (value: string) => void` - funkcja wywoływana przy zmianie tekstu
  - `disabled: boolean` - flaga wyłączająca pole
  - `placeholder: string` - placeholdery dla pola
  - `maxLength: number` - maksymalna ilość znaków (domyślnie 10 000)

### LanguageSelector
- **Opis komponentu**: Lista rozwijana z dostępnymi językami docelowymi.
- **Główne elementy**:
  - Komponent `<Select>` z Shadcn/ui
  - Lista dostępnych języków z kodami ISO
- **Obsługiwane interakcje**:
  - Rozwijanie/zwijanie listy
  - Wybór języka z listy
- **Obsługiwana walidacja**:
  - Weryfikacja, czy wybrano język
- **Typy**:
  - `LanguageOption`
- **Propsy**:
  - `value: string` - bieżąca wartość (kod języka)
  - `onChange: (value: string) => void` - funkcja wywoływana przy zmianie języka
  - `disabled: boolean` - flaga wyłączająca pole
  - `languages: LanguageOption[]` - lista dostępnych języków

### GenerateButton
- **Opis komponentu**: Przycisk uruchamiający proces generowania fiszek.
- **Główne elementy**:
  - Komponent `<Button>` z Shadcn/ui
  - Ewentualnie ikona (np. magiczna różdżka)
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**:
  - `onClick: () => void` - funkcja wywoływana po kliknięciu
  - `disabled: boolean` - flaga wyłączająca przycisk
  - `isLoading: boolean` - flaga pokazująca stan ładowania

### GenerationStatus
- **Opis komponentu**: Komponent pokazujący status procesu generowania.
- **Główne elementy**:
  - Komponent `LoadingIndicator` - wskaźnik ładowania
  - Informacja tekstowa o aktualnym statusie
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**:
  - `GenerationStatusType` - enum statusów (idle, generating, success, error)
- **Propsy**:
  - `status: GenerationStatusType` - aktualny status generowania
  - `message?: string` - opcjonalny komunikat statusu

### GeneratedFlashcardsList
- **Opis komponentu**: Lista wygenerowanych fiszek z możliwością zaznaczenia wybranych.
- **Główne elementy**:
  - Lista komponentów `FlashcardPreviewItem` dla każdej fiszki
  - Komponent `SelectionControls` - przyciski "Zaznacz wszystkie" / "Odznacz wszystkie"
  - Komponent `SaveSelectedButton` - przycisk zapisujący wybrane fiszki
- **Obsługiwane interakcje**:
  - Zaznaczanie/odznaczanie pojedynczych fiszek
  - Zaznaczanie/odznaczanie wszystkich fiszek
  - Zapisywanie wybranych fiszek
- **Obsługiwana walidacja**:
  - Weryfikacja, czy zaznaczono co najmniej jedną fiszkę
- **Typy**:
  - `GeneratedFlashcardDto`
  - `FlashcardSelection`
- **Propsy**:
  - `flashcards: GeneratedFlashcardDto[]` - lista wygenerowanych fiszek
  - `onSaveSelected: (selectedIds: string[]) => Promise<void>` - funkcja zapisująca wybrane fiszki
  - `isSaving: boolean` - flaga wskazująca na trwający proces zapisywania

### FlashcardPreviewItem
- **Opis komponentu**: Pojedynczy element listy fiszek z możliwością zaznaczenia.
- **Główne elementy**:
  - Komponent `FlashcardContent` - treść fiszki (przód/tył)
  - Komponent `SelectionCheckbox` - checkbox do zaznaczenia fiszki
- **Obsługiwane interakcje**:
  - Zaznaczanie/odznaczanie fiszki
  - Opcjonalnie: rozwijanie/zwijanie szczegółów fiszki
- **Obsługiwana walidacja**: Brak.
- **Typy**:
  - `GeneratedFlashcardDto`
- **Propsy**:
  - `flashcard: GeneratedFlashcardDto` - dane fiszki
  - `isSelected: boolean` - czy fiszka jest zaznaczona
  - `onSelectionChange: (id: string, selected: boolean) => void` - funkcja zmiany zaznaczenia

### FlashcardContent
- **Opis komponentu**: Komponent wyświetlający treść fiszki (przód i tył).
- **Główne elementy**:
  - Sekcja "Przód" z treścią przedniej strony fiszki
  - Sekcja "Tył" z treścią tylnej strony fiszki
  - Opcjonalnie: dodatkowe informacje (kontekst, trudność)
- **Obsługiwane interakcje**:
  - Opcjonalnie: rozwijanie/zwijanie zawartości
- **Obsługiwana walidacja**: Brak.
- **Typy**:
  - `GeneratedFlashcardDto`
- **Propsy**:
  - `flashcard: GeneratedFlashcardDto` - dane fiszki
  - `expanded?: boolean` - czy treść jest rozwinięta

### SelectionControls
- **Opis komponentu**: Przyciski do zbiorczego zaznaczania/odznaczania fiszek.
- **Główne elementy**:
  - Przycisk "Zaznacz wszystkie"
  - Przycisk "Odznacz wszystkie"
  - Informacja o liczbie zaznaczonych fiszek
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku "Zaznacz wszystkie"
  - Kliknięcie przycisku "Odznacz wszystkie"
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**:
  - `onSelectAll: () => void` - funkcja zaznaczająca wszystkie fiszki
  - `onDeselectAll: () => void` - funkcja odznaczająca wszystkie fiszki
  - `selectedCount: number` - liczba zaznaczonych fiszek
  - `totalCount: number` - całkowita liczba fiszek

### SaveSelectedButton
- **Opis komponentu**: Przycisk zapisujący wybrane fiszki do kolekcji użytkownika.
- **Główne elementy**:
  - Komponent `<Button>` z Shadcn/ui
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku
- **Obsługiwana walidacja**:
  - Weryfikacja, czy zaznaczono co najmniej jedną fiszkę
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**:
  - `onClick: () => void` - funkcja wywoływana po kliknięciu
  - `disabled: boolean` - flaga wyłączająca przycisk
  - `isLoading: boolean` - flaga pokazująca stan ładowania
  - `selectedCount: number` - liczba zaznaczonych fiszek

## 5. Typy
Poniżej znajdują się typy niezbędne do implementacji widoku:

```typescript
// Typy istniejące w aplikacji (z src/types.ts)
import type {
  GenerateFlashcardsDto,
  GeneratedFlashcardDto,
  GenerateFlashcardsResponseDto,
  FlashcardToAcceptDto,
  AcceptFlashcardsDto,
  AcceptFlashcardsResponseDto,
  AcceptedFlashcardDto
} from "../types";

// Nowe typy dla komponentów widoku
export interface LanguageOption {
  value: string; // kod ISO języka
  label: string; // nazwa języka do wyświetlenia
}

export enum GenerationStatusType {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface GeneratorFormData {
  sourceText: string;
  targetLanguage: string;
  generationType?: 'vocabulary' | 'phrases' | 'definitions';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
}

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
```

## 6. Zarządzanie stanem
Do zarządzania stanem w komponencie zostanie wykorzystany customowy hook `useFlashcardGenerator`:

```typescript
function useFlashcardGenerator() {
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
    languages: [
      { value: 'en', label: 'Angielski' },
      { value: 'pl', label: 'Polski' },
      { value: 'es', label: 'Hiszpański' },
      { value: 'de', label: 'Niemiecki' },
      { value: 'fr', label: 'Francuski' },
      // Więcej języków...
    ]
  });

  const navigate = useNavigate();

  // Aktualizacja pola formularza
  const updateFormField = (field: keyof GeneratorFormData, value: any) => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value
      }
    }));
  };

  // Generowanie fiszek
  const generateFlashcards = async () => {
    try {
      setState(prev => ({
        ...prev,
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

      setState(prev => ({
        ...prev,
        generatedFlashcards: data.flashcards,
        selectedFlashcards: selection,
        generationStatus: {
          status: GenerationStatusType.SUCCESS,
          message: `Wygenerowano ${data.flashcards.length} fiszek`
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        generationStatus: {
          status: GenerationStatusType.ERROR,
          message: error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
        }
      }));
    }
  };

  // Zmiana zaznaczenia fiszki
  const toggleFlashcardSelection = (id: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedFlashcards: {
        ...prev.selectedFlashcards,
        [id]: selected
      }
    }));
  };

  // Zaznaczenie wszystkich fiszek
  const selectAllFlashcards = () => {
    const selection: FlashcardSelection = {};
    state.generatedFlashcards.forEach(flashcard => {
      selection[flashcard.temp_id] = true;
    });
    setState(prev => ({
      ...prev,
      selectedFlashcards: selection
    }));
  };

  // Odznaczenie wszystkich fiszek
  const deselectAllFlashcards = () => {
    const selection: FlashcardSelection = {};
    state.generatedFlashcards.forEach(flashcard => {
      selection[flashcard.temp_id] = false;
    });
    setState(prev => ({
      ...prev,
      selectedFlashcards: selection
    }));
  };

  // Zapisanie wybranych fiszek
  const saveSelectedFlashcards = async () => {
    try {
      setState(prev => ({
        ...prev,
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

      // Przekierowanie do listy fiszek lub dashboardu
      navigate('/flashcards');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        generationStatus: {
          status: GenerationStatusType.ERROR,
          message: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania fiszek'
        }
      }));
    }
  };

  const selectedCount = Object.values(state.selectedFlashcards).filter(Boolean).length;

  return {
    state,
    updateFormField,
    generateFlashcards,
    toggleFlashcardSelection,
    selectAllFlashcards,
    deselectAllFlashcards,
    saveSelectedFlashcards,
    selectedCount
  };
}
```

## 7. Integracja API
Widok integruje się z dwoma endpointami API:

### Generowanie fiszek (`POST /api/flashcards/generate`)
- **Żądanie**:
  ```typescript
  {
    source_text: string; // Ograniczone do 10 000 znaków
    target_language: string; // Kod ISO języka docelowego
    generation_type?: 'vocabulary' | 'phrases' | 'definitions'; // Opcjonalnie
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced'; // Opcjonalnie
    limit?: number; // Opcjonalnie
  }
  ```
- **Odpowiedź**:
  ```typescript
  {
    detected_source_language: string; // Wykryty język tekstu źródłowego
    flashcards: Array<{
      temp_id: string;
      front_content: string;
      back_content: string;
      context?: string; // Opcjonalnie
      difficulty?: string; // Opcjonalnie
    }>;
  }
  ```
- **Obsługa błędów**:
  - 400 Bad Request - nieprawidłowe dane wejściowe
  - 401 Unauthorized - brak autoryzacji
  - 413 Payload Too Large - tekst źródłowy zbyt długi

### Zapisywanie fiszek (`POST /api/flashcards/accept`)
- **Żądanie**:
  ```typescript
  {
    flashcards: Array<{
      front_content: string;
      back_content: string;
      is_ai_generated: boolean;
    }>;
  }
  ```
- **Odpowiedź**:
  ```typescript
  {
    accepted_count: number;
    flashcards: Array<{
      id: string;
      front_content: string;
      back_content: string;
      is_ai_generated: boolean;
      created_at: string;
    }>;
  }
  ```
- **Obsługa błędów**:
  - 400 Bad Request - nieprawidłowe dane
  - 401 Unauthorized - brak autoryzacji

## 8. Interakcje użytkownika
1. **Wprowadzanie tekstu źródłowego**:
   - Użytkownik wkleja tekst źródłowy do pola tekstowego
   - System na bieżąco aktualizuje licznik znaków
   - Jeśli tekst przekracza limit 10 000 znaków, system wizualnie sygnalizuje błąd

2. **Wybór języka docelowego**:
   - Użytkownik klika na listę rozwijaną
   - Wyświetlana jest lista dostępnych języków
   - Użytkownik wybiera język docelowy klikając na odpowiednią opcję

3. **Generowanie fiszek**:
   - Użytkownik klika przycisk "Generuj"
   - System wyświetla wskaźnik ładowania i zmienia stan przycisku
   - Po zakończeniu generowania, wyświetlana jest lista wygenerowanych fiszek

4. **Przeglądanie wygenerowanych fiszek**:
   - Użytkownik przegląda listę wygenerowanych fiszek
   - Każda fiszka pokazuje przód i tył
   - Opcjonalnie: użytkownik może rozwijać/zwijać szczegóły fiszki

5. **Zaznaczanie/odznaczanie fiszek**:
   - Użytkownik klika checkbox przy fiszce, aby ją zaznaczyć/odznaczyć
   - Użytkownik może wykorzystać przyciski "Zaznacz wszystkie" / "Odznacz wszystkie"
   - System aktualizuje liczbę zaznaczonych fiszek

6. **Zapisywanie wybranych fiszek**:
   - Użytkownik klika przycisk "Zapisz wybrane"
   - System wyświetla wskaźnik ładowania i wyłącza przycisk
   - Po pomyślnym zapisie, użytkownik jest przekierowywany do listy fiszek

## 9. Warunki i walidacja
1. **Walidacja tekstu źródłowego**:
   - Tekst nie może być pusty
   - Tekst nie może przekraczać 10 000 znaków
   - Komponent: `SourceTextArea`
   - Efekt: wyłączenie przycisku "Generuj" lub wyświetlenie błędu

2. **Walidacja języka docelowego**:
   - Język docelowy musi być wybrany
   - Komponent: `LanguageSelector`
   - Efekt: wyłączenie przycisku "Generuj" lub wyświetlenie błędu

3. **Walidacja formularza**:
   - Formularz jest poprawny, gdy wszystkie pola są wypełnione zgodnie z wymogami
   - Komponent: `GeneratorForm`
   - Efekt: włączenie/wyłączenie przycisku "Generuj"

4. **Walidacja zaznaczenia fiszek**:
   - Przynajmniej jedna fiszka musi być zaznaczona, aby zapisać
   - Komponent: `SaveSelectedButton`
   - Efekt: włączenie/wyłączenie przycisku "Zapisz wybrane"

## 10. Obsługa błędów
1. **Błędy podczas generowania fiszek**:
   - Wyświetlenie komunikatu o błędzie w komponencie `GenerationStatus`
   - Możliwość ponowienia próby generowania
   - Obsługiwane błędy:
     - Błąd sieci: sugestia sprawdzenia połączenia
     - Tekst zbyt długi: sugestia skrócenia tekstu
     - Brak autoryzacji: przekierowanie do logowania
     - Błąd serwera: sugestia spróbowania później

2. **Błędy podczas zapisywania fiszek**:
   - Wyświetlenie komunikatu o błędzie poniżej przycisku "Zapisz wybrane"
   - Możliwość ponowienia próby zapisania
   - Obsługiwane błędy:
     - Błąd sieci: sugestia sprawdzenia połączenia
     - Brak autoryzacji: przekierowanie do logowania
     - Błąd walidacji: sugestia poprawienia danych
     - Błąd serwera: sugestia spróbowania później

3. **Zabezpieczenie przed utratą danych**:
   - Dodanie potwierdzenia przed opuszczeniem strony, gdy są wygenerowane fiszki
   - Implementacja mechanizmu zapobiegającego przypadkowemu odświeżeniu strony

4. **Obsługa pustej odpowiedzi z API**:
   - Wyświetlenie informacji, gdy API nie wygenerowało żadnych fiszek
   - Sugestia zmiany tekstu źródłowego lub języka docelowego

## 11. Kroki implementacji
1. **Przygotowanie podstawowych plików**:
   - Utworzenie pliku strony `src/pages/flashcards/generate.astro`
   - Utworzenie pliku komponentu klienta React `src/components/flashcards/generator/FlashcardGenerator.tsx`
   - Zdefiniowanie typów w `src/components/flashcards/generator/types.ts`

2. **Implementacja komponentów UI**:
   - Utworzenie komponentu `SourceTextArea`
   - Utworzenie komponentu `LanguageSelector`
   - Utworzenie komponentu `GenerateButton`
   - Utworzenie komponentu `GenerationStatus`
   - Utworzenie komponentu `FlashcardPreviewItem`
   - Utworzenie komponentu `SelectionControls`
   - Utworzenie komponentu `SaveSelectedButton`

3. **Implementacja zarządzania stanem**:
   - Utworzenie hooka `useFlashcardGenerator`
   - Implementacja logiki formularza i walidacji
   - Implementacja logiki generowania fiszek
   - Implementacja logiki zarządzania zaznaczonymi fiszkami
   - Implementacja logiki zapisywania fiszek

4. **Integracja z API**:
   - Implementacja wywołania API do generowania fiszek
   - Implementacja wywołania API do zapisywania fiszek

5. **Implementacja obsługi błędów**:
   - Obsługa błędów podczas generowania
   - Obsługa błędów podczas zapisywania
   - Dodanie zabezpieczeń przed utratą danych

6. **Testy**:
   - Testy jednostkowe dla głównych komponentów
   - Testy integracyjne flow generowania i zapisywania
   - Testy ręczne z różnymi scenariuszami błędów

7. **Optymalizacja i finalizacja**:
   - Optymalizacja wydajności komponentów
   - Dopracowanie interfejsu użytkownika
   - Dokumentacja komponentów i hooka 