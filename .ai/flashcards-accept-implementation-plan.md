# API Endpoint Implementation Plan: Accept Flashcards

## 1. Przegląd punktu końcowego
Punkt końcowy `/api/flashcards/accept` służy do zapisywania wybranych przez użytkownika fiszek do ich stałej kolekcji. Pozwala na zapis fiszek zarówno generowanych przez AI, jak i tworzonych ręcznie. Po akceptacji, fiszki stają się częścią osobistej kolekcji użytkownika i mogą być wykorzystywane w procesie nauki.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/accept`
- **Parametry**:
  - **Wymagane**: Brak parametrów URL
  - **Opcjonalne**: Brak parametrów URL
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": boolean
      }
    ]
  }
  ```

## 3. Wykorzystywane typy
- **DTOs**:
  - `AcceptFlashcardsDto`: Schemat danych wejściowych
  - `FlashcardToAcceptDto`: Model pojedynczej fiszki do akceptacji
  - `AcceptFlashcardsResponseDto`: Schemat odpowiedzi
  - `AcceptedFlashcardDto`: Model pojedynczej zaakceptowanej fiszki w odpowiedzi

- **Schemat walidacji (Zod)**:
  ```typescript
  export const acceptFlashcardsSchema = z.object({
    flashcards: z.array(
      z.object({
        front_content: z.string()
          .min(1, "Front content cannot be empty")
          .max(500, "Front content cannot exceed 500 characters"),
        back_content: z.string()
          .min(1, "Back content cannot be empty")
          .max(200, "Back content cannot exceed 200 characters"),
        is_ai_generated: z.boolean()
      })
    ).min(1, "At least one flashcard must be provided")
  });
  ```

## 4. Szczegóły odpowiedzi
- **Kod sukcesu**: 201 Created
- **Format odpowiedzi sukcesu**:
  ```json
  {
    "accepted_count": integer,
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": boolean,
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Kody błędów**:
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Brak autoryzacji

## 5. Przepływ danych
1. Aplikacja odbiera żądanie POST na `/api/flashcards/accept`
2. Middleware Astro weryfikuje sesję użytkownika
3. Endpoint waliduje dane wejściowe przy użyciu schematu Zod
4. Serwis flashcard wykonuje transakcję do bazy danych:
   - Tworzy nowe rekordy w tabeli `flashcards` dla każdej fiszki
   - Przypisuje `user_id` z sesji do każdej fiszki
   - Ustawia `is_ai_generated` zgodnie z wartością przesłaną w żądaniu
   - Ustawia `correct_answers_count` na 0
5. Serwis zwraca utworzone fiszki z ich unikalnymi identyfikatorami (UUIDs)
6. Endpoint formatuje odpowiedź zgodnie z `AcceptFlashcardsResponseDto`
7. Odpowiedź jest zwracana do klienta

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagana jest sesja użytkownika za pośrednictwem Supabase Auth
- **Autoryzacja**: Tylko zalogowani użytkownicy mogą zapisywać fiszki
- **Walidacja danych**: 
  - Walidacja długości pól `front_content` (max 500 znaków) i `back_content` (max 200 znaków)
  - Zapobieganie atakom typu injection przez używanie parametryzowanych zapytań Supabase
  - Weryfikacja, że żądanie zawiera przynajmniej jedną fiszkę
- **Zabezpieczenia CSRF**: Supabase zapewnia ochronę przez tokeny sesji

## 7. Obsługa błędów
- **400 Bad Request**:
  - Brak wymaganych pól w żądaniu
  - Długość zawartości przekracza dozwolone limity
  - Pusta tablica fiszek
  - Nieprawidłowy format JSON
- **401 Unauthorized**:
  - Brak ważnej sesji użytkownika
  - Wygasły token uwierzytelniający
- **500 Internal Server Error**:
  - Błąd podczas zapisywania danych w bazie
  - Błąd połączenia z bazą danych
  - Nieoczekiwane wyjątki

## 8. Rozważania dotyczące wydajności
- **Transakcja bazodanowa**: Użycie pojedynczej transakcji dla zapisania wielu fiszek
- **Limity**:
  - Rozważyć dodanie limitu na liczbę fiszek, które mogą być akceptowane w jednym żądaniu
  - Aktualne limity: front_content (500 znaków), back_content (200 znaków)
- **Indeksowanie**: Tabela `flashcards` powinna mieć indeks na kolumnie `user_id` dla szybkiego wyszukiwania

## 9. Etapy wdrożenia
1. **Utworzenie schematu walidacji**:
   - Dodać `acceptFlashcardsSchema` w `src/lib/validation/schemas.ts`

2. **Utworzenie serwisu fiszek** (jeśli nie istnieje):
   - Utworzyć plik `src/lib/services/flashcard.service.ts`
   - Zaimplementować funkcję `saveAcceptedFlashcards`

3. **Implementacja handlera API**:
   - Utworzyć plik `src/pages/api/flashcards/accept.ts`
   - Zaimplementować metodę POST
   - Podłączyć walidację i serwis

4. **Testowanie**:
   - Testy jednostkowe dla walidacji i serwisu
   - Testy integracyjne dla endpointu
   - Testy ręczne przy użyciu narzędzia do testowania API (np. Postman)

5. **Dokumentacja**:
   - Zaktualizować dokumentację API
   - Dodać przykłady użycia do dokumentacji

6. **Wdrożenie**:
   - Code review
   - Merge do głównej gałęzi
   - Wdrożenie na środowisko produkcyjne 