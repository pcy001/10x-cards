import type { APIRoute } from "astro";
import { DueCountResponse } from "@/types/dashboard";

// Wyłączamy prerenderowanie dla dynamicznego API
export const prerender = false;

/**
 * GET /api/flashcards/due-count - Zwraca liczbę fiszek oczekujących na powtórzenie
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // W rzeczywistej implementacji tutaj byłoby połączenie z bazą danych
    // i pobieranie faktycznych danych o fiszkach oczekujących na powtórzenie
    
    // Tworzymy przykładowe dane dla celów demonstracyjnych
    const dueCountData: DueCountResponse = {
      total: 12,
      byDifficulty: {
        easy: 4,
        medium: 5,
        hard: 3
      },
      byCategory: [
        { id: "cat1", name: "Angielski", count: 5 },
        { id: "cat2", name: "Historia", count: 3 },
        { id: "cat3", name: "Matematyka", count: 4 }
      ]
    };
    
    return new Response(JSON.stringify(dueCountData), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania liczby fiszek:", error);
    
    return new Response(
      JSON.stringify({ 
        message: "Wystąpił błąd podczas pobierania liczby fiszek" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}; 