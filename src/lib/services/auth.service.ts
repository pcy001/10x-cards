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

/**
 * Sends a password reset email to the user
 *
 * @param supabase - The Supabase client instance
 * @param email - User's email address
 * @param redirectTo - URL to redirect to after password reset
 * @returns void
 * @throws Error if the password reset request fails
 */
export async function resetPasswordRequest(
  supabase: SupabaseClient,
  email: string,
  redirectTo?: string
): Promise<void> {
  try {
    // W środowisku produkcyjnym używamy przekazanego URL lub adresu strony reset-redirect
    // Strona reset-redirect obsłuży konwersję parametrów fragmentów URL na query params
    const resetRedirectUrl = redirectTo
      ? redirectTo
      : // W środowisku serwerowym nie możemy użyć window.location
        // Używamy domyślnego lub przekazanego URL
        "/auth/reset-redirect";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectUrl,
    });

    if (error) {
      throw new Error(`Password reset request failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Error during password reset request:", error);
    throw error;
  }
}

/**
 * Updates user's password after reset
 *
 * @param supabase - The Supabase client instance
 * @param newPassword - The new password for the user
 * @returns void
 * @throws Error if the password update fails
 */
export async function updateUserPassword(supabase: SupabaseClient, newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Error during password update:", error);
    throw error;
  }
}

/**
 * Updates user's password using a reset password token
 *
 * @param supabase - The Supabase client instance
 * @param newPassword - The new password for the user
 * @param token - The password reset token from email
 * @returns void
 * @throws Error if the password update fails
 */
export async function updateUserPasswordWithToken(
  supabase: SupabaseClient,
  newPassword: string,
  token: string
): Promise<void> {
  try {
    // Użyj tokenu bezpośrednio w updateUser
    const { error } = await supabase.auth.resetPasswordForEmail("", {
      redirectTo: window.location.origin + "/auth/reset-redirect?token=" + token,
    });

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }

    // Aktualizuj hasło
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(`Password update failed: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error during password update with token:", error);
    throw error;
  }
}
