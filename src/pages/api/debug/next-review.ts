import type { APIContext } from "astro";

// Wyłącz prerenderowanie dla dynamicznego API endpoint
export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  try {
    // Sprawdź czy użytkownik jest zalogowany
    const { data: sessionData } = await context.locals.supabase.auth.getSession();
    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized access. Please login to continue." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobierz ID użytkownika z sesji
    const userId = sessionData.session.user.id;

    // Pobierz nadchodzące powtórki z bazy danych
    const { data: reviews, error } = await context.locals.supabase
      .from("flashcard_reviews")
      .select("flashcard_id, next_review_date, is_correct")
      .eq("user_id", userId)
      .order("next_review_date", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching upcoming reviews:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch upcoming reviews" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Zwróć dane powtórek
    return new Response(JSON.stringify({ reviews }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate", // Wyłącz cache
      },
    });
  } catch (error) {
    console.error("Error in debug next-review API:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 