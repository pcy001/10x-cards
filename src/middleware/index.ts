import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

// Import zmiennych środowiskowych z Astro
import { SUPABASE_URL, SUPABASE_KEY, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from 'astro:env';

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
      if (!supabaseClient) {
        console.error('[Middleware] Supabase client not initialized from import');
        
        // Próba utworzenia nowego klienta jako fallback
        const supabaseUrl = SUPABASE_URL || PUBLIC_SUPABASE_URL || '';
        const supabaseKey = SUPABASE_KEY || PUBLIC_SUPABASE_ANON_KEY || '';
        
        console.log(`[Middleware] Environment variables availability: SUPABASE_URL=${!!supabaseUrl}, SUPABASE_KEY=${!!supabaseKey}`);
        
        if (supabaseUrl && supabaseKey) {
          locals.supabase = createClient<Database>(supabaseUrl, supabaseKey);
          console.log('[Middleware] Created fallback Supabase client');
        } else {
          // Dla celów diagnostycznych, zwróć 200 dla ścieżek diagnostycznych
          const url = new URL(request.url);
          if (url.pathname === '/api/debug/environment' || url.pathname === '/debug-info') {
            console.log('[Middleware] Allowing debug endpoint without Supabase');
            const response = await next();
            return response;
          }
          
          throw new Error('Missing Supabase environment variables');
        }
      } else {
        locals.supabase = supabaseClient;
        console.log('[Middleware] Supabase client attached from import');
      }
    } catch (error) {
      logError('Supabase Client Initialization', error);
      
      // Dla celów diagnostycznych, zwróć 200 dla ścieżek diagnostycznych
      const url = new URL(request.url);
      if (url.pathname === '/api/debug/environment' || url.pathname === '/debug-info') {
        console.log('[Middleware] Allowing debug endpoint despite Supabase error');
        try {
          const response = await next();
          return response;
        } catch (innerError) {
          logError('Debug Endpoint Processing', innerError);
          return new Response(JSON.stringify({
            error: 'Failed to process debug request',
            details: error instanceof Error ? error.message : String(error)
          }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      }
      
      // Dla innych ścieżek, przekieruj do logowania lub zwróć błąd
      if (PUBLIC_PATHS.includes(new URL(request.url).pathname)) {
        console.log('[Middleware] Public path, continuing without Supabase');
        return next();
      } else {
        return redirect("/auth/login");
      }
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
        } = await locals.supabase.auth.getSession();

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
