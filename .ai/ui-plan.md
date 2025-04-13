# Zaktualizowana architektura UI dla 10xCards

## 1. Przegląd struktury UI

Architektura UI dla 10xCards została zaprojektowana z myślą o prostocie, intuicyjności i efektywności. Aplikacja będzie wykorzystywać Astro 5 jako podstawowy framework z React 19 dla komponentów interaktywnych, stylizację zapewni Tailwind CSS 4 wraz z komponentami Shadcn/ui.

Struktura UI skupia się na kluczowych funkcjonalnościach:
- **Publiczna część aplikacji** - zawierająca widoki logowania i rejestracji
- **Część zabezpieczona** - dostępna po zalogowaniu, zawierająca dashboard, generator fiszek, przeglądanie fiszek i sesje nauki

Główna nawigacja w zabezpieczonej części będzie opierać się na prostym menu górnym z kluczowymi funkcjami aplikacji. Całość interfejsu będzie utrzymana w jednolitym motywie kolorystycznym, zapewniając spójne doświadczenie użytkownika.

## 2. Lista widoków

### 2.1. Widok logowania
- **Ścieżka**: `/login`
- **Główny cel**: Umożliwienie użytkownikowi zalogowania się do aplikacji
- **Kluczowe informacje**: Formularz logowania
- **Kluczowe komponenty**:
  - Formularz logowania z walidacją (email, hasło)
  - Przycisk logowania
  - Link do widoku rejestracji
  - Informacja o błędach logowania (kod błędu)
- **UX/Dostępność/Bezpieczeństwo**:
  - Proste komunikaty o błędach
  - Walidacja danych formularza przed wysłaniem
  - Bezpieczne przechowywanie danych uwierzytelniających

### 2.2. Widok rejestracji
- **Ścieżka**: `/register`
- **Główny cel**: Umożliwienie utworzenia nowego konta
- **Kluczowe informacje**: Formularz rejestracji
- **Kluczowe komponenty**:
  - Formularz rejestracji z walidacją (email, hasło, potwierdzenie hasła)
  - Przycisk rejestracji
  - Link do widoku logowania
  - Informacja o błędach rejestracji (kod błędu)
- **UX/Dostępność/Bezpieczeństwo**:
  - Walidacja siły hasła
  - Walidacja zgodności haseł
  - Proste komunikaty o błędach
  - Bezpieczne przesyłanie danych rejestracyjnych

### 2.3. Dashboard
- **Ścieżka**: `/dashboard` lub `/`
- **Główny cel**: Zapewnienie przeglądu aktywności i szybkiego dostępu do głównych funkcji
- **Kluczowe informacje**: 
  - Licznik fiszek do powtórki dzisiaj
  - Szybki dostęp do głównych funkcji
- **Kluczowe komponenty**:
  - Licznik fiszek do powtórki (integracja z `/api/learning/due-count`)
  - Przycisk rozpoczęcia sesji nauki
  - Przycisk tworzenia nowych fiszek
  - Przycisk przeglądania istniejących fiszek
- **UX/Dostępność/Bezpieczeństwo**:
  - Prosty, przejrzysty układ
  - Wyraźne przyciski akcji
  - Informacja o liczbie fiszek do powtórzenia
  - Sesja użytkownika zabezpieczona tokenem JWT

### 2.4. Generator fiszek
- **Ścieżka**: `/flashcards/generate`
- **Główny cel**: Generowanie fiszek na podstawie wprowadzonego tekstu
- **Kluczowe informacje**: 
  - Obszar wprowadzania tekstu
  - Wybór języka docelowego
  - Lista wygenerowanych fiszek
- **Kluczowe komponenty**:
  - Obszar tekstowy z dynamicznym licznikiem znaków (limit 10 000)
  - Lista rozwijana z językami docelowymi
  - Przycisk generowania (integracja z `/api/flashcards/generate`)
  - Lista wygenerowanych fiszek z checkboxami do wyboru
  - Przycisk zapisania wybranych fiszek (integracja z `/api/flashcards/accept`)
  - Wskaźnik ładowania podczas generowania
- **UX/Dostępność/Bezpieczeństwo**:
  - Informacja o limicie tekstu
  - Wyraźne oznaczenie statusu generowania
  - Możliwość wyboru fiszek do zapisania
  - Zabezpieczenie przed przypadkowym utratą danych

### 2.5. Lista fiszek
- **Ścieżka**: `/flashcards`
- **Główny cel**: Przeglądanie istniejących fiszek
- **Kluczowe informacje**: Lista wszystkich fiszek użytkownika
- **Kluczowe komponenty**:
  - Lista fiszek z treścią przodu i tyłu (integracja z `/api/flashcards`)
  - Przyciski usuwania dla każdej fiszki
  - Paginacja listy
  - Przycisk "Dodaj nową fiszkę" prowadzący do widoku dodawania fiszek
  - Przycisk "Generuj fiszki" prowadzący do generatora fiszek
- **UX/Dostępność/Bezpieczeństwo**:
  - Przejrzysty układ listy
  - Wyraźne oznaczenie akcji usuwania
  - Potwierdzenie usunięcia
  - Zabezpieczenie dostępu do fiszek użytkownika

### 2.6. Dodawanie fiszki
- **Ścieżka**: `/flashcards/create`
- **Główny cel**: Ręczne tworzenie nowych fiszek
- **Kluczowe informacje**: Formularz z polami do wprowadzenia przodu i tyłu fiszki
- **Kluczowe komponenty**:
  - Formularz z polami tekstowymi dla przodu i tyłu fiszki
  - Liczniki znaków pokazujące limit (500 znaków dla przodu, 200 dla tyłu)
  - Przycisk "Zapisz fiszkę" (integracja z `/api/flashcards` POST)
  - Przycisk "Anuluj" do powrotu do listy fiszek
  - Komunikaty o błędach walidacji
- **UX/Dostępność/Bezpieczeństwo**:
  - Intuicyjny układ formularza
  - Walidacja danych w czasie rzeczywistym
  - Wyraźne oznaczenie pól wymaganych
  - Informacja zwrotna o statusie operacji
  - Zabezpieczenie przed przypadkową utratą danych

### 2.7. Sesja nauki
- **Ścieżka**: `/learning/session`
- **Główny cel**: Nauka z wykorzystaniem fiszek i algorytmu powtórek
- **Kluczowe informacje**: 
  - Aktualna fiszka (przód/tył)
  - Przyciski oceny trudności
- **Kluczowe komponenty**:
  - Karta fiszki z animacją odwracania
  - Przyciski oceny trudności (nie_pamietam, trudne, srednie, latwe)
  - Przycisk zakończenia sesji
  - Licznik postępu w sesji
  - Integracja z `/api/learning/sessions` (rozpoczęcie) i `/api/flashcards/{id}/review` (pobieranie i ocenianie)
- **UX/Dostępność/Bezpieczeństwo**:
  - Minimalistyczny interfejs dla skupienia uwagi
  - Intuicyjna animacja odwracania fiszki
  - Wyraźne przyciski oceny trudności
  - Zachowanie stanu sesji w przypadku przerwania

### 2.8. Podsumowanie sesji nauki
- **Ścieżka**: `/learning/summary`
- **Główny cel**: Przedstawienie statystyk po zakończonej sesji nauki
- **Kluczowe informacje**: Podstawowe statystyki z sesji
- **Kluczowe komponenty**:
  - Liczba przeglądniętych fiszek
  - Liczba poprawnych/niepoprawnych odpowiedzi
  - Procent ukończenia
  - Przycisk powrotu do dashboard
- **UX/Dostępność/Bezpieczeństwo**:
  - Prosty układ z kluczowymi statystykami
  - Wyraźna prezentacja wyniku
  - Możliwość łatwego powrotu do głównych funkcji

## 3. Mapa podróży użytkownika

### 3.1. Rejestracja i logowanie
1. Użytkownik wchodzi na stronę główną
2. Wybiera opcję rejestracji
3. Wypełnia formularz rejestracyjny i tworzy konto
4. Zostaje przekierowany do strony logowania
5. Loguje się do aplikacji
6. Zostaje przekierowany do dashboardu

### 3.2. Generowanie i zapisywanie fiszek
1. Użytkownik z dashboardu wybiera opcję generowania fiszek
2. Wprowadza tekst źródłowy (do 10 000 znaków)
3. Wybiera język docelowy z listy rozwijanej
4. Klika przycisk generowania
5. Widzi listę wygenerowanych fiszek
6. Zaznacza fiszki, które chce zachować
7. Zapisuje wybrane fiszki do swojej kolekcji
8. Zostaje przekierowany do widoku listy fiszek lub dashboardu

### 3.3. Nauka z fiszkami
1. Użytkownik z dashboardu wybiera opcję rozpoczęcia nauki
2. System pokazuje pierwszą fiszkę (przód)
3. Użytkownik próbuje przypomnieć sobie odpowiedź
4. Odwraca fiszkę, aby sprawdzić odpowiedź (używając `/api/flashcards/{id}/review` GET)
5. Ocenia swoją znajomość fiszki (nie_pamietam/trudne/srednie/latwe) (używając `/api/flashcards/{id}/review` POST)
6. System pokazuje kolejną fiszkę
7. Po przejrzeniu wszystkich fiszek lub zakończeniu sesji przez użytkownika, system pokazuje podsumowanie
8. Użytkownik wraca do dashboardu

### 3.4. Przeglądanie fiszek
1. Użytkownik z dashboardu wybiera opcję przeglądania fiszek
2. Przegląda listę swoich fiszek
3. Może usunąć wybrane fiszki

### 3.5. Ręczne dodawanie fiszek
1. Użytkownik przechodzi do widoku listy fiszek
2. Wybiera opcję "Dodaj nową fiszkę"
3. Wypełnia formularz, wprowadzając treść przodu i tyłu fiszki
4. Klika przycisk "Zapisz fiszkę"
5. System zapisuje fiszkę w bazie danych
6. Użytkownik zostaje przekierowany do listy fiszek z komunikatem o pomyślnym dodaniu

## 4. Układ i struktura nawigacji

Struktura nawigacji 10xCards będzie oparta na prostym, intuicyjnym układzie:

### 4.1. Nawigacja główna (dla zalogowanych użytkowników)
- Górny pasek nawigacyjny zawierający:
  - Logo/nazwa aplikacji (link do dashboardu)
  - Link do dashboardu
  - Link do generatora fiszek
  - Link do listy fiszek
  - Link do rozpoczęcia nauki
  - Menu użytkownika (rozwijane):
    - Wylogowanie

### 4.2. Nawigacja dla niezalogowanych użytkowników
- Minimalistyczny układ z logo/nazwą aplikacji
- Przyciski logowania/rejestracji

### 4.3. Nawigacja kontekstowa
- W widoku generatora fiszek: przyciski do generowania, zapisywania
- W widoku listy fiszek: przyciski usuwania dla każdej fiszki
- W widoku sesji nauki: przyciski oceny trudności, zakończenia sesji

### 4.4. Powroty i nawigacja wstecz
- Każdy widok zawiera intuicyjny sposób powrotu do poprzedniego ekranu lub dashboardu
- Przyciski anulowania w formularzach

## 5. Kluczowe komponenty

### 5.1. Komponenty uwierzytelniania
- **AuthForm** - bazowy komponent formularza uwierzytelniania, wykorzystywany zarówno w logowaniu jak i rejestracji
- **PasswordInput** - specjalizowany input do haseł z walidacją i opcjonalnym przełącznikiem widoczności

### 5.2. Komponenty fiszek
- **FlashcardCard** - komponent reprezentujący fiszkę, z animacją odwracania
- **FlashcardList** - komponent listy fiszek z opcjami zarządzania
- **FlashcardForm** - formularz do tworzenia/edycji fiszek
- **FlashcardGenerator** - komponent generatora fiszek z AI
- **CharCounter** - komponent licznika znaków dla pól tekstowych

### 5.3. Komponenty sesji nauki
- **LearningSession** - główny komponent sesji nauki
- **DifficultyRating** - zestaw przycisków oceny trudności
- **SessionSummary** - komponent podsumowania sesji nauki

### 5.4. Komponenty UI
- **Button** - przycisk z różnymi wariantami (primary, secondary, danger)
- **Card** - komponent karty do prezentacji zawartości
- **Input** - komponent pola wprowadzania z walidacją
- **Dropdown** - lista rozwijana (np. do wyboru języka)
- **Checkbox** - pole wyboru (do zaznaczania fiszek)
- **LoadingIndicator** - wskaźnik ładowania dla operacji asynchronicznych
- **ErrorDisplay** - komponent wyświetlający błędy (kody błędów)

### 5.5. Komponenty layoutu
- **MainLayout** - główny układ dla zalogowanych użytkowników
- **AuthLayout** - układ dla stron uwierzytelniania
- **NavBar** - górny pasek nawigacji
- **UserMenu** - rozwijane menu użytkownika

## 6. Implementacja integracji z API

### 6.1. Generowanie fiszek
- **Endpoint**: `POST /api/flashcards/generate`
- **Komponent**: `FlashcardGenerator`
- **Przepływ**:
  1. Użytkownik wprowadza tekst i wybiera język docelowy
  2. Po kliknięciu przycisku "Generuj", komponent wysyła żądanie POST
  3. W trakcie generowania wyświetlany jest wskaźnik ładowania
  4. Po otrzymaniu odpowiedzi, wygenerowane fiszki są wyświetlane jako lista z checkboxami

### 6.2. Akceptacja fiszek
- **Endpoint**: `POST /api/flashcards/accept`
- **Komponent**: `FlashcardGenerator`
- **Przepływ**:
  1. Użytkownik zaznacza fiszki, które chce zachować
  2. Po kliknięciu przycisku "Zapisz wybrane", komponent wysyła żądanie POST
  3. Po pomyślnym zapisie, użytkownik jest przekierowywany do dashboardu lub listy fiszek

### 6.3. Pobieranie fiszek
- **Endpoint**: `GET /api/flashcards`
- **Komponent**: `FlashcardList`
- **Przepływ**:
  1. Przy ładowaniu komponentu wysyłane jest żądanie GET
  2. Otrzymane fiszki są wyświetlane jako lista
  3. Implementacja paginacji pozwala na nawigację między stronami wyników

### 6.4. Rozpoczynanie sesji nauki
- **Endpoint**: `POST /api/learning/sessions`
- **Komponent**: `LearningSession`
- **Przepływ**:
  1. Użytkownik inicjuje sesję nauki z dashboardu
  2. Komponent wysyła żądanie POST aby utworzyć nową sesję
  3. Otrzymane fiszki są ładowane do interfejsu sesji nauki

### 6.5. Przeglądanie fiszek w sesji nauki
- **Endpoint**: `GET /api/flashcards/{id}/review`
- **Komponent**: `FlashcardCard` w `LearningSession`
- **Przepływ**:
  1. Po naciśnięciu przycisku odwracania fiszki, komponent wysyła żądanie GET
  2. Otrzymana pełna treść fiszki (front i back) jest wyświetlana użytkownikowi

### 6.6. Ocenianie fiszek w sesji nauki
- **Endpoint**: `POST /api/flashcards/{id}/review`
- **Komponent**: `DifficultyRating` w `LearningSession`
- **Przepływ**:
  1. Użytkownik wybiera poziom trudności fiszki
  2. Komponent wysyła żądanie POST z oceną i identyfikatorem sesji
  3. System ładuje kolejną fiszkę

### 6.7. Pobieranie liczby fiszek do powtórki
- **Endpoint**: `GET /api/learning/due-count`
- **Komponent**: `Dashboard`
- **Przepływ**:
  1. Przy ładowaniu dashboardu wysyłane jest żądanie GET
  2. Otrzymana liczba fiszek do powtórki jest wyświetlana użytkownikowi
  3. Dodatkowe informacje o nadchodzących powtórkach mogą być wyświetlane w formie wykresu lub kalendarzyka

## 7. Kluczowe funkcje i interakcje

### 7.1. Generowanie fiszek z tekstu
- Wprowadzenie tekstu w obszar tekstowy
- Wybór języka docelowego z listy rozwijanej
- Generowanie fiszek przy użyciu AI
- Wybór fiszek do zapisania
- Zapisanie wybranych fiszek

### 7.2. Proces nauki
- Rozpoczęcie sesji nauki
- Przeglądanie przodu fiszki
- Odwracanie fiszki, aby zobaczyć tył
- Ocena trudności fiszki
- Przejście do kolejnej fiszki
- Zakończenie sesji i przeglądanie podsumowania

### 7.3. Przeglądanie i zarządzanie fiszkami
- Przeglądanie listy wszystkich fiszek
- Usuwanie niepotrzebnych fiszek
- Paginacja dla dużych zbiorów fiszek

### 7.4. Śledzenie postępów
- Wyświetlanie liczby fiszek do powtórzenia danego dnia
- Przeglądanie statystyk z sesji nauki

## 8. Responsywność i dostępność

### 8.1. Responsywność
- Podstawowa obsługa różnych wielkości ekranów
- Priorytet dla widoku desktopowego, zgodnie z wymaganiami

### 8.2. Dostępność
- Prawidłowa struktura nagłówków dla czytników ekranu
- Wystarczające kontrasty kolorów
- Obsługa klawiatury dla podstawowych interakcji
- Opisowe etykiety dla formularzy i przycisków 