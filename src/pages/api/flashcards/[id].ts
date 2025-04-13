import { isUUID } from "@/lib/utils";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const flashcardId = params.id;

  if (!flashcardId || !isUUID(flashcardId)) {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy identyfikator fiszki",
      }),
      { status: 400 }
    );
  }

  const supabase = locals.supabase;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({
        error: "Wymagane uwierzytelnienie",
      }),
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Wystąpił błąd podczas pobierania fiszki",
      }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const flashcardId = params.id;

  if (!flashcardId || !isUUID(flashcardId)) {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy identyfikator fiszki",
      }),
      { status: 400 }
    );
  }

  const supabase = locals.supabase;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({
        error: "Wymagane uwierzytelnienie",
      }),
      { status: 401 }
    );
  }

  try {
    // Najpierw sprawdź, czy fiszka należy do użytkownika
    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcardId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Fiszka nie została znaleziona lub nie masz uprawnień do jej usunięcia",
        }),
        { status: 404 }
      );
    }

    // Usuń fiszkę
    const { error: deleteError } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", flashcardId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Wystąpił błąd podczas usuwania fiszki",
      }),
      { status: 500 }
    );
  }
};
