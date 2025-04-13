# Analiza relacji między endpointami API a widokami UI

## 1. Przegląd endpointów API

| Endpoint | Metoda | Ścieżka | Opis |
|----------|--------|---------|------|
| Rejestracja użytkownika | POST | `/api/auth/register` | Rejestracja nowego użytkownika |
| Logowanie | POST | `/api/auth/login` | Uwierzytelnienie użytkownika |
| Wylogowanie | POST | `/api/auth/logout` | Wylogowanie użytkownika |
| Pobieranie listy fiszek | GET | `/api/flashcards` | Pobieranie wszystkich fiszek użytkownika |
| Generowanie fiszek | POST | `/api/flashcards/generate` | Generowanie fiszek na podstawie tekstu |
| Akceptacja fiszek | POST | `/api/flashcards/accept` | Zapisywanie wygenerowanych fiszek |
| Pobieranie fiszki do nauki | GET | `/api/flashcards/{id}/review` | Pobieranie pełnej zawartości fiszki podczas nauki |
| Ocenianie fiszki | POST | `/api/flashcards/{id}/review` | Ocenianie trudności fiszki podczas nauki |
| Rozpoczęcie sesji nauki | POST | `/api/learning/sessions` | Rozpoczęcie nowej sesji nauki |
| Zakończenie sesji nauki | PUT | `/api/learning/sessions/{session_id}` | Zakończenie sesji nauki |
| Liczba fiszek do nauki | GET | `/api/learning/due` | Pobieranie liczby fiszek oczekujących na naukę |

## 2. Przegląd widoków UI

| Widok | Ścieżka | Opis |
|-------|---------|------|
| Rejestracja | `/register` | Rejestracja nowego użytkownika |
| Logowanie | `/login` | Logowanie użytkownika |
| Dashboard | `/` | Główny panel aplikacji |
| Generator fiszek | `/flashcards/generate` | Generowanie fiszek na podstawie tekstu |
| Lista fiszek | `/flashcards` | Przeglądanie wszystkich fiszek |
| Nauka z fiszkami | `/learning/session` | Nauka z wykorzystaniem fiszek |
| Podsumowanie sesji nauki | `/learning/summary` | Podsumowanie po zakończonej sesji nauki |

## 3. Mapowanie endpointów API do widoków UI

### Rejestracja użytkownika
- **Endpoint**: POST `/api/auth/register`
- **Widok**: `/register` (Register View)
- **Status**: ✅ Zaimplementowane i zmapowane

### Logowanie
- **Endpoint**: POST `/api/auth/login`  
- **Widok**: `/login` (Login View)
- **Status**: ✅ Zaimplementowane i zmapowane

### Wylogowanie
- **Endpoint**: POST `/api/auth/logout`
- **Widok**: Używane w różnych widokach (Dashboard, Lista fiszek, itp.)
- **Status**: ✅ Zaimplementowane i zmapowane

### Pobieranie listy fiszek
- **Endpoint**: GET `/api/flashcards`
- **Widok**: `/flashcards` (Lista fiszek)
- **Status**: ✅ Zaimplementowane i zmapowane

### Generowanie fiszek
- **Endpoint**: POST `/api/flashcards/generate`
- **Widok**: `/flashcards/generate` (Generator fiszek)
- **Status**: ✅ Zaimplementowane i zmapowane

### Akceptacja fiszek
- **Endpoint**: POST `/api/flashcards/accept`
- **Widok**: `/flashcards/generate` (Generator fiszek)
- **Status**: ✅ Zaimplementowane i zmapowane

### Pobieranie fiszki do nauki
- **Endpoint**: GET `/api/flashcards/{id}/review`
- **Widok**: `/learning/session` (Nauka z fiszkami)
- **Status**: ✅ Zaimplementowane i zmapowane

### Ocenianie fiszki
- **Endpoint**: POST `/api/flashcards/{id}/review`
- **Widok**: `/learning/session` (Nauka z fiszkami)
- **Status**: ✅ Zaimplementowane i zmapowane

### Rozpoczęcie sesji nauki
- **Endpoint**: POST `/api/learning/sessions`
- **Widok**: `/learning/session` (Nauka z fiszkami)
- **Status**: ✅ Zaimplementowane i zmapowane

### Zakończenie sesji nauki
- **Endpoint**: PUT `/api/learning/sessions/{session_id}`
- **Widok**: `/learning/session` (Nauka z fiszkami)
- **Status**: ✅ Zaimplementowane i zmapowane

### Liczba fiszek do nauki
- **Endpoint**: GET `/api/learning/due`
- **Widok**: `/` (Dashboard)
- **Status**: ✅ Zaimplementowane i zmapowane

## 4. Podsumowanie analizy

Wszystkie zdefiniowane endpointy API mają odpowiadające im widoki UI, które z nich korzystają. Aplikacja tworzy spójny ekosystem, w którym:

1. **Proces autentykacji** jest obsługiwany przez endpointy rejestracji, logowania i wylogowania, używane w odpowiednich widokach.

2. **Zarządzanie fiszkami** realizowane jest przez:
   - Przeglądanie fiszek (endpoint GET `/api/flashcards`, widok Lista fiszek)
   - Tworzenie nowych fiszek (endpointy POST `/api/flashcards/generate` i POST `/api/flashcards/accept`, widok Generator fiszek)

3. **Proces nauki** jest wspierany przez:
   - Rozpoczynanie sesji nauki (endpoint POST `/api/learning/sessions`, widok Nauka z fiszkami)
   - Pobieranie fiszek do nauki (endpoint GET `/api/flashcards/{id}/review`, widok Nauka z fiszkami)
   - Ocenianie fiszek (endpoint POST `/api/flashcards/{id}/review`, widok Nauka z fiszkami)
   - Zakończenie sesji (endpoint PUT `/api/learning/sessions/{session_id}`, widok Nauka z fiszkami)
   - Wyświetlanie statystyk (widok Podsumowanie sesji nauki)

4. **Dashboard** zapewnia podgląd liczby fiszek do nauki dzisiaj (endpoint GET `/api/learning/due`).

Nie zidentyfikowano braków w mapowaniu - wszystkie endpointy są wykorzystywane w odpowiednich widokach, a wszystkie widoki mają dostęp do potrzebnych endpointów API.

## 5. Uwagi końcowe

Obecna struktura aplikacji tworzy spójny i kompletny system, w którym:

1. Użytkownik może zarejestrować się i zalogować
2. Tworzyć fiszki z pomocą AI
3. Przeglądać swoje fiszki
4. Uczyć się z wykorzystaniem algorytmu powtórek
5. Analizować swoje postępy

Całość stanowi pełne i kompletne rozwiązanie edukacyjne zgodne z założeniami PRD. 