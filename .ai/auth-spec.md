# Specyfikacja techniczna systemu autentykacji w 10xCards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Struktura stron autentykacji

Aplikacja 10xCards implementuje następujące strony związane z autentykacją:

#### 1.1.1. Strona logowania (`/auth/login`)
- Renderowana server-side jako strona Astro
- Zawiera formularz logowania zaimplementowany jako komponent React
- Obsługuje przekierowania po pomyślnym logowaniu (parametr `redirect` w URL)
- Zawiera link do strony rejestracji i odzyskiwania hasła
- Pokazuje komunikaty błędów w przypadku niepowodzenia logowania

#### 1.1.2. Strona rejestracji (`/auth/register`)
- Renderowana server-side jako strona Astro
- Zawiera formularz rejestracji zaimplementowany jako komponent React
- Waliduje dane wejściowe (poprawność adresu email, siłę hasła)
- Po udanej rejestracji wyświetla komunikat o konieczności weryfikacji adresu email
- Zawiera link do strony logowania

#### 1.1.3. Strona resetowania hasła (`/auth/reset-password`)
- Renderowana server-side jako strona Astro
- Zawiera formularz do wprowadzenia adresu email
- Po wysłaniu formularza generuje link resetujący hasło
- Wyświetla komunikat potwierdzający wysłanie linku na adres email

#### 1.1.4. Strona ustawiania nowego hasła (`/auth/new-password`)
- Dostępna po kliknięciu w link resetujący hasło
- Zawiera formularz do wprowadzenia nowego hasła
- Waliduje siłę nowego hasła
- Po pomyślnym zresetowaniu przekierowuje do strony logowania

#### 1.1.5. Strona wylogowania (`/auth/logout`)
- Prosta strona wykonująca operację wylogowania
- Automatycznie przekierowuje na stronę główną po wylogowaniu

### 1.2. Komponenty autentykacji

#### 1.2.1. `LoginForm`
- Komponent React renderowany po stronie klienta
- Zawiera pola do wprowadzenia adresu email i hasła
- Obsługuje logikę logowania poprzez Supabase Auth API
- Implementuje obsługę błędów i wyświetlanie odpowiednich komunikatów
- Przekierowuje użytkownika po udanym logowaniu
- Uwzględnia przekierowanie do strony, z której użytkownik przyszedł (parametr `redirect`)

#### 1.2.2. `RegisterForm`
- Komponent React renderowany po stronie klienta
- Zawiera pola do wprowadzenia adresu email, hasła i potwierdzenia hasła
- Implementuje walidację pól formularza w czasie rzeczywistym
- Obsługuje logikę rejestracji poprzez Supabase Auth API
- Wyświetla odpowiednie komunikaty o stanie procesu rejestracji

#### 1.2.3. `ResetPasswordForm`
- Komponent React renderowany po stronie klienta
- Zawiera pole do wprowadzenia adresu email
- Obsługuje logikę wysyłania linku resetującego hasło
- Wyświetla komunikat potwierdzający wysłanie linku

#### 1.2.4. `NewPasswordForm`
- Komponent React renderowany po stronie klienta
- Zawiera pola do wprowadzenia nowego hasła i jego potwierdzenia
- Implementuje walidację siły hasła
- Obsługuje logikę ustawiania nowego hasła poprzez Supabase Auth API

#### 1.2.5. `AuthCleanup`
- Komponent pomocniczy do czyszczenia stanu autentykacji
- Usuwa niepotrzebne dane sesji i tokeny po wylogowaniu
- Obsługuje wygasłe sesje

### 1.3. Layout i nawigacja

#### 1.3.1. `AuthLayout`
- Layout dedykowany dla stron związanych z autentykacją
- Uproszczony interfejs z wycentrowanym formularzem
- Nie zawiera elementów wymagających autentykacji (np. menu użytkownika)
- Wyświetla logo aplikacji i stopkę

#### 1.3.2. `MainLayout`
- Layout dla stron dostępnych po zalogowaniu
- Zawiera nagłówek z informacjami o zalogowanym użytkowniku
- Implementuje menu nawigacyjne z opcją wylogowania
- Dynamicznie dostosowuje zawartość w zależności od stanu autentykacji

### 1.4. Obsługa błędów i komunikaty

#### 1.4.1. Walidacja formularzy
- Walidacja po stronie klienta w czasie rzeczywistym (formaty pól, zgodność haseł)
- Wyświetlanie komunikatów błędów poniżej odpowiednich pól formularza
- Blokowanie przycisków submit gdy formularz zawiera błędy

#### 1.4.2. Komunikaty autentykacji
- Toast notyfikacje dla pomyślnych operacji (np. udane wysłanie linku resetującego)
- Komunikaty błędów dla niepowodzeń autoryzacji (np. nieprawidłowe dane logowania)
- Komunikaty informacyjne (np. wymagana weryfikacja email)

#### 1.4.3. Przekierowania
- Automatyczne przekierowanie do strony logowania dla chronionych zasobów
- Przekierowanie po pomyślnym logowaniu do żądanej strony
- Przekierowanie z dashboard do strony głównej dla niezalogowanych użytkowników

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API i middleware

#### 2.1.1. Middleware autentykacji (`src/middleware/index.ts`)
- Automatyczna weryfikacja tokenów JWT w ciasteczkach dla każdego żądania
- Inicjalizacja klienta Supabase z odpowiednimi uprawnieniami
- Przechowywanie informacji o sesji użytkownika w `Astro.locals`
- Obsługa odświeżania tokenów dla sesji bliskich wygaśnięcia
- Przekierowanie niezalogowanych użytkowników próbujących dostać się do chronionych zasobów

#### 2.1.2. Chronione strony
- Weryfikacja sesji użytkownika w bloku frontmatter Astro
- Automatyczne przekierowanie do `/auth/login` z parametrem `redirect` dla niezalogowanych użytkowników
- Przykładowy kod strony chronionej:
```astro
---
// Sprawdź czy użytkownik jest zalogowany
const supabase = Astro.locals.supabase;
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  return Astro.redirect(`/auth/login?redirect=${Astro.url.pathname}`);
}
---
```

#### 2.1.3. Chronione endpointy API
- Weryfikacja sesji użytkownika w handlerach API
- Zwracanie odpowiednich kodów HTTP dla nieautoryzowanych żądań (401)
- Przykładowy kod endpointu chronionego:
```typescript
export async function POST(context: APIContext) {
  // Sprawdź czy użytkownik jest zalogowany
  const { data: { session } } = await context.locals.supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized access" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Kod endpointu...
}
```

### 2.2. Walidacja danych

#### 2.2.1. Walidacja po stronie serwera
- Wykorzystanie biblioteki Zod do walidacji danych wejściowych
- Definiowanie schematów walidacji dla danych autentykacji
- Zwracanie odpowiednich komunikatów błędów w przypadku nieprawidłowych danych

#### 2.2.2. Obsługa błędów API
- Standardowa struktura odpowiedzi błędów (`{ error: string, details?: any }`)
- Mapowanie błędów Supabase Auth na przyjazne dla użytkownika komunikaty
- Logowanie błędów autentykacji

### 2.3. Dostęp do danych

#### 2.3.1. Row Level Security (RLS)
- Implementacja polityk RLS w bazie danych Supabase
- Automatyczne filtrowanie danych na podstawie tożsamości użytkownika
- Ochrona przed dostępem do danych innych użytkowników
- Przykład polityki RLS:
```sql
-- Użytkownik może czytać tylko swoje fiszki
CREATE POLICY "Użytkownicy mogą czytać własne fiszki" ON "flashcards"
FOR SELECT USING (auth.uid() = user_id);

-- Użytkownik może modyfikować tylko swoje fiszki
CREATE POLICY "Użytkownicy mogą modyfikować własne fiszki" ON "flashcards"
FOR UPDATE USING (auth.uid() = user_id);
```

#### 2.3.2. Klient Supabase
- Inicjalizacja klienta Supabase z odpowiednimi uprawnieniami
- Wykorzystanie tokenu uwierzytelniającego do zapytań do bazy danych
- Automatyczne filtrowanie danych zgodnie z politykami RLS

## 3. SYSTEM AUTENTYKACJI

### 3.1. Integracja z Supabase Auth

#### 3.1.1. Konfiguracja Supabase Auth
- Integracja z Supabase Auth poprzez oficjalne SDK
- Konfiguracja dostawców autentykacji (email/hasło)
- Zarządzanie tokenami JWT w ciasteczkach
- Konfiguracja szablonów email (weryfikacja email, reset hasła)

#### 3.1.2. Przepływy autentykacji

**Logowanie**
- Inicjacja logowania poprzez `supabase.auth.signInWithPassword()`
- Przechowywanie tokenu JWT w bezpiecznych ciasteczkach (HttpOnly, Secure, SameSite)
- Obsługa mechanizmu odświeżania tokenu dla zapewnienia ciągłości sesji

**Rejestracja**
- Inicjacja rejestracji poprzez `supabase.auth.signUp()`
- Wysyłanie emaila weryfikacyjnego do nowego użytkownika
- Obsługa procesu potwierdzenia adresu email
- Automatyczne logowanie po pomyślnej weryfikacji email

**Resetowanie hasła**
- Inicjacja resetowania hasła poprzez `supabase.auth.resetPasswordForEmail()`
- Wysyłanie emaila z linkiem do resetowania hasła
- Obsługa procesu ustawiania nowego hasła poprzez `supabase.auth.updateUser()`

**Wylogowanie**
- Wylogowanie użytkownika poprzez `supabase.auth.signOut()`
- Usuwanie tokenów JWT z ciasteczek
- Czyszczenie lokalnego stanu aplikacji związanego z autentykacją

#### 3.1.3. Obsługa błędów autentykacji
- Mapowanie kodów błędów Supabase Auth na komunikaty dla użytkownika
- Obsługa typowych scenariuszy błędów (nieprawidłowe dane logowania, email już istnieje, itp.)
- Zaawansowana obsługa błędów dla złożonych przepływów (np. reset hasła)

### 3.2. Bezpieczeństwo

#### 3.2.1. Przechowywanie tokenów
- Wykorzystanie bezpiecznych ciasteczek z flagami HttpOnly, Secure i SameSite
- Implementacja mechanizmu odświeżania tokenów
- Właściwe zarządzanie wygasaniem tokenów

#### 3.2.2. Ochrona przed atakami
- Implementacja zabezpieczeń przed atakami CSRF
- Automatyczne wylogowywanie po okresie bezczynności
- Ograniczenie liczby prób logowania (rate limiting)
- Monitorowanie podejrzanej aktywności

#### 3.2.3. Bezpieczeństwo haseł
- Wykorzystanie funkcji haszowania przez Supabase Auth
- Weryfikacja siły hasła podczas rejestracji i zmiany hasła
- Wymuszanie minimalnych wymagań dla haseł (długość, złożoność)

## 4. KLUCZOWE KOMPONENTY IMPLEMENTACYJNE

### 4.1. Pliki i struktura katalogów

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── NewPasswordForm.tsx
│   │   └── AuthCleanup.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ... (inne komponenty UI)
├── layouts/
│   ├── AuthLayout.astro
│   └── MainLayout.astro
├── lib/
│   ├── validation/
│   │   └── auth-schemas.ts
│   └── utils/
│       └── auth-helpers.ts
├── middleware/
│   └── index.ts
├── pages/
│   ├── auth/
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── reset-password.astro
│   │   ├── new-password.astro
│   │   └── logout.astro
│   ├── dashboard.astro
│   └── index.astro
└── db/
    └── supabase.ts
```

### 4.2. Kontrakt API dla komponentów autentykacji

#### 4.2.1. LoginForm
```typescript
interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: (session: Session) => void;
  onError?: (error: Error) => void;
}
```

#### 4.2.2. RegisterForm
```typescript
interface RegisterFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

#### 4.2.3. ResetPasswordForm
```typescript
interface ResetPasswordFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

#### 4.2.4. NewPasswordForm
```typescript
interface NewPasswordFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### 4.3. Przykładowe implementacje kluczowych funkcjonalności

#### 4.3.1. Inicjalizacja Supabase (`src/db/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string, options = {}) => {
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      ...options
    }
  );
};
```

#### 4.3.2. Middleware Astro (`src/middleware/index.ts`)
```typescript
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseClient } from '../db/supabase';

export const onRequest = defineMiddleware(async ({ locals, request, cookies }, next) => {
  // Inicjalizacja klienta Supabase dla każdego żądania
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;
  
  // Przekazanie ciasteczek do Supabase dla uwierzytelniania
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    }
  });

  // Ustawienie klienta Supabase w locals
  locals.supabase = supabase;

  // Uzyskanie sesji użytkownika (jeśli jest zalogowany)
  const {
    data: { session }
  } = await supabase.auth.getSession();
  
  // Ustawienie danych sesji w locals
  locals.session = session;

  // Przetworzenie odpowiedzi
  const response = await next();
  
  // Uzyskanie nagłówków Set-Cookie z odpowiedzi Supabase Auth
  const supabaseCookies = supabase.auth.cookies();
  
  // Dodanie ciasteczek do odpowiedzi Astro
  if (supabaseCookies) {
    for (const [name, value] of Object.entries(supabaseCookies)) {
      if (value) {
        cookies.set(name, value, { 
          httpOnly: true, 
          secure: true, 
          sameSite: 'lax', 
          path: '/' 
        });
      }
    }
  }

  return response;
});
```

#### 4.3.3. Chroniona strona (`src/pages/dashboard.astro`)
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import DashboardContent from '../components/dashboard/DashboardContent';

// Sprawdź czy użytkownik jest zalogowany
const supabase = Astro.locals.supabase;
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  return Astro.redirect(`/auth/login?redirect=${Astro.url.pathname}`);
}

// Pobierz dane użytkownika
const { data: userData } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();
---

<MainLayout title="Dashboard | 10xCards">
  <DashboardContent user={userData} client:load />
</MainLayout>
```

#### 4.3.4. Komponent logowania (`src/components/auth/LoginForm.tsx`)
```tsx
import { useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Button, Input, Alert } from '@/components/ui';

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const supabase = useSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Przekierowanie po udanym logowaniu
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err?.message || 'Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password">Hasło</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </Button>
      
      <div className="text-center text-sm">
        <a href="/auth/reset-password" className="text-blue-600 hover:underline">
          Zapomniałeś hasła?
        </a>
      </div>
      
      <div className="text-center text-sm">
        Nie masz konta?{' '}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Zarejestruj się
        </a>
      </div>
    </form>
  );
}
```

## 5. PODSUMOWANIE

Zaimplementowany system autentykacji w 10xCards oparty jest o Supabase Auth zintegrowany z frameworkiem Astro. System zapewnia kompletny zestaw funkcjonalności rejestracji, logowania, resetowania hasła oraz ochrony zasobów, jednocześnie dbając o bezpieczeństwo danych użytkownika poprzez odpowiednią izolację i zabezpieczenia przed typowymi atakami.

Architektura systemu jest dobrze zintegrowana z pozostałymi komponentami aplikacji, wykorzystując Row Level Security na poziomie bazy danych oraz middleware Astro do zapewnienia spójnej weryfikacji sesji użytkownika. Dzięki takiemu podejściu, każdy zasób wymagający uwierzytelnienia jest odpowiednio chroniony, a dane użytkowników są odizolowane od siebie.

Interfejs użytkownika został zaprojektowany z myślą o prostocie i intuicyjności, oferując jasne komunikaty i wskazówki dla użytkownika podczas całego procesu autentykacji. Formularze implementują odpowiednią walidację danych, zapewniając poprawność wprowadzanych informacji.

Całość tworzy spójny i bezpieczny system autentykacji, stanowiący solidną podstawę dla funkcjonalności aplikacji 10xCards wymagających identyfikacji użytkownika. 