import type { APIRoute } from "astro";
import { User } from "@/types/auth";

// Wyłączamy prerenderowanie dla dynamicznego API
export const prerender = false;

/**
 * GET /api/auth/me - Zwraca dane zalogowanego użytkownika
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // W rzeczywistej implementacji tutaj byłaby weryfikacja tokenu JWT
    // i pobieranie danych użytkownika z bazy danych
    
    // Pobieramy token z ciasteczka (w rzeczywistej implementacji)
    // const token = cookies.get("authToken")?.value;
    
    // if (!token) {
    //   return new Response(
    //     JSON.stringify({ message: "Unauthorized" }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }
    
    // Tworzymy przykładowe dane dla celów demonstracyjnych
    const userData: User = {
      id: "12345",
      email: "demo@example.com",
      createdAt: new Date(2023, 0, 1).toISOString(),
      updatedAt: new Date(2023, 0, 1).toISOString()
    };
    
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error);
    
    return new Response(
      JSON.stringify({ 
        message: "Wystąpił błąd podczas pobierania danych użytkownika" 
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