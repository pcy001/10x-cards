import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DueCountResponse } from "@/types/dashboard";

/**
 * Hook zwracający dane o liczbie fiszek oczekujących na powtórzenie
 */
export default function useDueCount() {
  return useQuery<DueCountResponse>({
    queryKey: ["dueCount"],
    queryFn: async () => {
      // Add cache busting parameter to avoid browser caching
      const cacheBuster = new Date().getTime();
      const response = await axios.get<DueCountResponse>(`/api/learning/due-count?t=${cacheBuster}`);
      console.log('useDueCount - API response:', response.data);
      return response.data;
    },
    refetchInterval: 1000, // Odświeżaj co 1 sekundę
    refetchOnWindowFocus: true,
    staleTime: 500, // Dane są świeże przez 500ms
    retry: 3, // Próbuj 3 razy w przypadku błędu
  });
} 