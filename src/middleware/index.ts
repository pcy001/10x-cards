import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  // Set up default supabase client
  context.locals.supabase = supabaseClient;

  // Check for Authorization header with Bearer token
  const authHeader = context.request.headers.get("Authorization");
  const refreshToken = context.request.headers.get("X-Refresh-Token");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Set the session on the existing client
      await supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: refreshToken || "",
      });

      // Using the same client instance (following backend rules)
      context.locals.supabase = supabaseClient;
    } catch (error) {
      console.error("Error setting auth session:", error);
    }
  }

  return next();
});
