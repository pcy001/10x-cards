import type { APIRoute } from "astro";
import { loginUserSchema } from "../../../lib/validation/auth.schemas";
import { loginUser } from "../../../lib/services/auth.service";
import type { LoginResponseDto } from "../../../types";

export const prerender = false;

/**
 * POST handler dla logowania użytkownika
 * Weryfikuje dane uwierzytelniające i zwraca informacje o sesji
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = loginUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = result.data;

    // Authenticate the user
    try {
      const response: LoginResponseDto = await loginUser(supabase, email, password);

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle authentication errors
      if (
        error instanceof Error &&
        (error.message.includes("Invalid login") || error.message.includes("Authentication failed"))
      ) {
        return new Response(
          JSON.stringify({
            error: "Authentication failed",
            message: "Nieprawidłowy email lub hasło",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw other errors to be caught by the general error handler
      throw error;
    }
  } catch (error) {
    console.error("Error during login:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
