// Follow this setup guide to integrate the Deno runtime and its functions with Supabase
// https://supabase.com/docs/guides/functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Dane użytkownika testowego - takie same jak w .env.test
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test10x';

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    // Utwórz klienta Supabase z kluczem service_role, który ma uprawnienia administratora
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Sprawdź, czy użytkownik już istnieje
    const { data: existingUser, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      throw new Error(`Błąd podczas wyszukiwania użytkownika: ${searchError.message}`);
    }
    
    const userExists = existingUser.users.some(user => user.email === TEST_EMAIL);
    
    if (userExists) {
      return new Response(
        JSON.stringify({ success: true, message: 'Użytkownik testowy już istnieje', userExists: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Utwórz użytkownika testowego
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true // Automatycznie potwierdź email
    });
    
    if (error) {
      throw new Error(`Błąd podczas tworzenia użytkownika: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Użytkownik testowy został utworzony', 
        userId: data.user.id 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-test-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
