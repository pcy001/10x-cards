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

    // Sprawdź zmienne środowiskowe z astro:env
    let envVars = {};
    try {
      // Sprawdź dostępność astro:env
      envVars = {
        SUPABASE_URL: false,
        SUPABASE_KEY: false,
        PUBLIC_SUPABASE_URL: false,
        PUBLIC_SUPABASE_ANON_KEY: false,
        OPENROUTER_API_KEY: false,
      };

      // Sprawdź zmienne serwerowe/sekretne
      try { envVars['SUPABASE_URL'] = !!env.getSecret('SUPABASE_URL'); } catch (e) {}
      try { envVars['SUPABASE_KEY'] = !!env.getSecret('SUPABASE_KEY'); } catch (e) {}
      try { envVars['OPENROUTER_API_KEY'] = !!env.getSecret('OPENROUTER_API_KEY'); } catch (e) {}

      // Sprawdź zmienne publiczne
      try { envVars['PUBLIC_SUPABASE_URL'] = !!env.getPublic('PUBLIC_SUPABASE_URL'); } catch (e) {}
      try { envVars['PUBLIC_SUPABASE_ANON_KEY'] = !!env.getPublic('PUBLIC_SUPABASE_ANON_KEY'); } catch (e) {}
    } catch (e) {
      console.warn('Error checking astro:env variables', e);
    }

    // Sprawdź zmienne środowiskowe z import.meta.env (fallback)
    const importMetaEnvVars = {
      SUPABASE_URL: typeof import.meta !== 'undefined' && import.meta.env ? !!import.meta.env.SUPABASE_URL : false,
      SUPABASE_KEY: typeof import.meta !== 'undefined' && import.meta.env ? !!import.meta.env.SUPABASE_KEY : false,
      PUBLIC_SUPABASE_URL: typeof import.meta !== 'undefined' && import.meta.env ? !!import.meta.env.PUBLIC_SUPABASE_URL : false,
      PUBLIC_SUPABASE_ANON_KEY: typeof import.meta !== 'undefined' && import.meta.env ? !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY : false,
      OPENROUTER_API_KEY: typeof import.meta !== 'undefined' && import.meta.env ? !!import.meta.env.OPENROUTER_API_KEY : false,
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
        astroEnv: {
          available: typeof env !== 'undefined',
          variables: envVars,
        },
        importMetaEnv: {
          available: typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined',
          variables: importMetaEnvVars,
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