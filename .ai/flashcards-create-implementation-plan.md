# Implementacja endpointu POST /api/flashcards

## 1. Opis funkcjonalności

Endpoint `/api/flashcards` umożliwia ręczne tworzenie nowych fiszek przez użytkownika. Użytkownik może wprowadzić treść przodu (front_content) i tyłu (back_content) fiszki, która zostanie zapisana w jego kolekcji.

## 2. Szczegóły endpointu

- **Metoda**: POST
- **Ścieżka**: `/api/flashcards`
- **Opis**: Tworzy nową fiszkę manualnie dodaną przez użytkownika
- **Autoryzacja**: Wymagane uwierzytelnienie użytkownika

### 2.1. Request

```typescript
interface CreateFlashcardRequest {
  front_content: string; // Maksymalnie 500 znaków
  back_content: string;  // Maksymalnie 200 znaków
}
```

### 2.2. Response

```typescript
interface CreateFlashcardResponse {
  id: string;
  front_content: string;
  back_content: string;
  is_ai_generated: boolean; // Zawsze false dla ręcznie dodawanych fiszek
  created_at: string;
  correct_answers_count: number; // Zawsze 0 dla nowych fiszek
}
```

### 2.3. Kody odpowiedzi

- **201 Created**: Fiszka została pomyślnie utworzona
- **400 Bad Request**: Nieprawidłowe dane wejściowe (np. przekroczenie limitu znaków)
- **401 Unauthorized**: Użytkownik nie jest uwierzytelniony
- **500 Internal Server Error**: Błąd serwera

## 3. Walidacja

### 3.1. Walidacja wejścia

Dane wejściowe muszą spełniać następujące kryteria:
- `front_content`: wymagane, maksymalnie 500 znaków
- `back_content`: wymagane, maksymalnie 200 znaków

Walidacja zostanie zaimplementowana przy użyciu biblioteki zod:

```typescript
import { z } from "zod";

export const createFlashcardSchema = z.object({
  front_content: z.string().min(1, "Przód fiszki jest wymagany").max(500, "Maksymalna długość to 500 znaków"),
  back_content: z.string().min(1, "Tył fiszki jest wymagany").max(200, "Maksymalna długość to 200 znaków"),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
```

## 4. Implementacja

### 4.1. Struktura plików

- `/src/pages/api/flashcards.ts` - Endpoint Astro do obsługi żądań POST
- `/src/lib/services/flashcards.service.ts` - Serwis zawierający logikę biznesową
- `/src/lib/validation/schemas.ts` - Schemat walidacji

### 4.2. Implementacja endpointu

```typescript
// src/pages/api/flashcards.ts
import type { APIRoute } from "astro";
import { createFlashcardSchema } from "../../lib/validation/schemas";
import { createFlashcard } from "../../lib/services/flashcards.service";
import { fromZodError } from "zod-validation-error";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź, czy użytkownik jest zalogowany
    const supabase = locals.supabase;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Pobierz dane z żądania
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const result = createFlashcardSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Przekaż dane do serwisu
    const userId = session.user.id;
    const flashcard = await createFlashcard(supabase, userId, result.data);
    
    // Zwróć odpowiedź
    return new Response(
      JSON.stringify(flashcard),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

### 4.3. Implementacja serwisu

```typescript
// src/lib/services/flashcards.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UUID } from "../../types";
import type { CreateFlashcardInput } from "../validation/schemas";

/**
 * Tworzy nową fiszkę w bazie danych
 * 
 * @param supabase - Instancja klienta Supabase
 * @param userId - ID zalogowanego użytkownika
 * @param data - Dane fiszki (front_content, back_content)
 * @returns Utworzona fiszka wraz z ID i dodatkowymi polami
 * @throws Error jeśli operacja nie powiedzie się
 */
export async function createFlashcard(
  supabase: SupabaseClient,
  userId: UUID,
  data: CreateFlashcardInput
) {
  // Utwórz fiszkę w bazie danych
  const { data: flashcard, error } = await supabase
    .from("flashcards")
    .insert({
      user_id: userId,
      front_content: data.front_content,
      back_content: data.back_content,
      is_ai_generated: false,
      correct_answers_count: 0
    })
    .select("id, front_content, back_content, is_ai_generated, created_at, correct_answers_count")
    .single();
  
  // Obsłuż błędy
  if (error) {
    console.error("Error creating flashcard:", error);
    throw new Error(`Failed to create flashcard: ${error.message}`);
  }
  
  // Zwróć utworzoną fiszkę
  return flashcard;
}
```

### 4.4. Dodanie schematu walidacji

```typescript
// src/lib/validation/schemas.ts (dodać do istniejącego pliku)
export const createFlashcardSchema = z.object({
  front_content: z.string().min(1, "Przód fiszki jest wymagany").max(500, "Maksymalna długość to 500 znaków"),
  back_content: z.string().min(1, "Tył fiszki jest wymagany").max(200, "Maksymalna długość to 200 znaków"),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
```

## 5. Testy

### 5.1. Przypadki testowe

1. **Udane utworzenie fiszki**: Użytkownik podaje poprawne dane, fiszka zostaje utworzona.
2. **Błąd walidacji - za długi tekst**: Użytkownik wprowadza zbyt długi tekst, otrzymuje błąd 400.
3. **Błąd walidacji - brak wymaganych pól**: Użytkownik nie wprowadza wymaganych danych, otrzymuje błąd 400.
4. **Brak autoryzacji**: Niezalogowany użytkownik próbuje utworzyć fiszkę, otrzymuje błąd 401.

### 5.2. Przykład testu

```typescript
// Przykład testu dla serwisu createFlashcard
describe("createFlashcard", () => {
  it("should create a flashcard successfully", async () => {
    // Arrange
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "123",
          front_content: "Test front",
          back_content: "Test back",
          is_ai_generated: false,
          created_at: "2023-01-01T00:00:00Z",
          correct_answers_count: 0
        },
        error: null
      })
    };
    
    const userId = "user-123";
    const data = {
      front_content: "Test front",
      back_content: "Test back"
    };
    
    // Act
    const result = await createFlashcard(mockSupabase as any, userId, data);
    
    // Assert
    expect(result).toEqual({
      id: "123",
      front_content: "Test front",
      back_content: "Test back",
      is_ai_generated: false,
      created_at: "2023-01-01T00:00:00Z",
      correct_answers_count: 0
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: userId,
      front_content: "Test front",
      back_content: "Test back",
      is_ai_generated: false,
      correct_answers_count: 0
    });
  });
});
```

## 6. Integracja z frontendem

Endpoint będzie wykorzystywany przez komponent formularza dodawania fiszek, który znajduje się w widoku `/flashcards/create`. Formularz będzie zawierał dwa pola tekstowe (dla przodu i tyłu fiszki) oraz przycisk do zapisania.

Po pomyślnym zapisaniu fiszki, użytkownik zostanie przekierowany do widoku listy wszystkich fiszek z komunikatem o pomyślnym dodaniu. 