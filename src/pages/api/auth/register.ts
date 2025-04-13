import type { APIRoute } from "astro";
import { registerUserSchema } from "../../../lib/validation/auth.schemas";
import { registerUser } from "../../../lib/services/auth.service";
import type { RegisterUserResponseDto } from "../../../types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = registerUserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = result.data;

    // Register the user
    try {
      const user = await registerUser(supabase, email, password);

      // Return the created user
      const response: RegisterUserResponseDto = {
        id: user.id,
        email: user.email,
      };

      return new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle user already exists error
      if (error instanceof Error && error.message.includes("already in use")) {
        return new Response(
          JSON.stringify({
            error: "Email already in use",
            message: "A user with this email address already exists",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      // Re-throw other errors to be caught by the general error handler
      throw error;
    }
  } catch (error) {
    console.error("Error during registration:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
