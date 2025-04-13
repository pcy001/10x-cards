import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals, redirect }) => {
  try {
    const supabase = locals.supabase;
    
    // Wyloguj użytkownika
    await supabase.auth.signOut();
    
    // Przekieruj do strony logowania z dołączonym skryptem do czyszczenia localStorage
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Wylogowanie</title>
          <script>
            // Usuń token z localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('sb-supabase-auth-token');
            // Przekieruj do strony logowania
            window.location.href = '/auth/login';
          </script>
        </head>
        <body>
          <p>Wylogowywanie...</p>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error in logout:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Wystąpił nieznany błąd podczas wylogowywania" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
