import type { APIRoute } from "astro";
import { logoutUser } from "../../../lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  try {
    // Attempt to logout user
    await logoutUser(supabase);

    // Return 204 No Content for successful logout
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error during logout:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
