# API Endpoint Implementation Plan: Get All Flashcards

## 1. Przegląd punktu końcowego
Endpoint GET /api/flashcards pozwala użytkownikowi pobrać wszystkie swoje fiszki (flashcards) z możliwością paginacji i sortowania. Endpoint zwraca tylko fiszki należące do zalogowanego użytkownika i wymaga uwierzytelnienia.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - **Opcjonalne**:
    - `page`: number (domyślnie: 1) - numer strony wyników
    - `per_page`: number (domyślnie: 20, max: 100) - liczba wyników na stronę
    - `sort_by`: string (opcje: "created_at", "correct_answers_count") - pole, według którego mają być sortowane wyniki
    - `sort_dir`: string (opcje: "asc", "desc") - kierunek sortowania (rosnąco lub malejąco)
- **Request Body**: Brak (metoda GET)

## 3. Wykorzystywane typy
```typescript
// Z pliku types.ts
import type {
  FlashcardQueryParams,
  FlashcardResponseDto,
  FlashcardsResponseDto,
  PaginationMeta
} from '../../../types';

// Schema do walidacji parametrów zapytania
import { z } from 'zod';

// Nowy schemat do dodania w lib/validation/schemas.ts
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  per_page: z.coerce.number().positive().max(100).default(20),
  sort_by: z.enum(['created_at', 'correct_answers_count']).default('created_at'),
  sort_dir: z.enum(['asc', 'desc']).default('desc')
});

export type FlashcardsQueryInput = z.infer<typeof flashcardsQuerySchema>;
```

## 4. Szczegóły odpowiedzi
- **Status 200 OK**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": "boolean",
        "created_at": "timestamp",
        "correct_answers_count": "integer"
      }
    ],
    "pagination": {
      "total": "integer",
      "pages": "integer",
      "current_page": "integer",
      "per_page": "integer"
    }
  }
  ```
- **Status 401 Unauthorized**:
  ```json
  {
    "error": "Authentication required"
  }
  ```
- **Status 500 Internal Server Error**:
  ```json
  {
    "error": "Internal server error",
    "message": "Error message details"
  }
  ```

## 5. Przepływ danych
1. Endpiont odbiera żądanie GET z parametrami query.
2. Sprawdza, czy użytkownik jest uwierzytelniony poprzez Supabase Auth.
3. Waliduje parametry zapytania używając Zod.
4. Wykonuje zapytanie do bazy danych Supabase, aby pobrać fiszki należące do zalogowanego użytkownika:
   - Ogranicza wyniki tylko do użytkownika na podstawie user_id z tokena JWT.
   - Stosuje paginację na podstawie parametrów page i per_page.
   - Sortuje wyniki na podstawie parametrów sort_by i sort_dir.
   - Oblicza całkowitą liczbę fiszek dla informacji o paginacji.
5. Mapuje dane z bazy danych do formatu odpowiedzi API.
6. Zwraca odpowiedź zawierającą dane fiszek oraz metadane paginacji.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymaga ważnego tokena JWT z Supabase Auth.
- **Autoryzacja**: 
  - Stosuje Row Level Security (RLS) w Supabase do filtrowania danych tylko dla zalogowanego użytkownika.
  - Wszystkie zapytania do bazy danych są filtrowane według user_id.
- **Walidacja danych**:
  - Parametry query są walidowane za pomocą Zod.
  - Wartości liczbowe są ograniczone do rozsądnych zakresów.
  - Enumy dla sortowania są jawnie zdefiniowane, aby zapobiec nieprawidłowym wartościom.
- **Sanityzacja danych**: Wszystkie dane są przetwarzane przez ORM Supabase, co pomaga zapobiegać atakom SQL Injection.

## 7. Obsługa błędów
- **401 Unauthorized**: Zwracany, gdy użytkownik nie jest uwierzytelniony.
  - Rozwiązanie: Użytkownik powinien się zalogować.
- **400 Bad Request**: Zwracany, gdy parametry zapytania są nieprawidłowe.
  - Rozwiązanie: Poprawienie parametrów zgodnie z wymaganiami.
- **500 Internal Server Error**: Zwracany przy nieoczekiwanych błędach serwera.
  - Rozwiązanie: Logowanie błędu do monitoringu, informowanie użytkownika o problemie.

## 8. Rozważania dotyczące wydajności
- **Indeksy bazy danych**: Upewnij się, że kolumny używane do sortowania (created_at, correct_answers_count) mają indeksy.
- **Paginacja**: Implementacja paginacji zapobiega pobieraniu zbyt dużej liczby rekordów.
- **Limit rozmiaru odpowiedzi**: Ograniczenie per_page do 100 zapobiega zbyt dużym odpowiedziom.
- **Cachowanie**: Można rozważyć implementację cachowania odpowiedzi dla popularnych parametrów zapytania.

## 9. Etapy wdrożenia
1. **Utworzenie pliku endpointu**:
   Utwórz plik `src/pages/api/flashcards/index.ts` dla obsługi endpointu GET.

2. **Rozszerzenie walidacji**:
   Dodaj schemat `flashcardsQuerySchema` do pliku `src/lib/validation/schemas.ts`.

3. **Implementacja serwisu**:
   Utwórz plik `src/lib/services/flashcards.ts` zawierający logikę pobierania i paginacji fiszek.
   ```typescript
   // Przykładowa sygnatura funkcji
   export async function getFlashcards(
     supabase: SupabaseClient,
     params: FlashcardsQueryInput
   ): Promise<FlashcardsResponseDto>
   ```

4. **Implementacja obsługi GET**:
   ```typescript
   export const GET: APIRoute = async ({ request, locals }) => {
     // 1. Sprawdź uwierzytelnienie
     // 2. Waliduj parametry zapytania
     // 3. Wywołaj serwis do pobrania danych
     // 4. Zwróć odpowiedź z danymi i metadanymi paginacji
   }
   ```

5. **Testowanie**:
   - Testy jednostkowe dla serwisu obsługującego pobieranie fiszek.
   - Testy integracyjne dla endpointu z różnymi kombinacjami parametrów.
   - Ręczne testowanie z rzeczywistymi danymi.

6. **Dokumentacja**:
   - Zaktualizuj dokumentację API.
   - Dodaj przykłady użycia dla deweloperów front-endu. 