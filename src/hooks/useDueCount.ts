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
      const response = await axios.get<DueCountResponse>("/api/learning/due-count");
      return response.data;
    },
    refetchInterval: 1000 * 60 * 10, // Odświeżaj co 10 minut
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // Dane są świeże przez 5 minut
  });
} 