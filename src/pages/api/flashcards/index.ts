import type { APIRoute } from "astro";
import { flashcardsQuerySchema } from "../../../lib/validation/schemas";
import { getFlashcards } from "../../../lib/services/flashcard.service";

export const prerender = false;

/**
 * GET handler for retrieving all flashcards
 * Supports pagination and sorting
 */
export const GET: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const supabase = locals.supabase;
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = sessionData.session.user.id;

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const result = flashcardsQuerySchema.safeParse(queryParams);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get flashcards using the service
    const flashcardsResponse = await getFlashcards(supabase, userId, result.data);

    // Return the response
    return new Response(JSON.stringify(flashcardsResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
