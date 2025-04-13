import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/types/auth";

/**
 * Hook do pobierania danych zalogowanego użytkownika.
 * Dane są przechowywane w cache i nie są odświeżane przy fokusie okna,
 * ponieważ zakładamy, że dane użytkownika nie zmieniają się w trakcie sesji.
 */
export const useUser = () => {
  try {
    return useQuery<User>({
      queryKey: ["user"],
      queryFn: async () => {
        const response = await axios.get("/api/auth/me");
        return response.data;
      },
      refetchOnWindowFocus: false,
      staleTime: Infinity
    });
  } catch (error) {
    // Jeśli nie ma QueryClient, zwróć prosty obiekt imitujący interfejs useQuery
    console.error("Error in useUser:", error);
    return {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: undefined })
    };
  }
};
