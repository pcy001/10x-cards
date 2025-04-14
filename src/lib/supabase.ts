import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

// Create Supabase client for server-side rendering
export const supabase = createClient<Database>(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);

// Create Supabase client for client-side usage
export const createBrowserClient = () => {
  return createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}; 