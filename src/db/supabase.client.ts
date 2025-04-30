import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Import zmiennych środowiskowych z Astro
import { SUPABASE_URL, SUPABASE_KEY, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from 'astro:env';

// Pobierz URL i klucz używając zmiennych dostarczonych przez Astro
const supabaseUrl = SUPABASE_URL || PUBLIC_SUPABASE_URL || '';
const supabaseKey = SUPABASE_KEY || PUBLIC_SUPABASE_ANON_KEY || '';

// Sprawdź czy zmienne są zdefiniowane
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_KEY environment variable');
}

// Utwórz i wyeksportuj klienta
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
