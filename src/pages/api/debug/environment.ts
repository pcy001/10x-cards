import type { APIRoute } from "astro";

export const prerender = false;

/**
 * GET handler do diagnostyki środowiska
 * Zwraca informacje o zmiennych środowiskowych i dostępnych API
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź dostępne globalne obiekty
    const globals = {
      MessageChannel: typeof MessageChannel !== 'undefined',
      setTimeout: typeof setTimeout !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      Request: typeof Request !== 'undefined',
      Response: typeof Response !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
    };

    // Sprawdź zmienne środowiskowe (maskujemy wartości)
    const env = {
      SUPABASE_URL: !!process.env.SUPABASE_URL || !!import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY || !!import.meta.env.SUPABASE_KEY,
      PUBLIC_SUPABASE_URL: !!process.env.PUBLIC_SUPABASE_URL || !!import.meta.env.PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY: !!process.env.PUBLIC_SUPABASE_ANON_KEY || !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      CLOUDFLARE_KV_BINDING_SESSION: !!process.env.CLOUDFLARE_KV_BINDING_SESSION || !!import.meta.env.CLOUDFLARE_KV_BINDING_SESSION,
      CF_PAGES: !!process.env.CF_PAGES || !!import.meta.env.CF_PAGES,
    };

    // Sprawdź dostęp do klienta Supabase
    let supabaseStatus = 'Not available';
    try {
      if (locals.supabase) {
        const { data, error } = await locals.supabase.auth.getSession();
        supabaseStatus = error ? `Error: ${error.message}` : 'Connected';
      }
    } catch (e) {
      supabaseStatus = `Exception: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Połącz wszystkie informacje
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries([...request.headers.entries()].filter(([key]) => !key.includes('auth') && !key.includes('cookie'))),
      },
      environment: env,
      runtime: {
        globals,
        supabase: supabaseStatus,
        platform: typeof process !== 'undefined' ? process.platform : 'browser',
        nodejs: typeof process !== 'undefined' ? process.version : undefined,
      },
    };

    return new Response(JSON.stringify(diagnosticInfo, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Diagnostic endpoint error:", error);
    
    return new Response(JSON.stringify({
      error: "Diagnostic error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 