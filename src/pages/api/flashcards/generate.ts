import type { APIRoute } from "astro";
import { generateFlashcardsFromText } from "../../../lib/ai/openrouter";
import { generateFlashcardsSchema } from "../../../lib/validation/schemas";
import type { GenerateFlashcardsResponseDto } from "../../../types";

export const prerender = false;

/**
 * POST handler for generating flashcards from text
 * Validates input, calls the AI service, and returns generated flashcards
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const supabase = locals.supabase;
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { source_text } = result.data;

    // Check text size to prevent abuse
    if (source_text.length > 10000) {
      return new Response(
        JSON.stringify({
          error: "Text too large",
          message: "Source text cannot exceed 10,000 characters",
        }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate flashcards using AI
    const flashcards = await generateFlashcardsFromText(source_text);

    // Return the generated flashcards
    const response: GenerateFlashcardsResponseDto = {
      flashcards: flashcards,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
