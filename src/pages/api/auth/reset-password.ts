import type { APIRoute } from "astro";
import { resetPasswordRequestSchema } from "../../../lib/validation/auth.schemas";
import { resetPasswordRequest } from "../../../lib/services/auth.service";

export const prerender = false;

/**
 * POST handler dla żądania resetu hasła
 * Wysyła email z linkiem do zresetowania hasła
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = resetPasswordRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email } = result.data;

    // Send password reset email
    try {
      await resetPasswordRequest(supabase, email, result.data.redirectTo);

      return new Response(
        JSON.stringify({
          message: "Link do resetowania hasła został wysłany na podany adres email",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error && error.message.includes("Password reset")) {
        return new Response(
          JSON.stringify({
            error: "Błąd resetowania hasła",
            message: "Nie udało się wysłać linku do resetowania hasła",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw other errors to be caught by the general error handler
      throw error;
    }
  } catch (error) {
    console.error("Error during password reset request:", error);

    return new Response(
      JSON.stringify({
        error: "Błąd serwera",
        message: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 