import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Lepsza obsługa zmiennych środowiskowych w różnych środowiskach
function getEnvVariable(name: string): string {
  // Sprawdź różne sposoby dostępu do zmiennych
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  
  // Dodatkowa obsługa dla Cloudflare Pages
  if (typeof self !== 'undefined' && 'SUPABASE_URL' in self) {
    return (self as any)[name];
  }
  
  console.error(`Missing environment variable: ${name}`);
  return '';
}

// Pobierz zmienne używając różnych nazw, jeśli główne są niedostępne
const supabaseUrl = getEnvVariable('SUPABASE_URL') || getEnvVariable('PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVariable('SUPABASE_KEY') || getEnvVariable('PUBLIC_SUPABASE_ANON_KEY') || getEnvVariable('SUPABASE_ANON_KEY');

// Sprawdź czy zmienne są zdefiniowane i zaloguj ich dostępność (bez wartości)
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_KEY environment variable');
}

// Utwórz i wyeksportuj klienta
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
