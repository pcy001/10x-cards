# Plan implementacji widoku rejestracji

## 1. Przegląd
Widok rejestracji jest kluczowym elementem aplikacji 10xCards, umożliwiającym nowym użytkownikom utworzenie konta w systemie. Składa się z formularza zawierającego pola na adres email, hasło i potwierdzenie hasła, przycisku rejestracji oraz odnośnika do widoku logowania. Głównym celem widoku jest zebranie i walidacja danych rejestracyjnych, a następnie przesłanie ich do API w celu utworzenia nowego konta użytkownika.

## 2. Routing widoku
Widok rejestracji będzie dostępny pod ścieżką `/register` i zostanie zaimplementowany w pliku `src/pages/register.astro`.

## 3. Struktura komponentów
```
RegisterPage (Astro)
└── AuthLayout (Astro)
    └── RegisterForm (React)
        ├── EmailInput (React/Shadcn)
        ├── PasswordInput (React/Shadcn) - dla hasła
        ├── PasswordInput (React/Shadcn) - dla potwierdzenia hasła
        ├── RegisterButton (React/Shadcn)
        ├── FormError (React)
        └── LoginLink (React)
```

## 4. Szczegóły komponentów

### RegisterPage (Astro)
- **Opis komponentu**: Główny komponent strony rejestracji, odpowiedzialny za renderowanie layoutu autoryzacji i formularza rejestracji.
- **Główne elementy**: Komponent AuthLayout zawierający RegisterForm.
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

### RegisterForm (React)
- **Opis komponentu**: Interaktywny formularz rejestracji odpowiedzialny za zbieranie danych użytkownika i wysyłanie ich do API.
- **Główne elementy**: 
  - Formularz HTML
  - Komponenty EmailInput i dwa komponenty PasswordInput
  - Przycisk rejestracji (RegisterButton)
  - Komponent FormError do wyświetlania błędów
  - Link do logowania (LoginLink)
- **Obsługiwane interakcje**: 
  - Obsługa zdarzenia submit formularza
  - Obsługa zmian wartości pól formularza
  - Obsługa kliknięcia przycisku rejestracji
- **Obsługiwana walidacja**: 
  - Walidacja poprawności adresu email (format email)
  - Walidacja siły hasła (minimum 6 znaków)
  - Walidacja zgodności hasła i potwierdzenia hasła
  - Wyświetlanie błędów walidacji
  - Wyświetlanie błędów z API
- **Typy**: 
  - `RegisterFormData`
  - `RegisterFormState`
  - `RegisterResponseError`
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
  - Sprawdzenie minimalnej długości hasła (6 znaków)
  - W przypadku pola potwierdzenia hasła: sprawdzenie zgodności z hasłem
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
    showStrengthIndicator?: boolean;
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
  - `showStrengthIndicator`: Czy pokazywać wskaźnik siły hasła

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

### LoginLink (React)
- **Opis komponentu**: Link przekierowujący do strony logowania.
- **Główne elementy**: 
  - Element link z odpowiednim tekstem i URL
- **Obsługiwane interakcje**: 
  - Obsługa kliknięcia (przekierowanie do strony logowania)
- **Obsługiwana walidacja**: Brak.
- **Typy**: 
  ```typescript
  interface LoginLinkProps {
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
export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface RegisterUserResponseDto {
  id: UUID;
  email: string;
}
```

### Własne typy dla komponentów
```typescript
// Dane formularza rejestracji
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Stan formularza rejestracji
interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
}

// Struktura błędu z API
interface RegisterResponseError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}
```

## 6. Zarządzanie stanem
Stan formularza rejestracji będzie zarządzany w komponencie RegisterForm przy użyciu hooka `useState`. Dodatkowo, zostanie stworzony customowy hook `useRegisterForm` do zarządzania stanem i logiką formularza.

### Hook useRegisterForm
```typescript
function useRegisterForm() {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    errors: {},
    isSubmitting: false,
    isPasswordVisible: false,
    isConfirmPasswordVisible: false
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
      errors: { 
        ...formState.errors, 
        password: undefined, 
        confirmPassword: formState.confirmPassword && value !== formState.confirmPassword 
          ? 'Hasła nie są identyczne' 
          : undefined,
        form: undefined 
      }
    });
  };
  
  const updateConfirmPassword = (value: string) => {
    setFormState({
      ...formState,
      confirmPassword: value,
      errors: { 
        ...formState.errors, 
        confirmPassword: formState.password && value !== formState.password 
          ? 'Hasła nie są identyczne' 
          : undefined,
        form: undefined 
      }
    });
  };
  
  // Funkcja do walidacji formularza przed wysłaniem
  const validateForm = (): boolean => {
    const errors: RegisterFormState['errors'] = {};
    
    if (!formState.email) {
      errors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Podaj poprawny adres email';
    }
    
    if (!formState.password) {
      errors.password = 'Hasło jest wymagane';
    } else if (formState.password.length < 6) {
      errors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }
    
    if (!formState.confirmPassword) {
      errors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = 'Hasła nie są identyczne';
    }
    
    setFormState({ ...formState, errors });
    return Object.keys(errors).length === 0;
  };
  
  // Funkcje do przełączania widoczności haseł
  const togglePasswordVisibility = () => {
    setFormState({
      ...formState,
      isPasswordVisible: !formState.isPasswordVisible
    });
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setFormState({
      ...formState,
      isConfirmPasswordVisible: !formState.isConfirmPasswordVisible
    });
  };
  
  // Funkcja do obsługi wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormState({ ...formState, isSubmitting: true, errors: {} });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json() as RegisterResponseError;
        
        if (response.status === 409) {
          setFormState({
            ...formState,
            isSubmitting: false,
            errors: { email: 'Konto z tym adresem email już istnieje' }
          });
          return;
        }
        
        setFormState({
          ...formState,
          isSubmitting: false,
          errors: { form: errorData.message || 'Wystąpił błąd podczas rejestracji' }
        });
        return;
      }
      
      // Rejestracja zakończona sukcesem
      // Przekierowanie do strony logowania z informacją o sukcesie
      navigate('/login?registered=true');
      
    } catch (error) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errors: { form: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.' }
      });
    }
  };
  
  return {
    formState,
    updateEmail,
    updatePassword,
    updateConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit
  };
}
```

## 7. Integracja API
Rejestracja użytkownika będzie realizowana przez wysłanie żądania POST do endpointu `/api/auth/register`.

### Żądanie
```typescript
const response = await fetch('/api/auth/register', {
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
  id: "uuid",
  email: "string"
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

// 409 Conflict
{
  error: "Email already in use",
  message: "A user with this email address already exists"
}
```

## 8. Interakcje użytkownika
1. **Wprowadzanie danych**: Użytkownik wprowadza adres email, hasło i potwierdzenie hasła w odpowiednie pola formularza.
2. **Pokazanie/ukrycie hasła**: Użytkownik może kliknąć ikonę oka przy polach hasła i potwierdzenia hasła, aby pokazać lub ukryć wprowadzone wartości.
3. **Wysłanie formularza**: Użytkownik klika przycisk "Zarejestruj się" lub naciska Enter, aby wysłać formularz.
4. **Obsługa błędów**: Użytkownik widzi komunikaty o błędach walidacji lub odpowiedzi z API.
5. **Nawigacja do logowania**: Użytkownik może kliknąć link "Zaloguj się", aby przejść do formularza logowania.
6. **Przekierowanie po sukcesie**: Po pomyślnej rejestracji użytkownik jest przekierowywany do strony logowania z informacją o sukcesie.

## 9. Warunki i walidacja
### Walidacja pola email
- Pole nie może być puste
- Wartość musi być poprawnym adresem email (zgodnie z podstawowym formatem email)

### Walidacja pola hasła
- Pole nie może być puste
- Hasło musi mieć co najmniej 6 znaków (zgodnie z wymaganiami Supabase)

### Walidacja pola potwierdzenia hasła
- Pole nie może być puste
- Wartość musi być identyczna z wartością w polu hasła

### Walidacja na poziomie API
- Weryfikacja unikalności adresu email (czy konto o danym adresie nie istnieje już w systemie)
- Weryfikacja poprawności danych wejściowych

## 10. Obsługa błędów
### Błędy walidacji formularza
- Wyświetlanie komunikatów o błędach walidacji pod odpowiednimi polami formularza
- Blokowanie wysłania formularza, jeśli walidacja nie przejdzie
- Dynamiczna walidacja zgodności hasła i potwierdzenia hasła przy zmianie któregokolwiek z tych pól

### Błędy API
- Obsługa błędu 400 Bad Request (nieprawidłowe dane wejściowe)
- Obsługa błędu 409 Conflict (adres email jest już zajęty)
- Obsługa nieoczekiwanych błędów serwera lub sieci
- Wyświetlanie odpowiednich komunikatów o błędach dla użytkownika

## 11. Kroki implementacji
1. Utworzenie pliku `src/pages/register.astro` dla strony rejestracji
2. Wykorzystanie istniejącego komponentu `AuthLayout` z `src/layouts/AuthLayout.astro`
3. Utworzenie komponentów formularza:
   - `src/components/auth/RegisterForm.tsx` - główny komponent formularza
   - Wykorzystanie istniejących komponentów:
     - `src/components/auth/EmailInput.tsx` - komponent pola email
     - `src/components/auth/PasswordInput.tsx` - komponent pola hasła (użyty dwukrotnie)
     - `src/components/auth/FormError.tsx` - komponent wyświetlający błędy
   - Utworzenie komponentu `src/components/auth/LoginLink.tsx` - komponent linku do logowania
4. Implementacja customowego hooka `useRegisterForm` w `src/hooks/useRegisterForm.ts`
5. Implementacja logiki walidacji formularza
6. Implementacja integracji z API rejestracji
7. Implementacja obsługi odpowiedzi API (sukces/błędy)
8. Implementacja przekierowania do strony logowania po pomyślnej rejestracji
9. Dodanie obsługi parametru `registered=true` w komponencie strony logowania do wyświetlania komunikatu o pomyślnej rejestracji
10. Testowanie:
    - Poprawne działanie walidacji formularza
    - Poprawne wysyłanie żądania do API
    - Poprawna obsługa różnych odpowiedzi API
    - Poprawne przekierowanie po pomyślnej rejestracji
    - Poprawne wyświetlanie komunikatu o sukcesie na stronie logowania 