import type { APIRoute } from "astro";
import { startLearningSessionSchema } from "../../../lib/validation/schemas";
import { startLearningSession } from "../../../lib/services/learning.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    const { data: sessionData } = await locals.supabase.auth.getSession();
    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = sessionData.session.user.id;

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Validate request data
    const validationResult = startLearningSessionSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Start learning session
    const result = await startLearningSession(locals.supabase, userId, validationResult.data);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error starting learning session:", err);

    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const status = errorMessage.includes("Unauthorized") ? 401 : errorMessage.includes("Invalid") ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: "Failed to start learning session",
        message: errorMessage,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
