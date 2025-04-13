import type { APIRoute } from "astro";
import type { UUID } from "../../../../types";
import { getFlashcardForReview, reviewFlashcard } from "../../../../lib/services/flashcard.service";
import { reviewFlashcardSchema } from "../../../../lib/validation/schemas";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  // Check if user is authenticated
  const session = await locals.supabase.auth.getSession();
  if (!session.data.session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.data.session.user.id;
  const flashcardId = params.id as UUID;

  // Validate flashcard ID format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!flashcardId || !uuidRegex.test(flashcardId)) {
    return new Response(JSON.stringify({ error: "Invalid flashcard ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get flashcard data from service
    const flashcard = await getFlashcardForReview(locals.supabase, userId, flashcardId);

    // Return flashcard data
    return new Response(JSON.stringify(flashcard), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error retrieving flashcard:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generic error handler
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * POST handler for submitting a flashcard review
 * Records user feedback and calculates next review date
 */
export const POST: APIRoute = async ({ request, params, locals }) => {
  // Check authentication
  const { data: sessionData } = await locals.supabase.auth.getSession();

  if (!sessionData.session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = sessionData.session.user.id;
  const flashcardId = params.id as UUID;

  // Validate flashcard ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!flashcardId || !uuidRegex.test(flashcardId)) {
    return new Response(JSON.stringify({ error: "Invalid flashcard ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = reviewFlashcardSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process the review
    const response = await reviewFlashcard(locals.supabase, userId, flashcardId, result.data);

    // Return the next review date
    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error processing flashcard review:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error.message.includes("Invalid session")) {
        return new Response(JSON.stringify({ error: "Invalid session" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Generic server error
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
