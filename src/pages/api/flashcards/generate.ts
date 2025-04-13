import type { APIRoute } from "astro";
import type { GenerateFlashcardsResponseDto } from "@/types";
import { detectLanguage, generateFlashcardsWithAI } from "@/lib/ai/openrouter";
import { generateFlashcardsSchema } from "@/lib/validation/schemas";

export const prerender = false;

/**
 * POST handler for generating flashcards from text
 * Validates input, calls the AI service, and returns generated flashcards
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Pobranie danych z żądania
    const body = await request.json();

    // Walidacja danych wejściowych z użyciem Zod
    const result = generateFlashcardsSchema.safeParse(body);
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

    const { source_text, target_language, generation_type, difficulty_level, limit } = result.data;

    if (source_text.length > 10000) {
      return new Response(
        JSON.stringify({
          error: "Content too large",
          message: "Tekst źródłowy przekracza limit 10 000 znaków",
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wykrywanie języka źródłowego przy pomocy OpenRouter.ai
    const detectedSourceLanguage = await detectLanguage(source_text);

    // Generowanie fiszek przy pomocy OpenRouter.ai
    const flashcards = await generateFlashcardsWithAI({
      sourceText: source_text,
      targetLanguage: target_language,
      generationType: generation_type,
      difficultyLevel: difficulty_level,
      limit: limit,
    });

    const response: GenerateFlashcardsResponseDto = {
      detected_source_language: detectedSourceLanguage,
      flashcards: flashcards,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas generowania fiszek:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Wystąpił nieznany błąd podczas generowania fiszek",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
