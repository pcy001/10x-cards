import { useState, useCallback } from 'react';
import type { RegisterUserResponseDto } from '@/types';

// Typy dla formularza rejestracji
export interface RegisterFormData {
  email: string;
  password: string;
}

export interface RegisterFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isPasswordVisible: boolean;
}

export interface RegisterResponseError {
  error: string;
  message?: string;
  details?: Record<string, any>;
}

export function useRegisterForm() {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    errors: {},
    isSubmitting: false,
    isPasswordVisible: false,
  });
  
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      });
      
      // Obsługa odpowiedzi z serwera
      if (!response.ok) {
        const errorData = await response.json() as RegisterResponseError;
        
        // Email już istnieje (409 Conflict)
        if (response.status === 409) {
          setFormState(prevState => ({
            ...prevState,
            isSubmitting: false,
            errors: { email: 'Ten adres email jest już zajęty' }
          }));
          return;
        }
        
        // Nieprawidłowe dane wejściowe (400 Bad Request)
        if (response.status === 400 && errorData.details) {
          const fieldErrors: RegisterFormState['errors'] = {};
          
          if (errorData.details.email) {
            fieldErrors.email = Array.isArray(errorData.details.email) 
              ? errorData.details.email[0] 
              : 'Nieprawidłowy email';
          }
          
          if (errorData.details.password) {
            fieldErrors.password = Array.isArray(errorData.details.password) 
              ? errorData.details.password[0] 
              : 'Nieprawidłowe hasło';
          }
          
          setFormState(prevState => ({
            ...prevState,
            isSubmitting: false,
            errors: fieldErrors
          }));
          return;
        }
        
        // Ogólny błąd
        setFormState(prevState => ({
          ...prevState,
          isSubmitting: false,
          errors: { form: errorData.message || 'Wystąpił błąd podczas rejestracji' }
        }));
        return;
      }
      
      // Sukces - pobierz dane użytkownika
      const data = await response.json() as RegisterUserResponseDto;
      
      // Wyczyść formularz
      setFormState({
        email: '',
        password: '',
        errors: {},
        isSubmitting: false,
        isPasswordVisible: false
      });
      
      // Przekieruj do strony logowania z informacją o pomyślnej rejestracji
      window.location.href = '/auth/login?registered=true';
      
    } catch (error) {
      // Obsługa błędów sieciowych i innych
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        errors: { form: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.' }
      }));
    }
  }, [formState.email, formState.password, validateForm]);
  
  return {
    formState,
    updateEmail,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit
  };
} 