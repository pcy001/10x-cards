import type { APIRoute } from "astro";
import * as env from 'astro:env';

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
      self: typeof self !== 'undefined',
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
    };

    // Lista zmiennych do sprawdzenia
    const envVarNames = [
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'PUBLIC_SUPABASE_URL',
      'PUBLIC_SUPABASE_ANON_KEY',
      'CLOUDFLARE_KV_BINDING_SESSION',
      'CF_PAGES',
    ];

    // Sprawdź zmienne środowiskowe z użyciem astro:env (bez ujawniania wartości)
    const envVars = Object.fromEntries(
      envVarNames.map(name => [name, name in env && typeof env[name as keyof typeof env] === 'string'])
    );

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
      environment: {
        variables: envVars,
        astroEnv: {
          available: typeof env !== 'undefined',
          hasVars: typeof env !== 'undefined' && Object.keys(env).length > 0,
        }
      },
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