import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";

// Adresy URL, które nie wymagają uwierzytelnienia
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/reset-redirect",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/update-password",
  "/",
  "/api/debug/environment", // Endpoint diagnostyczny
  "/debug-info", // Strona diagnostyczna
];

// Funkcja do logowania błędów
function logError(context: string, error: unknown) {
  console.error(`[ERROR][${context}]`, error instanceof Error 
    ? { message: error.message, stack: error.stack } 
    : error
  );
}

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  try {
    console.log(`[Request] ${request.method} ${new URL(request.url).pathname}`);
    
    // Sprawdź dostępność MessageChannel (problem Cloudflare)
    if (typeof MessageChannel === 'undefined') {
      console.warn('[Middleware] MessageChannel is not defined in this environment');
    }
    
    // Dodaj klienta Supabase do kontekstu żądania
    try {
      locals.supabase = supabaseClient;
      console.log('[Middleware] Supabase client attached');
    } catch (error) {
      logError('Supabase Client Initialization', error);
      // Kontynuuj, aby zobaczyć inne potencjalne problemy
    }

    // Sprawdź, czy ścieżka jest publiczna
    const url = new URL(request.url);
    const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname === path);
    console.log(`[Middleware] Path: ${url.pathname}, Public: ${isPublicPath}`);

    // Jeśli to nie jest ścieżka publiczna, sprawdź sesję
    if (!isPublicPath) {
      try {
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession();

        if (error) {
          logError('Session Check', error);
          return redirect("/auth/login");
        }

        if (!session) {
          console.log('[Middleware] No active session, redirecting to login');
          return redirect("/auth/login");
        }

        console.log(`[Middleware] Authenticated user: ${session.user.email}`);
      } catch (error) {
        logError('Auth Flow', error);
        return redirect("/auth/login");
      }
    }

    // Kontynuuj obsługę żądania
    try {
      const response = await next();
      console.log(`[Response] Status: ${response.status}`);
      return response;
    } catch (error) {
      logError('Request Handling', error);
      throw error; // Re-throw, aby Astro mogło obsłużyć błąd
    }
  } catch (error) {
    logError('Middleware (Unhandled)', error);
    throw error; // Re-throw, aby Astro mogło obsłużyć błąd
  }
});
