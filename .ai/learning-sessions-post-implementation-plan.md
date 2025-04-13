# API Endpoint Implementation Plan: Start Learning Session

## 1. Przegląd punktu końcowego
Endpoint umożliwia użytkownikowi rozpoczęcie nowej sesji nauki i otrzymanie listy fiszek, które są gotowe do przeglądu zgodnie z algorytmem powtórek przestrzeniowych. Tworzy nową sesję w bazie danych i zwraca identyfikator sesji oraz kolekcję fiszek do nauki.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/learning/sessions`
- Parametry:
  - Wymagane: Brak
  - Opcjonalne: 
    - `limit` (domyślnie: 20) - maksymalna liczba fiszek do zwrócenia
- Request Body:
  ```json
  {
    "limit": 20 // Opcjonalny, domyślnie: 20
  }
  ```

## 3. Wykorzystywane typy
1. **StartLearningSessionDto**
   ```typescript
   export interface StartLearningSessionDto {
     limit?: number; // Optional, default: 20
   }
   ```

2. **LearningSessionFlashcardDto**
   ```typescript
   export interface LearningSessionFlashcardDto {
     id: UUID;
     front_content: string;
   }
   ```

3. **StartLearningSessionResponseDto**
   ```typescript
   export interface StartLearningSessionResponseDto {
     session_id: UUID;
     flashcards: LearningSessionFlashcardDto[];
   }
   ```

4. **Zod Schema** dla walidacji danych wejściowych
   ```typescript
   export const startLearningSessionSchema = z.object({
     limit: z.number().int().positive().max(100).optional().default(20)
   });
   
   export type StartLearningSessionInput = z.infer<typeof startLearningSessionSchema>;
   ```

## 4. Szczegóły odpowiedzi
- Struktura odpowiedzi:
  ```json
  {
    "session_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string"
      }
    ]
  }
  ```
- Kody statusu:
  - 200 OK: Sesja nauki została pomyślnie rozpoczęta
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error: Błąd serwera podczas przetwarzania żądania

## 5. Przepływ danych
1. Odbieranie żądania POST na endpoint `/api/learning/sessions`
2. Walidacja danych wejściowych za pomocą schematu Zod
3. Pobranie kontekstu użytkownika z tokenu JWT (Supabase Auth)
4. Utworzenie nowej sesji nauki w tabeli (będzie trzeba utworzyć tabelę `learning_sessions`)
5. Pobranie fiszek oczekujących na przegląd (due for review) za pomocą funkcji SQL `get_cards_due_for_review`
6. Mapowanie wyników do formatu odpowiedzi DTO
7. Zwrócenie identyfikatora sesji i listy fiszek w formacie JSON

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**: Wymaga ważnego tokenu JWT
2. **Autoryzacja**: Dostęp tylko do fiszek należących do uwierzytelnionego użytkownika (poprzez Row Level Security w Supabase)
3. **Walidacja danych**: Wszystkie dane wejściowe są walidowane za pomocą Zod przed przetworzeniem
4. **Ograniczenia**: Parametr `limit` jest ograniczony, by zapobiec przeciążeniu serwera
5. **Izolacja danych**: Systemy RLS Supabase zapewniają, że użytkownik ma dostęp wyłącznie do własnych danych

## 7. Obsługa błędów
1. **401 Unauthorized**: Brak ważnego tokenu JWT lub token wygasł
2. **400 Bad Request**: Nieprawidłowe dane wejściowe (np. limit < 0)
3. **500 Internal Server Error**: Błędy bazy danych lub nieprzewidziane wyjątki
4. Wszystkie błędy powinny być logowane dla celów debugowania

## 8. Rozważania dotyczące wydajności
1. **Indeksy bazy danych**: Zapewnienie indeksów na kolumnach `user_id` i `next_review_date` dla optymalnych zapytań
2. **Ograniczenie rozmiaru odpowiedzi**: Parametr `limit` zapobiega pobieraniu zbyt wielu fiszek na raz
3. **Caching**: Rozważenie cachowania wyników dla często używanych limitów
4. **Monitoring**: Implementacja monitoringu wydajności endpoint, aby śledzić czas odpowiedzi

## 9. Etapy wdrożenia

### Migracje bazy danych
1. Utworzenie migracji dla tabeli `learning_sessions`
```sql
-- migration: create learning sessions table
-- description: creates the learning_sessions table for tracking user study sessions
-- date: YYYY-MM-DD

-- create learning_sessions table
create table if not exists learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamp with time zone not null default now(),
  ended_at timestamp with time zone,
  flashcards_count integer not null default 0,
  flashcards_reviewed integer not null default 0,
  correct_answers integer not null default 0,
  incorrect_answers integer not null default 0
);

-- create indexes for performance
create index idx_learning_sessions_user_id on learning_sessions(user_id);
create index idx_learning_sessions_started_at on learning_sessions(started_at);

-- enable row level security
alter table learning_sessions enable row level security;

-- create row level security policies
-- users can only access their own learning sessions
create policy "users can select their learning sessions" 
  on learning_sessions for select 
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert their learning sessions" 
  on learning_sessions for insert 
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their learning sessions" 
  on learning_sessions for update 
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their learning sessions" 
  on learning_sessions for delete 
  to authenticated
  using (user_id = auth.uid());
```

### Utworzenie schematu walidacji
2. Dodanie schematu walidacji w `src/lib/validation/schemas.ts`
```typescript
/**
 * Schema for validating learning session start requests
 */
export const startLearningSessionSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(20)
});

export type StartLearningSessionInput = z.infer<typeof startLearningSessionSchema>;
```

### Utworzenie serwisu dla sesji nauki
3. Utworzenie nowego pliku `src/lib/services/learning.service.ts`
```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UUID,
  StartLearningSessionResponseDto,
  LearningSessionFlashcardDto
} from "../../types";
import type { StartLearningSessionInput } from "../validation/schemas";

/**
 * Starts a new learning session and returns flashcards due for review
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param options - Optional limit parameter
 * @returns Object containing the session ID and flashcards for review
 */
export async function startLearningSession(
  supabase: SupabaseClient,
  userId: UUID,
  options: StartLearningSessionInput
): Promise<StartLearningSessionResponseDto> {
  // Create a new learning session
  const { data: sessionData, error: sessionError } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: userId,
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (sessionError) {
    throw new Error(`Failed to create learning session: ${sessionError.message}`);
  }

  const sessionId = sessionData.id;

  // Get flashcards due for review using the function
  const { data: flashcardsData, error: flashcardsError } = await supabase
    .rpc('get_cards_due_for_review', {
      p_user_id: userId,
      p_limit: options.limit
    });

  if (flashcardsError) {
    throw new Error(`Failed to get flashcards for review: ${flashcardsError.message}`);
  }

  // Convert database results to DTOs
  const flashcards: LearningSessionFlashcardDto[] = flashcardsData.map(card => ({
    id: card.card_id,
    front_content: card.front
  }));

  // Update the session with the number of flashcards
  await supabase
    .from('learning_sessions')
    .update({ flashcards_count: flashcards.length })
    .eq('id', sessionId);

  return {
    session_id: sessionId,
    flashcards
  };
}
```

### Implementacja endpointu API
4. Utworzenie endpoint API w `src/pages/api/learning/sessions.ts`
```typescript
import { startLearningSessionSchema } from "../../../lib/validation/schemas";
import { startLearningSession } from "../../../lib/services/learning.service";
import { error } from "../../../lib/utils";
import { z } from "zod";

export const prerender = false;

export async function POST({ request, locals }) {
  try {
    // Ensure user is authenticated
    const userId = locals.userId;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = startLearningSessionSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Start learning session
    const result = await startLearningSession(
      locals.supabase,
      userId,
      validationResult.data
    );

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error starting learning session:", err);
    return new Response(
      JSON.stringify({ error: "Failed to start learning session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

### Testy
5. Testowanie endpointu:
   - Testy jednostkowe dla funkcji serwisowych
   - Testy integracyjne dla pełnego przepływu API
   - Testy wydajnościowe, szczególnie dla dużych zbiorów danych

### Dokumentacja
6. Aktualizacja dokumentacji API
   - Dodanie nowego endpointu do dokumentacji OpenAPI/Swagger
   - Uzupełnienie przykładów użycia 