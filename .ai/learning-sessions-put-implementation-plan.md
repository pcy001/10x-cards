# API Endpoint Implementation Plan: End Learning Session

## 1. Przegląd punktu końcowego
Endpoint umożliwia użytkownikowi zakończenie aktywnej sesji nauki i otrzymanie podsumowania statystyk dotyczących przebiegu sesji. Aktualizuje sesję nauki w bazie danych oznaczając ją jako zakończoną oraz oblicza i zwraca statystyki dotyczące przeglądu fiszek podczas sesji.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/learning/sessions/{session_id}`
- Parametry:
  - Wymagane:
    - `session_id` (jako parametr ścieżki URL) - identyfikator sesji nauki do zakończenia
  - Opcjonalne: Brak
- Request Body: Brak (zakończenie sesji nie wymaga dodatkowych danych)

## 3. Wykorzystywane typy
1. **SessionSummaryDto**
   ```typescript
   export interface SessionSummaryDto {
     flashcards_reviewed: number;
     correct_answers: number;
     incorrect_answers: number;
     completion_percentage: number;
     duration_seconds: number;
   }
   ```

2. **EndLearningSessionResponseDto**
   ```typescript
   export interface EndLearningSessionResponseDto {
     session_summary: SessionSummaryDto;
   }
   ```

3. **Zod Schema** dla walidacji parametrów ścieżki
   ```typescript
   export const sessionIdParamSchema = z.object({
     session_id: z.string().uuid()
   });
   
   export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;
   ```

## 4. Szczegóły odpowiedzi
- Struktura odpowiedzi:
  ```json
  {
    "session_summary": {
      "flashcards_reviewed": 10,
      "correct_answers": 8,
      "incorrect_answers": 2,
      "completion_percentage": 80,
      "duration_seconds": 300
    }
  }
  ```
- Kody statusu:
  - 200 OK: Sesja nauki została pomyślnie zakończona i statystyki zostały obliczone
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 404 Not Found: Sesja nauki o podanym ID nie istnieje lub nie należy do użytkownika
  - 500 Internal Server Error: Błąd serwera podczas przetwarzania żądania

## 5. Przepływ danych
1. Odbieranie żądania PUT na endpoint `/api/learning/sessions/{session_id}`
2. Walidacja parametru `session_id` za pomocą schematu Zod
3. Pobranie kontekstu użytkownika z tokenu JWT (Supabase Auth)
4. Sprawdzenie, czy sesja nauki istnieje i należy do użytkownika
5. Oznaczenie sesji jako zakończonej poprzez aktualizację kolumny `ended_at` w tabeli `learning_sessions`
6. Obliczenie statystyk sesji:
   - Liczba przeglądniętych fiszek
   - Liczba poprawnych odpowiedzi
   - Liczba niepoprawnych odpowiedzi
   - Procent ukończenia (przeglądnięte / całkowita liczba)
   - Czas trwania sesji w sekundach (różnica między `started_at` i `ended_at`)
7. Zwrócenie podsumowania statystyk w formacie JSON

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**: Wymaga ważnego tokenu JWT
2. **Autoryzacja**: Dostęp tylko do sesji nauki należących do uwierzytelnionego użytkownika (poprzez Row Level Security w Supabase)
3. **Walidacja danych**: Parametr `session_id` jest walidowany za pomocą Zod przed przetworzeniem
4. **Izolacja danych**: Systemy RLS Supabase zapewniają, że użytkownik ma dostęp wyłącznie do własnych danych

## 7. Obsługa błędów
1. **401 Unauthorized**: Brak ważnego tokenu JWT lub token wygasł
2. **404 Not Found**: Sesja nauki o podanym ID nie istnieje lub nie należy do użytkownika
3. **500 Internal Server Error**: Błędy bazy danych lub nieprzewidziane wyjątki
4. Wszystkie błędy powinny być logowane dla celów debugowania

## 8. Rozważania dotyczące wydajności
1. **Indeksy bazy danych**: Upewnienie się, że istnieje indeks na kolumnie `id` w tabeli `learning_sessions` dla szybkiego wyszukiwania
2. **Optymalizacja zapytań**: Użycie pojedynczego zapytania SQL do obliczenia wszystkich statystyk
3. **Cachowanie**: Rozważenie cachowania statystyk sesji, jeśli endpoint jest często używany
4. **Transakcje**: Użycie transakcji do aktualizacji sesji i obliczenia statystyk dla zapewnienia spójności danych

## 9. Etapy wdrożenia

### 1. Rozszerzenie schematu walidacji
Dodanie schematu walidacji w `src/lib/validation/schemas.ts`:
```typescript
/**
 * Schema for validating session ID path parameter
 */
export const sessionIdParamSchema = z.object({
  session_id: z.string().uuid()
});

export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;
```

### 2. Rozszerzenie serwisu dla sesji nauki
Dodanie nowej funkcji w `src/lib/services/learning.service.ts`:
```typescript
/**
 * Ends a learning session and calculates summary statistics
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param sessionId - The ID of the learning session to end
 * @returns Object containing session summary statistics
 */
export async function endLearningSession(
  supabase: SupabaseClient,
  userId: UUID,
  sessionId: UUID
): Promise<EndLearningSessionResponseDto> {
  // Check if the session exists and belongs to the user
  const { data: sessionData, error: sessionError } = await supabase
    .from('learning_sessions')
    .select('id, started_at, flashcards_count')
    .match({ id: sessionId, user_id: userId })
    .single();

  if (sessionError) {
    if (sessionError.code === 'PGRST116') {
      throw new Error(`Session not found: ${sessionId}`);
    }
    throw new Error(`Failed to get learning session: ${sessionError.message}`);
  }

  const endedAt = new Date();
  
  // Update the session to mark it as ended
  const { error: updateError } = await supabase
    .from('learning_sessions')
    .update({
      ended_at: endedAt.toISOString()
    })
    .eq('id', sessionId);

  if (updateError) {
    throw new Error(`Failed to update learning session: ${updateError.message}`);
  }

  // Get flashcard review statistics for this session
  const { data: reviewStats, error: reviewStatsError } = await supabase
    .from('flashcard_reviews')
    .select('is_correct')
    .gte('review_date', sessionData.started_at)
    .lte('review_date', endedAt.toISOString())
    .eq('user_id', userId);

  if (reviewStatsError) {
    throw new Error(`Failed to get review statistics: ${reviewStatsError.message}`);
  }

  // Calculate statistics
  const flashcardsReviewed = reviewStats.length;
  const correctAnswers = reviewStats.filter(review => review.is_correct).length;
  const incorrectAnswers = flashcardsReviewed - correctAnswers;
  const completionPercentage = sessionData.flashcards_count > 0 
    ? Math.round((flashcardsReviewed / sessionData.flashcards_count) * 100) 
    : 0;
  
  // Calculate duration in seconds
  const startedAt = new Date(sessionData.started_at);
  const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

  // Update the session with the calculated statistics
  await supabase
    .from('learning_sessions')
    .update({
      flashcards_reviewed: flashcardsReviewed,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers
    })
    .eq('id', sessionId);

  return {
    session_summary: {
      flashcards_reviewed: flashcardsReviewed,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      completion_percentage: completionPercentage,
      duration_seconds: durationSeconds
    }
  };
}
```

### 3. Implementacja endpointu API
Utworzenie pliku `src/pages/api/learning/sessions/[session_id].ts`:
```typescript
import { sessionIdParamSchema } from "../../../../lib/validation/schemas";
import { endLearningSession } from "../../../../lib/services/learning.service";
import { EndLearningSessionResponseDto } from "../../../../types";
import { createServerError, createNotFoundError } from "../../../../lib/errors";
import type { APIContext } from "astro";

export const prerender = false;

/**
 * End a learning session (PUT)
 */
export async function PUT({ params, locals }: APIContext): Promise<Response> {
  // Get Supabase client from context
  const supabase = locals.supabase;
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    // Validate session_id parameter
    const result = sessionIdParamSchema.safeParse(params);
    
    if (!result.success) {
      return new Response(JSON.stringify({ message: "Invalid session ID", errors: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const { session_id } = result.data;
    
    try {
      // End the learning session and get summary
      const response: EndLearningSessionResponseDto = await endLearningSession(
        supabase,
        user.id,
        session_id
      );
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message.includes("Session not found")) {
        return createNotFoundError("Learning session not found");
      }
      
      // Handle other errors
      console.error("Error ending learning session:", error);
      return createServerError("Failed to end learning session");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return createServerError("An unexpected error occurred");
  }
}
```

### 4. Aktualizacja funkcji pomocniczych dla obsługi błędów
Upewnij się, że masz funkcje pomocnicze do tworzenia odpowiedzi z błędami w `src/lib/errors.ts`:
```typescript
/**
 * Creates a 404 Not Found error response
 */
export function createNotFoundError(message: string = "Resource not found"): Response {
  return new Response(JSON.stringify({ message }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

/**
 * Creates a 500 Internal Server Error response
 */
export function createServerError(message: string = "Internal server error"): Response {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
```

### 5. Dodanie testów jednostkowych
Utworzenie pliku testów `src/__tests__/services/learning.service.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { endLearningSession } from '../../lib/services/learning.service';

// Mock data
const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockSessionId = '123e4567-e89b-12d3-a456-426614174001';
const mockStartedAt = '2023-05-01T10:00:00Z';
const mockEndedAt = '2023-05-01T10:30:00Z';

describe('endLearningSession', () => {
  it('should end a learning session and return summary statistics', async () => {
    // Mock the Supabase client
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockSessionId,
          started_at: mockStartedAt,
          flashcards_count: 10
        },
        error: null
      }),
      filter: vi.fn().mockReturnThis(),
    };
    
    // Mock date
    const mockDate = new Date(mockEndedAt);
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    // Mock the responses
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'learning_sessions') {
        return mockSupabase;
      } else if (table === 'flashcard_reviews') {
        // Mock 8 correct answers out of 10 reviews
        mockSupabase.select.mockReturnValueOnce({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: true },
                  { is_correct: false },
                  { is_correct: false }
                ],
                error: null
              })
            })
          })
        });
        return mockSupabase;
      }
      return mockSupabase;
    });
    
    // Execute the function
    const result = await endLearningSession(mockSupabase as any, mockUserId, mockSessionId);
    
    // Verify the result
    expect(result).toEqual({
      session_summary: {
        flashcards_reviewed: 10,
        correct_answers: 8,
        incorrect_answers: 2,
        completion_percentage: 100,
        duration_seconds: 1800
      }
    });
    
    // Verify that Supabase methods were called correctly
    expect(mockSupabase.from).toHaveBeenCalledWith('learning_sessions');
    expect(mockSupabase.match).toHaveBeenCalledWith({ id: mockSessionId, user_id: mockUserId });
    expect(mockSupabase.from).toHaveBeenCalledWith('flashcard_reviews');
    
    // Restore mocks
    vi.restoreAllMocks();
  });
  
  it('should throw an error when session is not found', async () => {
    // Mock the Supabase client with an error response
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })
    };
    
    // Execute and expect error
    await expect(endLearningSession(mockSupabase as any, mockUserId, mockSessionId))
      .rejects
      .toThrow('Session not found');
  });
});
```

### 6. Testowanie endpointu
Przetestowanie endpointu za pomocą narzędzia takiego jak Postman lub curl:
```bash
curl -X PUT \
  http://localhost:3000/api/learning/sessions/123e4567-e89b-12d3-a456-426614174001 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
``` 