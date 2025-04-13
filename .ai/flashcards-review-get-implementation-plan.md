# API Endpoint Implementation Plan: Get Flashcard for Review

## 1. Przegląd punktu końcowego
Endpoint `GET /api/flashcards/{id}/review` służy do pobierania pełnej zawartości fiszki, w tym treści tylnej strony, w celu samodzielnego sprawdzenia podczas sesji nauki. Endpoint zwraca fiszki należące do zalogowanego użytkownika i wymaga uwierzytelnienia. Jest używany w procesie nauki, gdy użytkownik najpierw próbuje przypomnieć sobie odpowiedź, a następnie sprawdza poprawność, przeglądając pełną treść fiszki.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards/{id}/review`
- **Parametry**:
  - **Wymagane**:
    - `id`: UUID - identyfikator fiszki do pobrania (jako parametr ścieżki)
  - **Opcjonalne**: Brak
- **Request Body**: Brak (metoda GET)

## 3. Wykorzystywane typy
```typescript
// Z pliku types.ts
import type {
  UUID,
  GetFlashcardForReviewResponseDto
} from '../../../types';
```

## 4. Szczegóły odpowiedzi
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "is_ai_generated": "boolean"
  }
  ```
- **Kody błędów**:
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 404 Not Found: Fiszka o podanym ID nie istnieje lub nie należy do zalogowanego użytkownika

## 5. Przepływ danych
1. Endpoint odbiera żądanie GET z parametrem ID fiszki.
2. Sprawdza, czy użytkownik jest uwierzytelniony.
3. Wywołuje serwis, który pobiera dane fiszki z bazy danych Supabase.
4. Serwis sprawdza, czy fiszka należy do zalogowanego użytkownika (bezpieczeństwo na poziomie aplikacji).
5. Dodatkowo, RLS polityki Supabase zapewniają, że użytkownicy mogą pobierać tylko swoje własne fiszki (bezpieczeństwo na poziomie bazy danych).
6. Dane fiszki są zwracane do klienta w określonym formacie odpowiedzi.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint wymaga, aby użytkownik był uwierzytelniony. Sesja użytkownika jest weryfikowana za pomocą Supabase Auth.
- **Autoryzacja**: 
  - Na poziomie aplikacji: Sprawdzenie, czy fiszka należy do zalogowanego użytkownika.
  - Na poziomie bazy danych: Polityki RLS w Supabase zapewniają, że użytkownicy mogą pobierać tylko swoje własne fiszki.
- **Walidacja danych**: Parametr ID jest weryfikowany pod kątem formatu UUID.
- **Kontrola dostępu**: Użytkownicy nie mogą przeglądać fiszek innych użytkowników.

## 7. Obsługa błędów
- **401 Unauthorized**: Zwracany, gdy użytkownik nie jest uwierzytelniony.
  ```json
  {
    "error": "Authentication required"
  }
  ```
- **404 Not Found**: Zwracany, gdy fiszka o podanym ID nie istnieje lub nie należy do zalogowanego użytkownika.
  ```json
  {
    "error": "Flashcard not found"
  }
  ```
- **500 Internal Server Error**: Zwracany w przypadku nieoczekiwanych błędów serwera.
  ```json
  {
    "error": "Internal server error",
    "message": "..."
  }
  ```

## 8. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Upewnij się, że kolumna `id` w tabeli `flashcards` jest zindeksowana, aby zapewnić szybkie wyszukiwanie.
- **Cachowanie**: Rozważ implementację cachowania na poziomie aplikacji dla często przeglądanych fiszek, aby zmniejszyć obciążenie bazy danych.
- **Minimalizacja danych**: Endpoint zwraca tylko niezbędne pola fiszki, omijając metadane, takie jak `created_at` i `correct_answers_count`.

## 9. Etapy wdrożenia
1. **Utworzenie funkcji serwisowej** w `src/lib/services/flashcard.service.ts`:
   ```typescript
   export async function getFlashcardForReview(
     supabase: SupabaseClient,
     userId: UUID,
     flashcardId: UUID
   ): Promise<GetFlashcardForReviewResponseDto>
   ```

2. **Implementacja funkcji serwisowej**:
   - Pobieranie fiszki o określonym ID z bazy danych
   - Sprawdzenie, czy fiszka należy do wskazanego użytkownika
   - Mapowanie danych do wymaganego formatu odpowiedzi

3. **Utworzenie endpointu** w `src/pages/api/flashcards/[id]/review.ts`:
   - Zaimplementowanie metody GET
   - Obsługa uwierzytelniania i autoryzacji
   - Pobieranie parametru ID z URL
   - Wywołanie funkcji serwisowej
   - Obsługa błędów i formatowanie odpowiedzi

4. **Testowanie**:
   - Testy jednostkowe funkcji serwisowej
   - Testy integracyjne endpointu
   - Sprawdzenie obsługi błędów
   - Weryfikacja poprawnego działania polityk RLS 