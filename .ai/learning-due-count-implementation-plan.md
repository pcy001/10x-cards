# API Endpoint Implementation Plan: Get Due Flashcards Count

## 1. Przegląd punktu końcowego
Endpoint `/api/learning/due-count` dostarcza użytkownikowi statystyki dotyczące liczby fiszek oczekujących na powtórkę. Pozwala to na planowanie sesji nauki i oferuje przegląd nadchodzących powtórek, co wspiera regularne korzystanie z aplikacji i efektywne uczenie się.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/learning/due-count`
- Parametry:
  - Wymagane: żadne
  - Opcjonalne: żadne
- Nagłówki:
  - Authorization: Bearer token (wymagany dla uwierzytelnienia użytkownika)

## 3. Wykorzystywane typy
```typescript
// Istniejące typy (z src/types.ts)
import type { UUID, DueFlashcardsCountResponseDto, DailyDueCountDto } from "../../types";

// Nowy typ wejściowy dla serwisu (do zdefiniowania w src/lib/services/learning.service.ts)
interface GetDueCountInput {
  userId: UUID;
  today: Date;
}

// Nowy typ wyjściowy dla serwisu (do zdefiniowania w src/lib/services/learning.service.ts)
interface GetDueCountResult {
  dueToday: number;
  dueNextWeek: {
    total: number;
    byDay: Array<{
      date: string; // YYYY-MM-DD
      count: number;
    }>;
  };
}
```

## 4. Szczegóły odpowiedzi
- Kod statusu: 200 OK
- Format odpowiedzi:
  ```json
  {
    "due_today": 5,
    "due_next_week": {
      "total": 23,
      "by_day": [
        {
          "date": "2024-05-31",
          "count": 3
        },
        {
          "date": "2024-06-01",
          "count": 5
        },
        /* pozostałe dni tygodnia */
      ]
    }
  }
  ```
- Kody błędów:
  - 401 Unauthorized - brak tokenu uwierzytelniającego lub token wygasł

## 5. Przepływ danych
1. Żądanie trafia do Astro API endpoint `/api/learning/due-count.ts`
2. Middleware Astro weryfikuje token JWT i dodaje `user` do `context.locals`
3. Endpoint pobiera userId z `context.locals.user.id`
4. Wywołuje service `getLearningDueCount` z `src/lib/services/learning.service.ts`
5. Service wykonuje dwa zapytania do bazy danych używając Supabase:
   - Zapytanie o liczbę fiszek zaplanowanych na dzisiaj
   - Zapytanie o liczbę fiszek zaplanowanych na kolejne 7 dni, pogrupowanych po dniach
6. Service formatuje dane z bazy danych na format zgodny z DTO odpowiedzi
7. Endpoint przekształca wynik service na format JSON odpowiedzi
8. Odpowiedź jest zwracana do klienta

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**: 
   - Wymagana weryfikacja tokenu JWT przez middleware Astro
   - Token musi być ważny i nieprzeterminowany

2. **Autoryzacja**:
   - RLS (Row Level Security) w Supabase zapewnia, że użytkownik widzi tylko swoje dane
   - Dodatkowa weryfikacja w zapytaniach SQL (filtrowanie po `user_id`)

3. **Bezpieczeństwo danych**:
   - Brak wrażliwych danych w odpowiedzi (tylko liczby)
   - Filtrowanie danych po `user_id` w zapytaniach SQL zapobiega wyciekom danych

## 7. Obsługa błędów
1. **Brak uwierzytelnienia**:
   - Kod statusu: 401 Unauthorized
   - Wiadomość: "Unauthorized access. Please login to continue."

2. **Błąd bazy danych**:
   - Logowanie błędu z pełnymi szczegółami na serwerze
   - Zwrot ogólnego komunikatu użytkownikowi
   - Kod statusu: 500 Internal Server Error
   - Wiadomość: "An error occurred while fetching due flashcards count."

3. **Wyjątki w kodzie**:
   - Obsługa try/catch w endpoint i service
   - Zwrot odpowiedniego komunikatu o błędzie

## 8. Rozważania dotyczące wydajności
1. **Optymalizacja bazy danych**:
   - Indeks na kolumnie `next_review_date` w tabeli `flashcard_reviews`
   - Indeks na kolumnie `flashcard_id` w tabeli `flashcard_reviews`
   - Używanie agregacji po stronie bazy danych zamiast w aplikacji

2. **Buforowanie**:
   - Możliwość implementacji cache po stronie klienta (Cache-Control header)
   - Wyniki można buforować na 5-15 minut bez istotnego wpływu na UX

3. **Minimalizacja danych**:
   - Pobieranie tylko niezbędnych danych z bazy
   - Używanie COUNT zamiast pobierania pełnych rekordów

## 9. Etapy wdrożenia

### 1. Utworzenie serwisu do obsługi statystyk nauki
1. Utwórz plik `src/lib/services/learning.service.ts`
2. Zaimplementuj funkcję `getDueFlashcardsCount`

```typescript
// src/lib/services/learning.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UUID } from "../../types";

export interface GetDueCountInput {
  userId: UUID;
  today: Date;
}

export interface GetDueCountResult {
  dueToday: number;
  dueNextWeek: {
    total: number;
    byDay: Array<{
      date: string; // YYYY-MM-DD
      count: number;
    }>;
  };
}

/**
 * Gets count of flashcards due for review today and in the next week
 *
 * @param supabase - The authenticated Supabase client instance
 * @param input - Object containing userId and today's date
 * @returns Count of flashcards due today and by day for the next week
 * @throws Error if the database operation fails
 */
export async function getDueFlashcardsCount(
  supabase: SupabaseClient,
  input: GetDueCountInput
): Promise<GetDueCountResult> {
  try {
    const { userId, today } = input;
    
    // Format today as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate tomorrow and 7 days from today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Format dates for queries
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Query 1: Get count of flashcards due today
    const { count: dueTodayCount, error: todayError } = await supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_correct', true)
      .lte('next_review_date', `${todayStr}T23:59:59`)
      .in('flashcard_id', function(query) {
        return query
          .select('id')
          .from('flashcards')
          .eq('user_id', userId);
      });
      
    if (todayError) {
      throw new Error(`Failed to fetch due today count: ${todayError.message}`);
    }
    
    // Query 2: Get count of flashcards due in the next week, grouped by day
    const { data: nextWeekData, error: weekError } = await supabase.rpc(
      'get_due_flashcards_by_day',
      { 
        p_user_id: userId,
        p_start_date: tomorrowStr,
        p_end_date: nextWeekStr
      }
    );
    
    if (weekError) {
      throw new Error(`Failed to fetch next week due counts: ${weekError.message}`);
    }
    
    // Calculate total for next week
    const nextWeekTotal = nextWeekData.reduce((sum, day) => sum + day.count, 0);
    
    // Format the response
    return {
      dueToday: dueTodayCount || 0,
      dueNextWeek: {
        total: nextWeekTotal,
        byDay: nextWeekData.map(day => ({
          date: day.date,
          count: day.count
        }))
      }
    };
  } catch (error) {
    console.error("Error fetching due flashcards count:", error);
    throw error;
  }
}
```

### 2. Utworzenie funkcji SQL w bazie danych
Dodaj funkcję do grupowania fiszek po dniach (do uruchomienia w konsoli Supabase SQL Editor):

```sql
-- Function to get flashcards due by day for a specific date range
CREATE OR REPLACE FUNCTION get_due_flashcards_by_day(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date TEXT,
  count BIGINT
) AS $$
DECLARE
  curr_date DATE := p_start_date;
BEGIN
  -- For each day in the range, count flashcards due on that day
  WHILE curr_date <= p_end_date LOOP
    RETURN QUERY
    SELECT 
      TO_CHAR(curr_date, 'YYYY-MM-DD') as date,
      COUNT(fr.id)::BIGINT as count
    FROM flashcard_reviews fr
    JOIN flashcards f ON fr.flashcard_id = f.id
    WHERE 
      f.user_id = p_user_id
      AND fr.is_correct = TRUE
      AND DATE(fr.next_review_date) = curr_date;
      
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 3. Utworzenie schematu walidacji (opcjonalnie)
Ponieważ endpoint nie przyjmuje parametrów, schemat walidacji nie jest konieczny.

### 4. Implementacja endpointu API
1. Utwórz strukturę katalogów `src/pages/api/learning` jeśli nie istnieje
2. Utwórz plik `src/pages/api/learning/due-count.ts`

```typescript
// src/pages/api/learning/due-count.ts
import type { APIContext } from "astro";
import { getDueFlashcardsCount } from "../../../lib/services/learning.service";
import type { DueFlashcardsCountResponseDto } from "../../../types";

// Disable prerendering for dynamic API endpoint
export const prerender = false;

export async function GET(
  context: APIContext
): Promise<Response> {
  try {
    // Check if user is authenticated (handled by middleware)
    const user = context.locals.user;
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access. Please login to continue." }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Get user ID from authorized user
    const userId = user.id;
    
    // Use current date for the query
    const today = new Date();
    
    // Call service function to get due counts
    const result = await getDueFlashcardsCount(context.locals.supabase, {
      userId,
      today
    });
    
    // Transform service result to API response format
    const response: DueFlashcardsCountResponseDto = {
      due_today: result.dueToday,
      due_next_week: {
        total: result.dueNextWeek.total,
        by_day: result.dueNextWeek.byDay.map(day => ({
          date: day.date,
          count: day.count
        }))
      }
    };
    
    // Return successful response
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=300" // Allow 5 min caching
        }
      }
    );
  } catch (error) {
    // Log the error server-side with full details
    console.error("Error handling due-count request:", error);
    
    // Return generic error to the client
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while fetching due flashcards count." 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
```

### 5. Testy endpointu
1. Napisz testy jednostkowe dla funkcji `getDueFlashcardsCount`
2. Napisz testy integracyjne dla endpoint `/api/learning/due-count`
3. Przeprowadź testy manualne z różnymi scenariuszami:
   - Użytkownik bez zaplanowanych fiszek
   - Użytkownik z fiszkami zaplanowanymi na dzisiaj
   - Użytkownik z fiszkami zaplanowanymi na kolejne dni
   - Próba dostępu bez uwierzytelnienia 