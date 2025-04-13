# API Endpoint Implementation Plan: Logout

## 1. Przegląd punktu końcowego
Endpoint logoutu umożliwia użytkownikom bezpieczne wylogowanie się z aplikacji poprzez unieważnienie aktualnej sesji użytkownika w Supabase. Po skutecznym wylogowaniu, sesja użytkownika zostaje unieważniona, a klient nie będzie mógł wykonywać dalszych uwierzytelnionych żądań bez ponownego logowania.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/auth/logout`
- Parametry:
  - Wymagane: Brak
  - Opcjonalne: Brak
- Request Body: Brak
- Nagłówki:
  - Authorization: Bearer token (token dostępu użytkownika)

## 3. Wykorzystywane typy
Dla tego endpointu nie są wymagane żadne dodatkowe typy DTO, ponieważ:
- Żądanie nie zawiera body
- Odpowiedź nie zawiera danych

Wykorzystane będą istniejące typy z Supabase dla interakcji z API uwierzytelniania.

## 4. Szczegóły odpowiedzi
- Kod statusu: 204 No Content (sukces, bez treści)
- Brak treści odpowiedzi
- W przypadku błędu:
  - 401 Unauthorized - gdy użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error - gdy wystąpi wewnętrzny błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie POST bez treści, ale z nagłówkiem Authorization
2. Middleware Astro (już istniejący) analizuje token uwierzytelniania z nagłówka i ustawia go w kliencie Supabase
3. Jeśli token nie istnieje lub jest nieprawidłowy, zwracany jest błąd 401
4. W przypadku prawidłowego tokenu, wywołujemy metodę signOut na kliencie Supabase
5. Jeśli wylogowanie się powiedzie, zwracamy odpowiedź 204 No Content
6. W przypadku błędu, zwracamy odpowiedni kod błędu (najczęściej 500) z informacją o błędzie

## 6. Względy bezpieczeństwa
- Endpoint musi weryfikować, czy żądanie jest uwierzytelnione (posiada ważny token JWT)
- Każde żądanie powinno być obsługiwane przez middleware, które weryfikuje token
- Należy unikać ujawniania szczegółowych informacji o błędach w odpowiedziach
- Wylogowanie powinno być idempotentne - wielokrotne wywołanie nie powinno powodować błędów

## 7. Obsługa błędów
- 401 Unauthorized:
  - Gdy brak tokenu uwierzytelniającego
  - Gdy token jest nieprawidłowy lub wygasł
- 500 Internal Server Error:
  - Gdy wystąpi nieoczekiwany błąd w Supabase
  - Gdy wystąpi inny błąd serwera podczas przetwarzania żądania

## 8. Rozważania dotyczące wydajności
- Endpoint jest prostą operacją, która nie powinna generować znaczącego obciążenia
- Nie wymaga dostępu do bazy danych poza standardowymi operacjami Supabase Auth
- Supabase obsługuje wylogowanie po stronie serwera, więc nie ma potrzeby dodatkowego zarządzania sesją

## 9. Etapy wdrożenia

### 1. Dodanie funkcji logoutUser w auth.service.ts
```typescript
/**
 * Logs out a user by invalidating their current session
 *
 * @param supabase - The Supabase client instance
 * @returns void
 * @throws Error if logout fails
 */
export async function logoutUser(
  supabase: SupabaseClient
): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Error during user logout:", error);
    throw error;
  }
}
```

### 2. Utworzenie pliku logout.ts w src/pages/api/auth
```typescript
import type { APIRoute } from "astro";
import { logoutUser } from "../../../lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  
  try {
    // Attempt to logout user
    await logoutUser(supabase);
    
    // Return 204 No Content for successful logout
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error during logout:", error);
    
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

### 3. Testowanie endpointu
1. Test z poprawnym tokenem uwierzytelniającym - powinien zwrócić 204 No Content
2. Test bez tokenu uwierzytelniającego - powinien zwrócić 401 Unauthorized
3. Test z nieprawidłowym tokenem - powinien zwrócić 401 Unauthorized

### 4. Wdrożenie i dokumentacja
1. Wdrożenie implementacji na środowisko deweloperskie
2. Aktualizacja dokumentacji API
3. Zakończenie wdrożenia na środowisko produkcyjne 