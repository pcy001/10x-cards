import type { APIRoute } from "astro";

export const prerender = false;

// Funkcja pomocnicza do pobrania zmiennych środowiskowych
function getEnv(name: string, fallback: string = ''): string {
  // Sprawdź import.meta.env (działa zarówno w dev, build, jak i testach)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[name];
    if (value) return value;
  }
  
  // Sprawdź process.env (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[name];
    if (value) return value;
  }
  
  // Sprawdź globalne self (Cloudflare Workers)
  if (typeof self !== 'undefined' && (self as any)[name]) {
    return (self as any)[name];
  }
  
  return fallback;
}

// Sprawdź czy zmienna środowiskowa jest dostępna
function hasEnv(name: string): boolean {
  return !!getEnv(name);
}

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
      'OPENROUTER_API_KEY',
      'CLOUDFLARE_KV_BINDING_SESSION',
      'CF_PAGES',
    ];

    // Sprawdź zmienne środowiskowe z uniwersalnej funkcji (bez ujawniania wartości)
    const envVars = Object.fromEntries(envVarNames.map(name => [name, hasEnv(name)]));

    // Sprawdź dostępne metody dostępu do zmiennych środowiskowych
    const envAccess = {
      importMeta: typeof import.meta !== 'undefined',
      importMetaEnv: typeof import.meta !== 'undefined' && 'env' in import.meta,
      process: typeof process !== 'undefined',
      processEnv: typeof process !== 'undefined' && 'env' in process,
      self: typeof self !== 'undefined',
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
      environment: {
        variables: envVars,
        access: envAccess,
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