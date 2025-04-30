import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import * as env from 'astro:env';

let supabaseUrl = '';
let supabaseKey = '';

// Próba pobrania zmiennych z astro:env
try {
  supabaseUrl = env.getSecret('SUPABASE_URL');
} catch (e) {
  // Fallback do standardowego import.meta.env
  supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
    ? (import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || '')
    : '';
}

try {
  supabaseKey = env.getSecret('SUPABASE_KEY');
} catch (e) {
  // Fallback do standardowego import.meta.env
  supabaseKey = typeof import.meta !== 'undefined' && import.meta.env 
    ? (import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '')
    : '';
}

// Sprawdź czy zmienne są zdefiniowane
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_KEY environment variable');
}

// Utwórz i wyeksportuj klienta
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
