# API Endpoint Implementation Plan: Login

## 1. Przegląd punktu końcowego

Endpoint `/api/auth/login` umożliwia uwierzytelnienie użytkownika przy użyciu adresu email i hasła, zwracając dane użytkownika wraz z tokenami sesji. Zapewnia on mechanizm logowania do aplikacji i uzyskiwania tokenów autoryzacyjnych potrzebnych do korzystania z chronionych endpointów API.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/login`
- **Parametry**:
  - Wymagane: brak
  - Opcjonalne: brak
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

## 3. Wykorzystywane typy

- **Schemat walidacji**:
  ```typescript
  // src/lib/validation/auth.schemas.ts
  export const loginUserSchema = z.object({
    email: z.string()
      .email("Podaj poprawny adres email")
      .min(1, "Email jest wymagany"),
    password: z.string()
      .min(1, "Hasło jest wymagane")
  });

  export type LoginUserInput = z.infer<typeof loginUserSchema>;
  ```

- **DTO**:
  ```typescript
  // src/types.ts (już zdefiniowane)
  export interface LoginDto {
    email: string;
    password: string;
  }

  export interface LoginResponseDto {
    user: {
      id: UUID;
      email: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: Timestamp;
    };
  }
  ```

- **Serwis**:
  ```typescript
  // src/lib/services/auth.service.ts (rozszerzenie istniejącego)
  /**
   * Uwierzytelnia użytkownika na podstawie adresu email i hasła
   *
   * @param supabase - Instancja klienta Supabase
   * @param email - Email użytkownika
   * @param password - Hasło użytkownika
   * @returns Dane uwierzytelnionego użytkownika i informacje o sesji
   * @throws Error jeśli logowanie się nie powiedzie
   */
  export async function loginUser(
    supabase: SupabaseClient,
    email: string,
    password: string
  ): Promise<LoginResponseDto> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (!data.user || !data.session) {
        throw new Error("No user or session data returned from authentication");
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      };
    } catch (error) {
      console.error("Error during user authentication:", error);
      throw error;
    }
  }
  ```

## 4. Szczegóły odpowiedzi

- **Status 200 OK** (Sukces):
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string",
      "expires_at": "timestamp"
    }
  }
  ```

- **Status 400 Bad Request** (Nieprawidłowe dane wejściowe):
  ```json
  {
    "error": "Invalid input",
    "details": {
      "fieldName": {
        "_errors": ["Komunikat błędu walidacji"]
      }
    }
  }
  ```

- **Status 401 Unauthorized** (Nieprawidłowe dane logowania):
  ```json
  {
    "error": "Authentication failed",
    "message": "Invalid email or password"
  }
  ```

- **Status 500 Internal Server Error** (Błąd serwera):
  ```json
  {
    "error": "Internal server error",
    "message": "Szczegóły błędu"
  }
  ```

## 5. Przepływ danych

1. Astro odbiera żądanie POST do `/api/auth/login`
2. Pobieranie klienta Supabase z kontekstu lokacji (`locals.supabase`)
3. Parsowanie i walidacja danych wejściowych przy użyciu schematu Zod
4. Przekazanie zwalidowanych danych do funkcji `loginUser` w `auth.service.ts`
5. Wywołanie Supabase Auth API z przekazanymi danymi uwierzytelniającymi
6. Konwersja odpowiedzi Supabase do formatu DTO zgodnego z API
7. Zwrot odpowiednio sformatowanej odpowiedzi JSON do klienta

## 6. Względy bezpieczeństwa

- **Walidacja danych wejściowych**: Wszystkie dane wejściowe są walidowane przy użyciu schematów Zod
- **Bezpieczne przechowywanie haseł**: Hasła są zarządzane przez Supabase Auth i nigdy nie są przechowywane w aplikacji
- **Tokenizacja**: Używanie tokenów JWT do zarządzania sesjami
- **Obsługa błędów**: Ogólne komunikaty o błędach uwierzytelniania, aby zapobiec wyciekowi informacji
- **HTTPS**: Wszystkie komunikacje powinny odbywać się przez HTTPS
- **Rate limiting**: Rozważ dodanie ograniczenia liczby prób logowania, aby zapobiec atakom brute-force

## 7. Obsługa błędów

- **Nieprawidłowe dane wejściowe**: Walidacja Zod, zwraca 400 Bad Request
- **Nieprawidłowe dane uwierzytelniające**: Obsługa błędów Supabase, zwraca 401 Unauthorized
- **Użytkownik nie istnieje**: Obsługa błędów Supabase, zwraca 401 Unauthorized
- **Wewnętrzne błędy serwera**: Przechwytywanie i rejestrowanie wszelkich nieobsługiwanych błędów, zwraca 500 Internal Server Error

## 8. Rozważania dotyczące wydajności

- **Pamięć podręczna sesji**: Supabase obsługuje pamięć podręczną sesji po stronie klienta
- **Wygasanie sesji**: Tokeny sesji mają ograniczony czas ważności dla bezpieczeństwa
- **Tokeny odświeżania**: Implementacja mechanizmu odświeżania tokenów w middleware
- **Monitorowanie**: Rejestrowanie nieudanych prób logowania w celach bezpieczeństwa i analityki

## 9. Etapy wdrożenia

1. Rozszerzenie schematu walidacji w `src/lib/validation/auth.schemas.ts` o schemat logowania
2. Dodanie funkcji `loginUser` do `src/lib/services/auth.service.ts`
3. Utworzenie endpointu API w `src/pages/api/auth/login.ts`
4. Implementacja obsługi błędów i właściwych kodów odpowiedzi
5. Testowanie endpoint z różnymi przypadkami (poprawne dane, nieprawidłowy email, nieprawidłowe hasło)
6. Dokumentacja API w standardzie OpenAPI (opcjonalnie)
7. Weryfikacja, czy middleware prawidłowo obsługuje tokeny z odpowiedzi logowania
8. Wdrożenie do środowiska produkcyjnego 

## 10. Dodatkowe szczegóły implementacji

### Pełna implementacja endpointu login.ts

```typescript
// src/pages/api/auth/login.ts
import type { APIRoute } from "astro";
import { loginUserSchema } from "../../../lib/validation/auth.schemas";
import { loginUser } from "../../../lib/services/auth.service";
import type { LoginResponseDto } from "../../../types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = loginUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = result.data;

    // Authenticate the user
    try {
      const response: LoginResponseDto = await loginUser(supabase, email, password);

      return new Response(JSON.stringify(response), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && 
          (error.message.includes("Invalid login") || 
           error.message.includes("Authentication failed"))) {
        return new Response(
          JSON.stringify({
            error: "Authentication failed",
            message: "Invalid email or password",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw other errors to be caught by the general error handler
      throw error;
    }
  } catch (error) {
    console.error("Error during login:", error);

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