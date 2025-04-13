import type { SupabaseClient } from "@supabase/supabase-js";
import type { UUID, LoginResponseDto } from "../../types";

/**
 * Registers a new user with the provided email and password
 *
 * @param supabase - The Supabase client instance
 * @param email - User's email
 * @param password - User's password
 * @returns Object containing the new user's ID and email
 * @throws Error if registration fails
 */
export async function registerUser(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<{ id: UUID; email: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Handle specific error types
      if (error.message.includes("already registered")) {
        throw new Error("Email already in use");
      }
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("No user data returned from registration");
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
    };
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
}

/**
 * Authenticates a user with email and password
 *
 * @param supabase - The Supabase client instance
 * @param email - User's email
 * @param password - User's password
 * @returns Object containing authenticated user data and session information
 * @throws Error if authentication fails
 */
export async function loginUser(supabase: SupabaseClient, email: string, password: string): Promise<LoginResponseDto> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error("No user or session data returned from authentication");
    }

    // Format expires_at safely ensuring it's a valid date
    let expiresAtIso: string;
    if (data.session.expires_at) {
      expiresAtIso = new Date(data.session.expires_at * 1000).toISOString();
    } else {
      // Calculate a default expiration (1 hour from now)
      const defaultExpiration = new Date();
      defaultExpiration.setHours(defaultExpiration.getHours() + 1);
      expiresAtIso = defaultExpiration.toISOString();
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: expiresAtIso,
      },
    };
  } catch (error) {
    console.error("Error during user authentication:", error);
    throw error;
  }
}

/**
 * Logs out a user by invalidating their current session
 *
 * @param supabase - The Supabase client instance
 * @returns void
 * @throws Error if logout fails
 */
export async function logoutUser(supabase: SupabaseClient): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Error during user logout:", error);
    throw error;
  }
}
