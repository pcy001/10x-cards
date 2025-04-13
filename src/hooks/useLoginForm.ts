import { useState, useCallback, useEffect } from 'react';
import type { LoginResponseDto } from '@/types';

// Typy dla formularza logowania
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormState {
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

export interface LoginResponseError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}

export function useLoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    errors: {},
    isSubmitting: false,
    isPasswordVisible: false,
    showRegistrationSuccess: false
  });
  
  // Efekt sprawdzający URL po wyrenderowaniu komponentu (tylko po stronie klienta)
  useEffect(() => {
    // Teraz bezpiecznie sprawdzamy URL, gdy komponent jest już zamontowany
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('registered') && searchParams.get('registered') === 'true') {
      setFormState(prev => ({
        ...prev,
        showRegistrationSuccess: true
      }));
    }
  }, []);
  
  // Funkcje do aktualizacji pól formularza
  const updateEmail = useCallback((value: string) => {
    setFormState(prevState => ({
      ...prevState,
      email: value,
      errors: { ...prevState.errors, email: undefined, form: undefined }
    }));
  }, []);
  
  const updatePassword = useCallback((value: string) => {
    setFormState(prevState => ({
      ...prevState,
      password: value,
      errors: { ...prevState.errors, password: undefined, form: undefined }
    }));
  }, []);
  
  // Funkcja do walidacji formularza przed wysłaniem
  const validateForm = useCallback((): boolean => {
    const errors: LoginFormState['errors'] = {};
    
    if (!formState.email) {
      errors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Podaj poprawny adres email';
    }
    
    if (!formState.password) {
      errors.password = 'Hasło jest wymagane';
    }
    
    setFormState(prevState => ({ ...prevState, errors }));
    return Object.keys(errors).length === 0;
  }, [formState.email, formState.password]);
  
  // Funkcja do przełączania widoczności hasła
  const togglePasswordVisibility = useCallback(() => {
    setFormState(prevState => ({
      ...prevState,
      isPasswordVisible: !prevState.isPasswordVisible
    }));
  }, []);
  
  // Funkcja do obsługi wysłania formularza
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormState(prevState => ({ ...prevState, isSubmitting: true, errors: {} }));
    
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
          setFormState(prevState => ({
            ...prevState,
            isSubmitting: false,
            errors: { form: 'Nieprawidłowy email lub hasło' }
          }));
          return;
        }
        
        setFormState(prevState => ({
          ...prevState,
          isSubmitting: false,
          errors: { form: errorData.message || 'Wystąpił błąd podczas logowania' }
        }));
        return;
      }
      
      const data = await response.json() as LoginResponseDto;
      
      // Zapisanie tokenu sesji
      localStorage.setItem('auth_token', data.session.access_token);
      
      // Przekierowanie do dashboardu używając standardowego window.location
      window.location.href = '/dashboard';
      
    } catch (error) {
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        errors: { form: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.' }
      }));
    }
  }, [formState.email, formState.password, validateForm]);
  
  // Funkcja do zamykania komunikatu o pomyślnej rejestracji
  const dismissRegistrationSuccess = useCallback(() => {
    setFormState(prevState => ({
      ...prevState,
      showRegistrationSuccess: false
    }));
    
    // Usunięcie parametru z URL
    const url = new URL(window.location.href);
    url.searchParams.delete('registered');
    window.history.replaceState({}, '', url.toString());
  }, []);
  
  return {
    formState,
    updateEmail,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit,
    dismissRegistrationSuccess
  };
} 