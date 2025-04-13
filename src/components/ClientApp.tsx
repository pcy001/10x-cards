import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from "@/hooks/useUser";
import { Spinner } from "./ui/Spinner";

// Tworzę QueryClient jako singletonową instancję poza komponentem
// aby zapobiec tworzeniu wielu instancji
const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minut
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

interface ClientAppProps {
  children: React.ReactNode;
}

/**
 * Sprawdza czy kod działa po stronie klienta (w przeglądarce)
 */
const isClient = typeof window !== 'undefined';

/**
 * Wewnętrzny komponent AuthContent, który ma dostęp do QueryClient
 */
function AuthContent({ children }: { children: React.ReactNode }) {
  // Po stronie serwera, nie wywołujemy useUser
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const { data: user, isLoading, isError } = useUser();

  // Efekt, który przekieruje użytkownika, jeśli nie jest zalogowany
  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      window.location.href = '/auth/login';
    }
  }, [isLoading, isError, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Jeśli trwa przekierowanie, pokaż ładowanie
  if (isError || !user) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
        <p className="ml-2 text-gray-600">Przekierowanie...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Główny komponent kliencki opakowujący całą aplikację React
 * Zapewnia QueryClientProvider i logikę autentykacji
 */
export function ClientApp({ children }: ClientAppProps) {
  // Stan do śledzenia czy komponent zamontowany (po stronie klienta)
  const [isMounted, setIsMounted] = useState(false);
  
  // Efekt wykonuje się tylko po stronie klienta
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Podczas renderowania po stronie serwera lub przed zamontowaniem, pokazuj indykator ładowania
  if (!isClient || !isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthContent>
        {children}
      </AuthContent>
    </QueryClientProvider>
  );
} 