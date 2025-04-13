import type { APIContext } from "astro";
import { getDueFlashcardsCount } from "../../../lib/services/learning.service";
import type { DueFlashcardsCountResponseDto } from "../../../types";

// Disable prerendering for dynamic API endpoint
export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  try {
    // Check if user is authenticated
    const { data: sessionData } = await context.locals.supabase.auth.getSession();
    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized access. Please login to continue." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user ID from authorized user
    const userId = sessionData.session.user.id;

    // Use current date for the query
    const today = new Date();

    // Call service function to get due counts
    const result = await getDueFlashcardsCount(context.locals.supabase, {
      userId,
      today,
    });

    // Transform service result to API response format
    const response: DueFlashcardsCountResponseDto = {
      due_today: result.dueToday,
      due_next_week: {
        total: result.dueNextWeek.total,
        by_day: result.dueNextWeek.byDay.map((day) => ({
          date: day.date,
          count: day.count,
        })),
      },
    };

    // Return successful response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300", // Allow 5 min caching
      },
    });
  } catch (error) {
    // Log the error server-side with full details
    // eslint-disable-next-line no-console
    console.error("Error handling due-count request:", error);

    // Return generic error to the client
    return new Response(
      JSON.stringify({
        error: "An error occurred while fetching due flashcards count.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
