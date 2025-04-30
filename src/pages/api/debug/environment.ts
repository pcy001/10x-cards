import type { APIRoute } from "astro";

export const prerender = false;

// Funkcja pomocnicza do pobrania zmiennych środowiskowych
function getEnvVariable(name: string): boolean {
  // Sprawdź różne sposoby dostępu do zmiennych
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return true;
  }
  
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return true;
  }
  
  // Dodatkowa obsługa dla Cloudflare Pages
  if (typeof self !== 'undefined' && name in (self as any)) {
    return true;
  }
  
  return false;
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

    // Sprawdź zmienne środowiskowe (maskujemy wartości)
    const env = {
      SUPABASE_URL: getEnvVariable('SUPABASE_URL'),
      SUPABASE_KEY: getEnvVariable('SUPABASE_KEY'),
      PUBLIC_SUPABASE_URL: getEnvVariable('PUBLIC_SUPABASE_URL'),
      PUBLIC_SUPABASE_ANON_KEY: getEnvVariable('PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_ANON_KEY: getEnvVariable('SUPABASE_ANON_KEY'),
      CLOUDFLARE_KV_BINDING_SESSION: getEnvVariable('CLOUDFLARE_KV_BINDING_SESSION'),
      CF_PAGES: getEnvVariable('CF_PAGES'),
    };

    // Sprawdź dostępne metody dostępu do zmiennych środowiskowych
    const envAccess = {
      importMeta: typeof import.meta !== 'undefined',
      importMetaEnv: typeof import.meta !== 'undefined' && 'env' in import.meta,
      process: typeof process !== 'undefined',
      processEnv: typeof process !== 'undefined' && 'env' in process,
      self: typeof self !== 'undefined',
      selfHasEnvVars: typeof self !== 'undefined' && ('SUPABASE_URL' in (self as any) || 'SUPABASE_KEY' in (self as any)),
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
        variables: env,
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