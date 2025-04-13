import type { APIRoute } from "astro";
import { acceptFlashcardsSchema } from "../../../lib/validation/schemas";
import { saveAcceptedFlashcards } from "../../../lib/services/flashcard.service";
import type { AcceptFlashcardsResponseDto } from "../../../types";

export const prerender = false;

/**
 * POST handler for accepting flashcards
 * Saves user-selected flashcards to their permanent collection
 */
export const POST: APIRoute = async ({ request, locals }) => {
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
    // Parse and validate request body
    const body = await request.json();
    const result = acceptFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { flashcards } = result.data;

    // Save flashcards to the database
    const savedFlashcards = await saveAcceptedFlashcards(supabase, userId, flashcards);

    // Return the saved flashcards
    const response: AcceptFlashcardsResponseDto = {
      accepted_count: savedFlashcards.length,
      flashcards: savedFlashcards,
    };

    return new Response(JSON.stringify(response), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error accepting flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
