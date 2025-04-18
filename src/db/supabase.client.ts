import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Obsługa zarówno zmiennych z Astro (import.meta.env) jak i Node.js (process.env)
const supabaseUrl = 
  typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_URL 
    ? import.meta.env.SUPABASE_URL 
    : process.env.SUPABASE_URL || '';

const supabaseAnonKey = 
  typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_KEY 
    ? import.meta.env.SUPABASE_KEY 
    : process.env.SUPABASE_KEY || '';

// Sprawdzanie czy zmienne są zdefiniowane
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
