import type { APIRoute } from "astro";
import type { UUID } from "../../../types";

// Wyłączamy prerenderowanie dla dynamicznego API
export const prerender = false;

/**
 * GET /api/auth/me - Zwraca dane zalogowanego użytkownika
 */
export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  try {
    // Pobierz dane użytkownika z sesji
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed",
          message: error.message 
        }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: "User not found",
          message: "Not authenticated" 
        }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // Przygotuj dane użytkownika do zwrócenia
    const userData = {
      id: user.id as UUID,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);

    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

