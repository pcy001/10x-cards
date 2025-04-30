import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Pomocnicza funkcja do pobrania zmiennych środowiskowych
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

// Pobierz zmienne używając różnych nazw, jeśli główne są niedostępne
const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');

// Sprawdź czy zmienne są zdefiniowane
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_KEY environment variable');
}

// Utwórz i wyeksportuj klienta
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
