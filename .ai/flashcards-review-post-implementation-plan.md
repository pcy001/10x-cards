# API Endpoint Implementation Plan: Review Flashcard

## 1. Przegląd punktu końcowego
Endpoint umożliwia przesłanie recenzji fiszki po nauce. Aktualizuje historię interakcji użytkownika z fiszką oraz oblicza następną datę przeglądu na podstawie algorytmu powtórek z odstępami czasowymi.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards/{id}/review`
- Parametry ścieżki:
  - `id` (UUID): Identyfikator fiszki do przeglądu
- Request Body:
  ```json
  {
    "difficulty_rating": "string", // "nie_pamietam", "trudne", "srednie", "latwe"
    "is_correct": "boolean",
    "session_id": "uuid"
  }
  ```

## 3. Wykorzystywane typy
```typescript
// DTO dla żądania przeglądu fiszki
export interface ReviewFlashcardDto {
  difficulty_rating: DifficultyRating;
  is_correct: boolean;
  session_id: UUID;
}

// Schemat walidacji przeglądu fiszki
export const reviewFlashcardSchema = z.object({
  difficulty_rating: z.enum(["nie_pamietam", "trudne", "srednie", "latwe"]),
  is_correct: z.boolean(),
  session_id: z.string().uuid("Session ID must be a valid UUID")
});

export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;

// DTO dla odpowiedzi przeglądu fiszki
export interface ReviewFlashcardResponseDto {
  next_review_date: Timestamp;
}
```

## 4. Szczegóły odpowiedzi
- Status: 200 OK
- Body:
  ```json
  {
    "next_review_date": "timestamp"
  }
  ```
- Potencjalne kody błędów:
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Użytkownik nie jest zalogowany
  - 404 Not Found: Fiszka o podanym ID nie istnieje lub nie należy do użytkownika

## 5. Przepływ danych
1. Żądanie trafia do endpointu `/api/flashcards/{id}/review`
2. Middleware Astro weryfikuje autentykację użytkownika
3. Kontroler waliduje parametry żądania przy użyciu schematu Zod
4. Serwis sprawdza, czy fiszka istnieje i należy do aktualnego użytkownika
5. Serwis zapisuje nowy rekord przeglądu w tabeli `flashcard_reviews`
6. Serwis oblicza następną datę przeglądu na podstawie algorytmu powtórek z odstępami czasowymi
7. Serwis aktualizuje licznik poprawnych odpowiedzi w tabeli `flashcards` (jeśli odpowiedź jest poprawna)
8. Kontroler zwraca następną datę przeglądu jako odpowiedź

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**: Weryfikacja sesji użytkownika Supabase przed przetworzeniem żądania
2. **Autoryzacja**: Sprawdzenie, czy fiszka należy do zalogowanego użytkownika
3. **Walidacja danych**: Użycie Zod do walidacji parametrów żądania zgodnie ze schematem
4. **Sanityzacja danych**: Zabezpieczenie przed SQL injection poprzez używanie parametryzowanych zapytań Supabase
5. **Bezpieczeństwo sesji**: Weryfikacja, czy `session_id` należy do aktualnego użytkownika

## 7. Obsługa błędów
1. **Nieprawidłowe dane wejściowe**:
   - Kod: 400 Bad Request
   - Odpowiedź: Szczegóły błędów walidacji Zod
2. **Nieautoryzowany dostęp**:
   - Kod: 401 Unauthorized
   - Odpowiedź: `{ "error": "Authentication required" }`
3. **Fiszka nie znaleziona**:
   - Kod: 404 Not Found
   - Odpowiedź: `{ "error": "Flashcard not found" }`
4. **Fiszka należy do innego użytkownika**:
   - Kod: 404 Not Found
   - Odpowiedź: `{ "error": "Flashcard not found" }`
5. **Sesja nie istnieje lub nie należy do użytkownika**:
   - Kod: 400 Bad Request
   - Odpowiedź: `{ "error": "Invalid session" }`
6. **Błędy serwera**:
   - Kod: 500 Internal Server Error
   - Odpowiedź: `{ "error": "Internal server error", "message": "[opis błędu]" }`

## 8. Rozważania dotyczące wydajności
1. Dodawanie odpowiednich indeksów w bazie danych:
   - Indeks na `flashcard_id` w tabeli `flashcard_reviews` dla szybkiego wyszukiwania
   - Indeks na `user_id` w tabeli `flashcards` dla szybkiego filtrowania
2. Optymalizacja zapytań do bazy danych:
   - Używanie pojedynczego zapytania do sprawdzenia istnienia fiszki i jej właściciela
   - Używanie transakcji dla spójności danych przy zapisie przeglądu i aktualizacji licznika

## 9. Etapy wdrożenia

### 1. Utworzenie schematu walidacji
```typescript
// src/lib/validation/schemas.ts
export const reviewFlashcardSchema = z.object({
  difficulty_rating: z.enum(["nie_pamietam", "trudne", "srednie", "latwe"]),
  is_correct: z.boolean(),
  session_id: z.string().uuid("Session ID must be a valid UUID")
});

export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
```

### 2. Implementacja funkcji usługi w serwisie
```typescript
// src/lib/services/flashcard.service.ts

/**
 * Submits a review for a flashcard and calculates the next review date
 * 
 * @param supabase - The authenticated Supabase client instance
 * @param userId - The ID of the user submitting the review
 * @param flashcardId - The ID of the flashcard being reviewed
 * @param reviewData - The review data including difficulty rating and correctness
 * @returns The calculated next review date
 * @throws Error if flashcard not found or database operation fails
 */
export async function reviewFlashcard(
  supabase: SupabaseClient,
  userId: UUID,
  flashcardId: UUID,
  reviewData: ReviewFlashcardInput
): Promise<{ next_review_date: Timestamp }> {
  try {
    // First, check if flashcard exists and belongs to the user
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();
    
    if (flashcardError || !flashcard) {
      throw new Error("Flashcard not found");
    }
    
    // Verify that the session exists and belongs to the user (if needed)
    // This step depends on how your learning sessions are implemented
    
    // Calculate next review date based on difficulty rating
    let nextReviewDate: Date;
    const now = new Date();
    
    switch (reviewData.difficulty_rating) {
      case "nie_pamietam":
        // Review again tomorrow
        nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + 1);
        break;
      case "trudne":
        // Review in 2 days
        nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + 2);
        break;
      case "srednie":
        // Review in 4 days
        nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + 4);
        break;
      case "latwe":
        // Review in 7 days
        nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + 7);
        break;
      default:
        // Default to tomorrow
        nextReviewDate = new Date(now);
        nextReviewDate.setDate(now.getDate() + 1);
    }
    
    // Begin a transaction
    const { data, error } = await supabase.rpc('submit_flashcard_review', {
      p_flashcard_id: flashcardId,
      p_is_correct: reviewData.is_correct,
      p_difficulty_rating: reviewData.difficulty_rating,
      p_next_review_date: nextReviewDate.toISOString(),
      p_session_id: reviewData.session_id
    });
    
    if (error) {
      throw new Error(`Failed to submit review: ${error.message}`);
    }
    
    // Return the next review date
    return { next_review_date: nextReviewDate.toISOString() };
  } catch (error) {
    console.error("Error reviewing flashcard:", error);
    throw error;
  }
}
```

### 3. Utworzenie funkcji RPC w Supabase
```sql
-- W konsoli SQL Supabase

CREATE OR REPLACE FUNCTION submit_flashcard_review(
  p_flashcard_id UUID,
  p_is_correct BOOLEAN,
  p_difficulty_rating difficulty_rating,
  p_next_review_date TIMESTAMP WITH TIME ZONE,
  p_session_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Insert review record
  INSERT INTO flashcard_reviews (
    flashcard_id,
    is_correct,
    difficulty_rating,
    next_review_date
  ) VALUES (
    p_flashcard_id,
    p_is_correct,
    p_difficulty_rating,
    p_next_review_date
  );
  
  -- Update correct answers count if the answer was correct
  IF p_is_correct THEN
    UPDATE flashcards
    SET correct_answers_count = correct_answers_count + 1
    WHERE id = p_flashcard_id;
  END IF;
  
  -- Optionally update learning session record if needed
  
  -- Return success
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Implementacja endpointu w Astro
```typescript
// src/pages/api/flashcards/[id]/review.ts
import type { APIRoute } from "astro";
import { reviewFlashcardSchema } from "../../../../lib/validation/schemas";
import { reviewFlashcard } from "../../../../lib/services/flashcard.service";

export const prerender = false;

/**
 * POST handler for submitting a flashcard review
 * Records user feedback and calculates next review date
 */
export const POST: APIRoute = async ({ request, params, locals }) => {
  // Check authentication
  const supabase = locals.supabase;
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = sessionData.session.user.id;
  const flashcardId = params.id;

  // Validate flashcard ID
  if (!flashcardId) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = reviewFlashcardSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process the review
    const response = await reviewFlashcard(supabase, userId, flashcardId, result.data);

    // Return the next review date
    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error processing flashcard review:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      if (error.message === "Invalid session") {
        return new Response(JSON.stringify({ error: "Invalid session" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Generic server error
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

### 5. Testy jednostkowe
1. Test walidacji danych wejściowych
2. Test kalkulacji następnej daty przeglądu
3. Test autoryzacji i dostępu do fiszek
4. Test obsługi błędów dla różnych scenariuszy
5. Test integracji z bazą danych

### 6. Testy integracyjne
1. Test pełnego przepływu przeglądu fiszki
2. Test aktualizacji licznika poprawnych odpowiedzi
3. Test odrzucania nieprawidłowych wartości trudności
4. Test działania endpointu z i bez sesji użytkownika

### 7. Dokumentacja
1. Aktualizacja dokumentacji API
2. Dodanie przykładów użycia w dokumentacji
3. Dokumentacja wewnętrzna kodu 