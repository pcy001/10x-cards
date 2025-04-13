import type { APIRoute } from "astro";
import { createFlashcardSchema } from "../../lib/validation/schemas";
import { createFlashcard } from "../../lib/services/flashcard.service";
import { fromZodError } from "zod-validation-error";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    const supabase = locals.supabase;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get request data
    const body = await request.json();
    
    // Validate input data
    const result = createFlashcardSchema.safeParse(body);
    
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Pass data to service
    const userId = session.user.id;
    const flashcard = await createFlashcard(supabase, userId, result.data);
    
    // Return response
    return new Response(
      JSON.stringify(flashcard),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 