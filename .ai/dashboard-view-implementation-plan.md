# Plan implementacji widoku Dashboard

## 1. Przegląd
Dashboard jest głównym widokiem aplikacji 10xCards, który zapewnia użytkownikowi szybki przegląd aktywności i dostęp do kluczowych funkcjonalności. Prezentuje informacje o liczbie fiszek oczekujących na powtórkę danego dnia oraz umożliwia przejście do innych części aplikacji poprzez intuicyjny interfejs. Jest to pierwszy widok, który użytkownik zobaczy po zalogowaniu, dlatego powinien być przejrzysty i estetyczny.

## 2. Routing widoku
- **Ścieżka**: `/dashboard` lub `/` (strona główna)
- **Komponent strony**: `src/pages/dashboard.astro` lub `src/pages/index.astro`
- **Ochrona routingu**: Wymagane uwierzytelnienie (użycie middleware Astro)

## 3. Struktura komponentów
```
Dashboard (Astro Page)
├── DashboardLayout
│   ├── NavBar
│   │   └── UserMenu
│   └── MainContent
│       ├── WelcomeSection
│       ├── DueCountCard
│       │   └── DueCountChart
│       └── ActionCardsGrid
│           ├── StartLearningCard
│           ├── GenerateFlashcardsCard
│           └── ManageFlashcardsCard
```

## 4. Szczegóły komponentów

### DashboardLayout
- **Opis komponentu**: Główny układ strony, zawierający nagłówek z nawigacją i obszar treści.
- **Główne elementy**: 
  - Komponent `NavBar` z logo, elementami nawigacji i menu użytkownika
  - Kontener `MainContent` z elastycznym układem dla treści dashboard
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, służy jako kontener.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `title: string` - tytuł strony
  - `children: ReactNode` - zawartość strony

### NavBar
- **Opis komponentu**: Górny pasek nawigacyjny z logo aplikacji i menu.
- **Główne elementy**: 
  - Logo aplikacji (link do dashboard)
  - Linki nawigacyjne do głównych sekcji
  - Komponent `UserMenu` z opcjami użytkownika
- **Obsługiwane interakcje**: 
  - Kliknięcie w linki nawigacyjne
  - Rozwijanie menu użytkownika
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `activeLink?: string` - aktualnie aktywny link (opcjonalny)

### UserMenu
- **Opis komponentu**: Rozwijane menu z opcjami użytkownika.
- **Główne elementy**: 
  - Przycisk avatara/imienia użytkownika
  - Menu z opcją wylogowania
- **Obsługiwane interakcje**: 
  - Rozwijanie/zwijanie menu
  - Wylogowanie po kliknięciu odpowiedniej opcji
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `userName: string` - imię lub email użytkownika

### WelcomeSection
- **Opis komponentu**: Sekcja powitalna z podstawowymi informacjami.
- **Główne elementy**: 
  - Nagłówek z powitaniem użytkownika
  - Krótki opis lub status
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `userName: string` - imię lub email użytkownika

### DueCountCard
- **Opis komponentu**: Karta prezentująca liczbę fiszek oczekujących na powtórkę.
- **Główne elementy**: 
  - Licznik fiszek do powtórzenia dzisiaj
  - Wykres pokazujący nadchodzące powtórki (opcjonalnie)
  - Przycisk rozpoczęcia nauki
- **Obsługiwane interakcje**: 
  - Kliknięcie przycisku rozpoczęcia nauki
  - Wyświetlenie tooltipów dla wykresu (opcjonalnie)
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  - `DueFlashcardsCountResponseDto`
- **Propsy**: 
  - `dueCount: DueFlashcardsCountResponseDto | undefined` - liczba fiszek do powtórki
  - `isLoading: boolean` - flaga ładowania danych
  - `onStartLearning: () => void` - funkcja rozpoczynająca naukę

### DueCountChart
- **Opis komponentu**: Wykres słupkowy lub liniowy pokazujący fiszki do powtórki w nadchodzącym tygodniu.
- **Główne elementy**: 
  - Wykres z dniami tygodnia i liczbą fiszek
- **Obsługiwane interakcje**: 
  - Hover na słupkach/punktach wykresu pokazuje szczegóły
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  - `DailyDueCountDto[]`
- **Propsy**: 
  - `weeklyData: DailyDueCountDto[]` - dane do wykresu dla nadchodzącego tygodnia

### ActionCardsGrid
- **Opis komponentu**: Siatka kart z przyciskami do głównych akcji.
- **Główne elementy**: 
  - Kontener z flexbox lub grid layout
  - Karty akcji (StartLearningCard, GenerateFlashcardsCard, ManageFlashcardsCard)
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `dueCount: number` - liczba fiszek do powtórki dzisiaj

### StartLearningCard
- **Opis komponentu**: Karta z akcją rozpoczęcia nauki.
- **Główne elementy**: 
  - Ikona lub ilustracja
  - Tytuł "Rozpocznij naukę"
  - Krótki opis
  - Przycisk akcji
- **Obsługiwane interakcje**: 
  - Kliknięcie przycisku rozpoczęcia nauki
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `dueCount: number` - liczba fiszek do powtórki dzisiaj
  - `onClick: () => void` - funkcja wywoływana po kliknięciu

### GenerateFlashcardsCard
- **Opis komponentu**: Karta z akcją generowania nowych fiszek.
- **Główne elementy**: 
  - Ikona lub ilustracja
  - Tytuł "Wygeneruj fiszki"
  - Krótki opis
  - Przycisk akcji
- **Obsługiwane interakcje**: 
  - Kliknięcie przycisku generowania fiszek
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `onClick: () => void` - funkcja wywoływana po kliknięciu

### ManageFlashcardsCard
- **Opis komponentu**: Karta z akcją zarządzania fiszkami.
- **Główne elementy**: 
  - Ikona lub ilustracja
  - Tytuł "Przeglądaj fiszki"
  - Krótki opis
  - Przycisk akcji
- **Obsługiwane interakcje**: 
  - Kliknięcie przycisku przeglądania fiszek
- **Obsługiwana walidacja**: Brak.
- **Typy**: Nie wymaga specjalnych typów.
- **Propsy**: 
  - `onClick: () => void` - funkcja wywoływana po kliknięciu

## 5. Typy
Wykorzystane zostaną następujące typy z pliku `src/types.ts`:

```typescript
// Typy związane z liczbą fiszek do powtórki
export interface DailyDueCountDto {
  date: string; // YYYY-MM-DD format
  count: number;
}

export interface DueFlashcardsCountResponseDto {
  due_today: number;
  due_next_week: {
    total: number;
    by_day: DailyDueCountDto[];
  };
}

// Nowy typ dla komponentu Dashboard
interface DashboardViewModel {
  userName: string;
  dueFlashcardsCount: DueFlashcardsCountResponseDto | null;
  isLoading: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem
Do zarządzania stanem w komponencie zostanie wykorzystany customowy hook `useDashboardState`:

```typescript
interface UseDashboardStateResult {
  state: DashboardViewModel;
  startLearningSession: () => Promise<void>;
  navigateToGenerate: () => void;
  navigateToManage: () => void;
}

function useDashboardState(): UseDashboardStateResult {
  const [state, setState] = useState<DashboardViewModel>({
    userName: "",
    dueFlashcardsCount: null,
    isLoading: true,
    error: null
  });
  
  const navigate = useNavigate();

  // Pobranie danych przy inicjalizacji komponentu
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Pobranie liczby fiszek do powtórki
        const dueCountResponse = await fetch('/api/learning/due-count', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!dueCountResponse.ok) {
          throw new Error('Nie udało się pobrać liczby fiszek do powtórki');
        }
        
        const dueCountData: DueFlashcardsCountResponseDto = await dueCountResponse.json();
        
        // Pobranie informacji o użytkowniku (można dostosować zależnie od implementacji)
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Nie udało się pobrać informacji o użytkowniku');
        }
        
        const userData = await userResponse.json();
        
        setState({
          userName: userData.email,
          dueFlashcardsCount: dueCountData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
        }));
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Funkcja do rozpoczęcia sesji nauki
  const startLearningSession = async () => {
    try {
      const response = await fetch('/api/learning/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit: 20 })
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się rozpocząć sesji nauki');
      }
      
      const sessionData = await response.json();
      
      // Przekierowanie do strony sesji nauki z ID sesji
      navigate(`/learning/session?id=${sessionData.session_id}`);
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Wystąpił błąd podczas rozpoczynania sesji'
      }));
    }
  };
  
  // Funkcje nawigacyjne
  const navigateToGenerate = () => navigate('/flashcards/generate');
  const navigateToManage = () => navigate('/flashcards');
  
  return {
    state,
    startLearningSession,
    navigateToGenerate,
    navigateToManage
  };
}
```

## 7. Integracja API
Widok Dashboard integruje się z następującymi endpointami API:

### Pobieranie liczby fiszek do powtórzenia (`GET /api/learning/due-count`)
- **Żądanie**: GET bez parametrów
- **Odpowiedź**: 
  ```typescript
  {
    due_today: number;
    due_next_week: {
      total: number;
      by_day: Array<{
        date: string; // YYYY-MM-DD format
        count: number;
      }>;
    };
  }
  ```
- **Obsługa błędów**: 
  - 401 Unauthorized - przekierowanie do strony logowania
  - Inne błędy - wyświetlenie komunikatu o błędzie w UI

### Rozpoczynanie sesji nauki (`POST /api/learning/sessions`)
- **Żądanie**: 
  ```typescript
  {
    limit?: number; // Opcjonalne, domyślnie 20
  }
  ```
- **Odpowiedź**: 
  ```typescript
  {
    session_id: string;
    flashcards: Array<{
      id: string;
      front_content: string;
    }>;
  }
  ```
- **Obsługa błędów**:
  - 401 Unauthorized - przekierowanie do strony logowania
  - Inne błędy - wyświetlenie komunikatu o błędzie w UI

## 8. Interakcje użytkownika
1. **Przeglądanie danych na dashboardzie**:
   - Po załadowaniu strony użytkownik widzi liczbę fiszek do powtórzenia dzisiaj
   - Użytkownik może przeglądać wykres z nadchodzącymi powtórkami
   
2. **Rozpoczęcie sesji nauki**:
   - Użytkownik klika przycisk "Rozpocznij naukę" na karcie DueCountCard lub StartLearningCard
   - System wywołuje API do utworzenia nowej sesji nauki
   - Po pomyślnej odpowiedzi, użytkownik jest przekierowywany do widoku sesji nauki

3. **Przejście do generowania fiszek**:
   - Użytkownik klika przycisk "Wygeneruj fiszki" na karcie GenerateFlashcardsCard
   - Następuje przekierowanie do widoku generatora fiszek

4. **Przejście do zarządzania fiszkami**:
   - Użytkownik klika przycisk "Przeglądaj fiszki" na karcie ManageFlashcardsCard
   - Następuje przekierowanie do widoku listy fiszek

5. **Interakcje z menu nawigacyjnym**:
   - Użytkownik może klikać elementy menu głównego do nawigacji po aplikacji
   - Użytkownik może rozwinąć menu użytkownika, aby np. się wylogować

## 9. Warunki i walidacja
- **Weryfikacja uwierzytelnienia użytkownika**:
  - Użytkownik musi być zalogowany, aby zobaczyć dashboard
  - W przypadku braku sesji - przekierowanie do strony logowania
  
- **Wyświetlanie licznika fiszek**:
  - Jeśli liczba fiszek do powtórzenia wynosi 0, wyświetlany jest odpowiedni komunikat
  - W przypadku większej liczby, wyświetlana jest dokładna wartość

- **Dostęp do sesji nauki**:
  - Przycisk "Rozpocznij naukę" jest dostępny tylko, gdy są fiszki do powtórzenia (due_today > 0)
  - W przeciwnym przypadku, przycisk może być nieaktywny lub zawierać inny komunikat

## 10. Obsługa błędów
- **Błędy API**:
  - Wyświetlanie komunikatu o błędzie w miejsce danych w przypadku problemów z API
  - Możliwość odświeżenia danych poprzez przycisk odświeżania

- **Brak danych**:
  - Wyświetlanie placeholdera lub informacji, gdy brak fiszek do powtórzenia
  - Sugestia utworzenia nowych fiszek, jeśli użytkownik nie ma żadnych

- **Utrata połączenia**:
  - Wykrywanie braku połączenia z internetem
  - Wyświetlanie komunikatu o braku połączenia i instrukcji odświeżenia strony

- **Obsługa stanu ładowania**:
  - Wyświetlanie indykatora ładowania podczas pobierania danych
  - Blokowanie akcji użytkownika podczas ładowania danych

## 11. Kroki implementacji
1. **Utworzenie struktury plików**:
   - Utworzenie pliku strony `src/pages/dashboard.astro` lub `src/pages/index.astro`
   - Utworzenie folderu dla komponentów dashboard `src/components/dashboard/`
   - Utworzenie plików dla poszczególnych komponentów

2. **Implementacja komponentów UI**:
   - Implementacja DashboardLayout
   - Implementacja NavBar i UserMenu
   - Implementacja WelcomeSection
   - Implementacja DueCountCard z DueCountChart
   - Implementacja ActionCardsGrid z kartami akcji

3. **Implementacja zarządzania stanem**:
   - Utworzenie hooka useDashboardState
   - Implementacja logiki pobierania danych
   - Implementacja logiki nawigacji

4. **Integracja z API**:
   - Implementacja wywołań API do pobierania liczby fiszek
   - Implementacja wywołania API do rozpoczęcia sesji nauki

5. **Implementacja obsługi błędów**:
   - Dodanie obsługi błędów API
   - Implementacja wyświetlania komunikatów o błędach

6. **Testy**:
   - Testy jednostkowe komponentów
   - Testy integracyjne całego widoku
   - Testy użyteczności

7. **Optymalizacja**:
   - Implementacja lazy loading dla heavy komponentów
   - Optymalizacja wydajności renderowania

8. **Finalizacja**:
   - Przegląd kodu
   - Optymalizacja styli i UX
   - Dokumentacja komponentów 