import type { APIRoute } from "astro";
import { updatePasswordSchema } from "../../../lib/validation/auth.schemas";

export const prerender = false;

/**
 * POST handler dla aktualizacji hasła
 * Aktualizuje hasło użytkownika po resecie
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = updatePasswordSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { password } = result.data;

    try {
      // Aktualizujemy hasło bez pośredniego ustawiania tokenu
      // Supabase obsługuje sesję z cookies ustawionych przez link resetujący
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        return new Response(
          JSON.stringify({
            error: "Błąd aktualizacji hasła",
            message: error.message || "Nie udało się zaktualizować hasła",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Hasło zostało pomyślnie zaktualizowane",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        return new Response(
          JSON.stringify({
            error: "Błąd aktualizacji hasła",
            message: error.message || "Nie udało się zaktualizować hasła",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw other errors to be caught by the general error handler
      throw error;
    }
  } catch (error) {
    console.error("Error during password update:", error);

    return new Response(
      JSON.stringify({
        error: "Błąd serwera",
        message: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 