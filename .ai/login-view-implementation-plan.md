# Plan implementacji widoku logowania

## 1. Przegląd
Widok logowania stanowi kluczowy element aplikacji 10xCards, umożliwiający użytkownikom uwierzytelnienie się w systemie. Widok składa się z formularza logowania zawierającego pola na adres email i hasło, przycisku logowania oraz odnośnika do widoku rejestracji. Głównym celem widoku jest weryfikacja tożsamości użytkownika i utworzenie sesji, która umożliwi korzystanie z zabezpieczonych funkcji aplikacji.

## 2. Routing widoku
Widok logowania będzie dostępny pod ścieżką `/login` i zostanie zaimplementowany w pliku `src/pages/login.astro`.

## 3. Struktura komponentów
```
LoginPage (Astro)
└── AuthLayout (Astro)
    └── LoginForm (React)
        ├── EmailInput (React/Shadcn)
        ├── PasswordInput (React/Shadcn)
        ├── LoginButton (React/Shadcn)
        ├── FormError (React)
        └── RegisterLink (React)
```

## 4. Szczegóły komponentów

### LoginPage (Astro)
- **Opis komponentu**: Główny komponent strony logowania, odpowiedzialny za renderowanie layoutu autoryzacji i formularza logowania.
- **Główne elementy**: Komponent AuthLayout zawierający LoginForm.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji (obsługiwane przez komponenty dzieci).
- **Obsługiwana walidacja**: Brak (delegowana do komponentów dzieci).
- **Typy**: Brak.
- **Propsy**: Brak.

### AuthLayout (Astro)
- **Opis komponentu**: Layout dla stron związanych z autoryzacją, zapewniający spójny wygląd dla logowania i rejestracji.
- **Główne elementy**: Kontener z logo aplikacji, tytułem strony oraz slotami na treść.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  ```typescript
  interface Props {
    title?: string;
  }
  ```
- **Propsy**: 
  - `title` (opcjonalny): Tytuł strony wyświetlany w nagłówku i tagu <title>.

### LoginForm (React)
- **Opis komponentu**: Interaktywny formularz logowania odpowiedzialny za zbieranie danych uwierzytelniających i wysyłanie ich do API.
- **Główne elementy**: 
  - Formularz HTML
  - Komponenty EmailInput i PasswordInput
  - Przycisk logowania (LoginButton)
  - Komponent FormError do wyświetlania błędów
  - Link do rejestracji (RegisterLink)
- **Obsługiwane interakcje**: 
  - Obsługa zdarzenia submit formularza
  - Obsługa zmian wartości pól formularza
  - Obsługa kliknięcia przycisku logowania
- **Obsługiwana walidacja**: 
  - Walidacja poprawności adresu email (format email)
  - Walidacja obecności hasła
  - Wyświetlanie błędów walidacji
  - Wyświetlanie błędów z API
- **Typy**: 
  - `LoginFormData`
  - `LoginFormState`
  - `LoginResponseError`
- **Propsy**: Brak.

### EmailInput (React/Shadcn)
- **Opis komponentu**: Pole wprowadzania adresu email z walidacją.
- **Główne elementy**: 
  - Label dla pola input
  - Pole input dla adresu email
  - Opcjonalny komunikat błędu
- **Obsługiwane interakcje**: 
  - Obsługa zdarzeń input (onChange, onBlur)
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy pole nie jest puste
  - Sprawdzenie poprawności formatu adresu email
- **Typy**: 
  ```typescript
  interface EmailInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
  }
  ```
- **Propsy**: 
  - `value`: Aktualna wartość pola
  - `onChange`: Funkcja wywoływana przy zmianie wartości
  - `onBlur`: Opcjonalna funkcja wywoływana po utracie fokusu
  - `error`: Opcjonalny komunikat błędu
  - `id`: Opcjonalny identyfikator elementu
  - `label`: Opcjonalna etykieta pola
  - `placeholder`: Opcjonalny tekst zastępczy
  - `required`: Czy pole jest wymagane

### PasswordInput (React/Shadcn)
- **Opis komponentu**: Pole wprowadzania hasła z opcją pokazania/ukrycia zawartości.
- **Główne elementy**: 
  - Label dla pola input
  - Pole input dla hasła
  - Przycisk do pokazania/ukrycia hasła
  - Opcjonalny komunikat błędu
- **Obsługiwane interakcje**: 
  - Obsługa zdarzeń input (onChange, onBlur)
  - Obsługa kliknięcia przycisku pokazania/ukrycia hasła
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy pole nie jest puste
- **Typy**: 
  ```typescript
  interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
  }
  ```
- **Propsy**: 
  - `value`: Aktualna wartość pola
  - `onChange`: Funkcja wywoływana przy zmianie wartości
  - `onBlur`: Opcjonalna funkcja wywoływana po utracie fokusu
  - `error`: Opcjonalny komunikat błędu
  - `id`: Opcjonalny identyfikator elementu
  - `label`: Opcjonalna etykieta pola
  - `placeholder`: Opcjonalny tekst zastępczy
  - `required`: Czy pole jest wymagane

### FormError (React)
- **Opis komponentu**: Komponent wyświetlający komunikaty o błędach formularza lub API.
- **Główne elementy**: 
  - Element wyświetlający komunikat błędu
  - Opcjonalna ikona błędu
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  ```typescript
  interface FormErrorProps {
    message: string | null;
    className?: string;
  }
  ```
- **Propsy**: 
  - `message`: Komunikat błędu do wyświetlenia
  - `className`: Opcjonalne klasy CSS do zastosowania

### RegisterLink (React)
- **Opis komponentu**: Link przekierowujący do strony rejestracji.
- **Główne elementy**: 
  - Element link z odpowiednim tekstem i URL
- **Obsługiwane interakcje**: 
  - Obsługa kliknięcia (przekierowanie do strony rejestracji)
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  ```typescript
  interface RegisterLinkProps {
    className?: string;
    label?: string;
  }
  ```
- **Propsy**: 
  - `className`: Opcjonalne klasy CSS
  - `label`: Opcjonalna etykieta linku

## 5. Typy

### DTO i typy API
```typescript
// Typy zdefiniowane już w src/types.ts
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

### Własne typy dla komponentów
```typescript
// Dane formularza logowania
interface LoginFormData {
  email: string;
  password: string;
}

// Stan formularza logowania
interface LoginFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isPasswordVisible: boolean;
  showRegistrationSuccess?: boolean;
}

// Struktura błędu z API
interface LoginResponseError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}
```

## 6. Zarządzanie stanem
Stan formularza logowania będzie zarządzany w komponencie LoginForm przy użyciu hooka `useState`. Dodatkowo, zostanie stworzony customowy hook `useLoginForm` do zarządzania stanem i logiką formularza.

### Hook useLoginForm
```typescript
function useLoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    errors: {},
    isSubmitting: false,
    isPasswordVisible: false,
    showRegistrationSuccess: window.location.search.includes('registered=true')
  });
  
  const navigate = useNavigate();
  
  // Funkcje do aktualizacji pól formularza
  const updateEmail = (value: string) => {
    setFormState({
      ...formState,
      email: value,
      errors: { ...formState.errors, email: undefined, form: undefined }
    });
  };
  
  const updatePassword = (value: string) => {
    setFormState({
      ...formState,
      password: value,
      errors: { ...formState.errors, password: undefined, form: undefined }
    });
  };
  
  // Funkcja do walidacji formularza przed wysłaniem
  const validateForm = (): boolean => {
    const errors: LoginFormState['errors'] = {};
    
    if (!formState.email) {
      errors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Podaj poprawny adres email';
    }
    
    if (!formState.password) {
      errors.password = 'Hasło jest wymagane';
    }
    
    setFormState({ ...formState, errors });
    return Object.keys(errors).length === 0;
  };
  
  // Funkcja do przełączania widoczności hasła
  const togglePasswordVisibility = () => {
    setFormState({
      ...formState,
      isPasswordVisible: !formState.isPasswordVisible
    });
  };
  
  // Funkcja do obsługi wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormState({ ...formState, isSubmitting: true, errors: {} });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json() as LoginResponseError;
        
        if (response.status === 401) {
          setFormState({
            ...formState,
            isSubmitting: false,
            errors: { form: 'Nieprawidłowy email lub hasło' }
          });
          return;
        }
        
        setFormState({
          ...formState,
          isSubmitting: false,
          errors: { form: errorData.message || 'Wystąpił błąd podczas logowania' }
        });
        return;
      }
      
      const data = await response.json() as LoginResponseDto;
      
      // Zapisanie tokenu sesji
      localStorage.setItem('auth_token', data.session.access_token);
      
      // Przekierowanie do dashboardu
      navigate('/dashboard');
      
    } catch (error) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errors: { form: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.' }
      });
    }
  };
  
  // Funkcja do zamykania komunikatu o pomyślnej rejestracji
  const dismissRegistrationSuccess = () => {
    setFormState({
      ...formState,
      showRegistrationSuccess: false
    });
    
    // Usunięcie parametru z URL
    const url = new URL(window.location.href);
    url.searchParams.delete('registered');
    window.history.replaceState({}, '', url.toString());
  };
  
  return {
    formState,
    updateEmail,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit,
    dismissRegistrationSuccess
  };
}
```

## 7. Integracja API
Logowanie użytkownika będzie realizowane przez wysłanie żądania POST do endpointu `/api/auth/login`.

### Żądanie
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: formState.email,
    password: formState.password
  })
});
```

### Odpowiedź (sukces)
```typescript
{
  user: {
    id: "uuid",
    email: "string"
  },
  session: {
    access_token: "string",
    refresh_token: "string",
    expires_at: "timestamp"
  }
}
```

### Odpowiedź (błąd)
```typescript
// 400 Bad Request
{
  error: "Invalid input",
  details: {
    fieldName: {
      _errors: ["Komunikat błędu walidacji"]
    }
  }
}

// 401 Unauthorized
{
  error: "Authentication failed",
  message: "Invalid email or password"
}
```

## 8. Interakcje użytkownika
1. **Wprowadzanie danych**: Użytkownik wprowadza adres email i hasło w odpowiednie pola formularza.
2. **Pokazanie/ukrycie hasła**: Użytkownik może kliknąć ikonę oka, aby pokazać lub ukryć wprowadzone hasło.
3. **Wysłanie formularza**: Użytkownik klika przycisk "Zaloguj się" lub naciska Enter, aby wysłać formularz.
4. **Obsługa błędów**: Użytkownik widzi komunikaty o błędach walidacji lub odpowiedzi z API.
5. **Nawigacja do rejestracji**: Użytkownik może kliknąć link "Zarejestruj się", aby przejść do formularza rejestracji.
6. **Obsługa powiadomienia o rejestracji**: Użytkownik może zobaczyć komunikat o pomyślnej rejestracji, jeśli został przekierowany ze strony rejestracji z odpowiednim parametrem.

## 9. Warunki i walidacja
### Walidacja pola email
- Pole nie może być puste
- Wartość musi być poprawnym adresem email (zgodnie z podstawowym formatem email)

### Walidacja pola hasła
- Pole nie może być puste

### Walidacja na poziomie API
- Weryfikacja poprawności danych logowania
- Sprawdzenie, czy użytkownik istnieje w systemie
- Sprawdzenie, czy hasło jest poprawne

## 10. Obsługa błędów
### Błędy walidacji formularza
- Wyświetlanie komunikatów o błędach walidacji pod odpowiednimi polami formularza
- Blokowanie wysłania formularza, jeśli walidacja nie przejdzie

### Błędy API
- Obsługa błędu 400 Bad Request (nieprawidłowe dane wejściowe)
- Obsługa błędu 401 Unauthorized (nieprawidłowe dane logowania)
- Obsługa nieoczekiwanych błędów serwera lub sieci
- Wyświetlanie odpowiednich komunikatów o błędach dla użytkownika

## 11. Kroki implementacji
1. Utworzenie pliku `src/pages/login.astro` dla strony logowania
2. Wykorzystanie istniejącego komponentu `AuthLayout` z `src/layouts/AuthLayout.astro`
3. Utworzenie komponentów formularza:
   - `src/components/auth/LoginForm.tsx` - główny komponent formularza
   - Wykorzystanie istniejących komponentów:
     - `src/components/auth/EmailInput.tsx` - komponent pola email
     - `src/components/auth/PasswordInput.tsx` - komponent pola hasła
     - `src/components/auth/FormError.tsx` - komponent wyświetlający błędy
   - Utworzenie komponentu `src/components/auth/RegisterLink.tsx` - komponent linku do rejestracji
4. Implementacja customowego hooka `useLoginForm` w `src/hooks/useLoginForm.ts`
5. Implementacja logiki walidacji formularza
6. Implementacja integracji z API logowania
7. Implementacja obsługi odpowiedzi API (sukces/błędy)
8. Implementacja obsługi sesji po pomyślnym logowaniu (zapisanie tokena)
9. Implementacja przekierowania do dashboardu po pomyślnym logowaniu
10. Implementacja obsługi parametru `registered=true` dla wyświetlania komunikatu o pomyślnej rejestracji
11. Testowanie:
    - Poprawne działanie walidacji formularza
    - Poprawne wysyłanie żądania do API
    - Poprawna obsługa różnych odpowiedzi API
    - Poprawne zarządzanie sesją po logowaniu
    - Poprawne przekierowanie po logowaniu
    - Poprawne wyświetlanie komunikatu o pomyślnej rejestracji 