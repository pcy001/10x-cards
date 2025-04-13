import type { APIRoute } from "astro";
import type { AcceptFlashcardsResponseDto } from "@/types";
import { acceptFlashcardsSchema } from "@/lib/validation/schemas";
import { saveAcceptedFlashcards } from "@/lib/services/flashcard.service";

export const prerender = false;

/**
 * POST handler for accepting flashcards
 * Saves user-selected flashcards to their permanent collection
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Pobierz klienta Supabase
    const supabase = locals.supabase;

    // Sprawdź, czy użytkownik jest zalogowany
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "Musisz być zalogowany, aby zapisać fiszki",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobranie danych z żądania
    const body = await request.json();

    // Walidacja danych wejściowych z użyciem Zod
    const result = acceptFlashcardsSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Zapisz fiszki w bazie danych
    const acceptedFlashcards = await saveAcceptedFlashcards(supabase, user.id, result.data.flashcards);

    const response: AcceptFlashcardsResponseDto = {
      accepted_count: acceptedFlashcards.length,
      flashcards: acceptedFlashcards,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas zapisywania fiszek:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Wystąpił nieznany błąd podczas zapisywania fiszek",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
