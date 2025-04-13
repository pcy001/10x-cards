import type { APIRoute } from "astro";
import type { FlashcardsResponseDto } from "@/types";

export const prerender = false;

/**
 * GET handler for retrieving all flashcards
 * Supports pagination and sorting
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    // Pobierz parametry z URL
    const params = url.searchParams;
    const page = parseInt(params.get("page") || "1");
    const perPage = Math.min(parseInt(params.get("per_page") || "20"), 100); // Limit max 100
    const sortBy = params.get("sort_by") || "created_at";
    const sortDir = params.get("sort_dir") || "desc";

    // Walidacja parametrów
    if (isNaN(page) || page < 1) {
      return new Response(JSON.stringify({ message: "Nieprawidłowy numer strony" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isNaN(perPage) || perPage < 1) {
      return new Response(JSON.stringify({ message: "Nieprawidłowa liczba elementów na stronę" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!["created_at", "correct_answers_count"].includes(sortBy)) {
      return new Response(JSON.stringify({ message: "Nieprawidłowe pole sortowania" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!["asc", "desc"].includes(sortDir)) {
      return new Response(JSON.stringify({ message: "Nieprawidłowy kierunek sortowania" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // W prawdziwej implementacji tutaj byłoby zapytanie do bazy danych
    // Dla celów demonstracyjnych generujemy przykładowe dane

    const totalItems = 42; // Przykładowa liczba wszystkich fiszek
    const totalPages = Math.ceil(totalItems / perPage);

    // Przykładowe dane
    const sampleFlashcards = Array(Math.min(perPage, totalItems))
      .fill(null)
      .map((_, index) => {
        const id = `card-${(page - 1) * perPage + index + 1}`;

        return {
          id,
          front_content: `Przykładowa treść przodu fiszki ${id}`,
          back_content: `Przykładowa treść tyłu fiszki ${id}`,
          is_ai_generated: Math.random() > 0.7, // 30% szans, że fiszka jest wygenerowana przez AI
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          correct_answers_count: Math.floor(Math.random() * 10),
        };
      });

    // Sortowanie zgodnie z parametrami
    sampleFlashcards.sort((a, b) => {
      if (sortBy === "created_at") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDir === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        // correct_answers_count
        return sortDir === "asc"
          ? a.correct_answers_count - b.correct_answers_count
          : b.correct_answers_count - a.correct_answers_count;
      }
    });

    const response: FlashcardsResponseDto = {
      data: sampleFlashcards,
      pagination: {
        total: totalItems,
        pages: totalPages,
        current_page: page,
        per_page: perPage,
      },
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Błąd podczas pobierania fiszek:", error);

    return new Response(JSON.stringify({ message: "Wystąpił błąd podczas pobierania fiszek" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
