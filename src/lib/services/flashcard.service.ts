import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlashcardToAcceptDto,
  AcceptedFlashcardDto,
  UUID,
  FlashcardsResponseDto,
  FlashcardResponseDto,
  PaginationMeta,
  GetFlashcardForReviewResponseDto,
  Timestamp,
} from "../../types";
import type { FlashcardsQueryInput, ReviewFlashcardInput } from "../validation/schemas";

/**
 * Saves user-accepted flashcards to the database
 *
 * @param supabase - The authenticated Supabase client instance
 * @param userId - The ID of the user saving the flashcards
 * @param flashcards - Array of flashcards to save
 * @returns Array of saved flashcards with their IDs and creation timestamps
 * @throws Error if the database operation fails
 */
export async function saveAcceptedFlashcards(
  supabase: SupabaseClient,
  userId: UUID,
  flashcards: FlashcardToAcceptDto[]
): Promise<AcceptedFlashcardDto[]> {
  try {
    // Prepare the flashcards data for insertion
    const flashcardsToInsert = flashcards.map((card) => ({
      front_content: card.front_content,
      back_content: card.back_content,
      is_ai_generated: card.is_ai_generated,
      user_id: userId,
      correct_answers_count: 0,
    }));

    // Insert the flashcards in a single transaction
    const { data, error } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, front_content, back_content, is_ai_generated, created_at");

    if (error) {
      throw new Error(`Failed to save flashcards: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from flashcard insertion");
    }

    // Map the response to the expected DTO format
    return data.map((card) => ({
      id: card.id,
      front_content: card.front_content,
      back_content: card.back_content,
      is_ai_generated: card.is_ai_generated,
      created_at: card.created_at,
    }));
  } catch (error) {
    console.error("Error saving flashcards:", error);
    throw error;
  }
}

/**
 * Retrieves a paginated list of flashcards for a user
 *
 * @param supabase - The authenticated Supabase client instance
 * @param userId - The ID of the user whose flashcards to retrieve
 * @param params - Query parameters for pagination and sorting
 * @returns Paginated flashcards and pagination metadata
 * @throws Error if the database operation fails
 */
export async function getFlashcards(
  supabase: SupabaseClient,
  userId: UUID,
  params: FlashcardsQueryInput
): Promise<FlashcardsResponseDto> {
  try {
    const { page, per_page, sort_by, sort_dir } = params;
    const offset = (page - 1) * per_page;

    // Get flashcards with pagination and sorting
    const { data, error, count } = await supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sort_by, { ascending: sort_dir === "asc" })
      .range(offset, offset + per_page - 1);

    if (error) {
      throw new Error(`Failed to retrieve flashcards: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from flashcard query");
    }

    // Format the response data
    const flashcards: FlashcardResponseDto[] = data.map((card) => ({
      id: card.id,
      front_content: card.front_content,
      back_content: card.back_content,
      is_ai_generated: card.is_ai_generated,
      created_at: card.created_at,
      correct_answers_count: card.correct_answers_count,
    }));

    // Calculate pagination metadata
    const total = count || 0;
    const pages = Math.ceil(total / per_page);
    const pagination: PaginationMeta = {
      total,
      pages,
      current_page: page,
      per_page,
    };

    return {
      data: flashcards,
      pagination,
    };
  } catch (error) {
    console.error("Error retrieving flashcards:", error);
    throw error;
  }
}

/**
 * Retrieves a flashcard with full content for review
 *
 * @param supabase - The authenticated Supabase client instance
 * @param userId - ID of the user requesting the flashcard
 * @param flashcardId - ID of the flashcard to retrieve
 * @returns Flashcard with full content for review
 * @throws Error if flashcard doesn't exist, doesn't belong to the user, or the operation fails
 */
export async function getFlashcardForReview(
  supabase: SupabaseClient,
  userId: UUID,
  flashcardId: UUID
): Promise<GetFlashcardForReviewResponseDto> {
  try {
    // Retrieve the flashcard by ID, ensuring it belongs to the current user
    const { data, error } = await supabase
      .from("flashcards")
      .select("id, front_content, back_content, is_ai_generated")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PostgreSQL error code for no rows returned
        throw new Error("Flashcard not found");
      }
      throw new Error(`Failed to retrieve flashcard: ${error.message}`);
    }

    if (!data) {
      throw new Error("Flashcard not found");
    }

    return {
      id: data.id,
      front_content: data.front_content,
      back_content: data.back_content,
      is_ai_generated: data.is_ai_generated,
    };
  } catch (error) {
    console.error("Error retrieving flashcard for review:", error);
    throw error;
  }
}

/**
 * Submits a review for a flashcard and calculates the next review date
 *
 * @param supabase - The authenticated Supabase client instance
 * @param userId - The ID of the user submitting the review
 * @param flashcardId - The ID of the flashcard being reviewed
 * @param reviewData - The review data including difficulty rating and correctness
 * @returns The calculated next review date
 * @throws Error if flashcard not found or database operation fails
 */
export async function reviewFlashcard(
  supabase: SupabaseClient,
  userId: UUID,
  flashcardId: UUID,
  reviewData: ReviewFlashcardInput
): Promise<{ next_review_date: Timestamp }> {
  try {
    // First, check if flashcard exists and belongs to the user
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (flashcardError || !flashcard) {
      throw new Error("Flashcard not found");
    }

    // Sprawdź sesję tylko jeśli session_id jest podane
    if (reviewData.session_id) {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from("learning_sessions")
          .select("id")
          .eq("id", reviewData.session_id)
          .eq("user_id", userId)
          .single();

        if (sessionError || !sessionData) {
          console.warn(
            `Sesja ${reviewData.session_id} nie została znaleziona lub nie należy do użytkownika. Kontynuuję bez śledzenia sesji.`
          );
          // Kontynuujemy bez session_id
          reviewData.session_id = undefined;
        }
      } catch (sessionError) {
        console.warn(`Błąd podczas weryfikacji sesji: ${sessionError}. Kontynuuję bez śledzenia sesji.`);
        // Kontynuujemy bez session_id
        reviewData.session_id = undefined;
      }
    }

    // Calculate next review date using the difficulty rating
    const now = new Date();
    const nextReviewDate = new Date(now); // Klonuj aktualny czas

    // Algorytm powtórek z krótkimi interwałami według wymagań
    switch (reviewData.difficulty_rating) {
      case "nie_pamietam":
        // Natychmiastowa powtórka - ustaw next_review_date na teraz
        nextReviewDate.setTime(now.getTime());
        break;
      case "trudne":
        // Powtórka za 1 minutę
        nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
        break;
      case "srednie":
        // Powtórka za 2 minuty
        nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 2);
        break;
      case "latwe":
        // Powtórka za 3 minuty
        nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 3);
        break;
      default:
      // Domyślnie natychmiastowa powtórka
      // Nie zmieniamy czasu - jest już ustawiony na "teraz"
    }

    console.log(
      `Następna powtórka zaplanowana na: ${nextReviewDate.toISOString()} (za ${(nextReviewDate.getTime() - now.getTime()) / 1000} sekund)`
    );

    // Przygotuj dane recenzji
    const reviewData2Update: {
      user_id: UUID;
      flashcard_id: UUID;
      difficulty_rating: string;
      is_correct: boolean;
      review_date: string;
      next_review_date: string;
      session_id?: UUID;
    } = {
      user_id: userId,
      flashcard_id: flashcardId,
      difficulty_rating: reviewData.difficulty_rating,
      is_correct: reviewData.is_correct,
      review_date: now.toISOString(),
      next_review_date: nextReviewDate.toISOString(),
    };

    // Dodaj session_id tylko jeśli został podany
    if (reviewData.session_id) {
      reviewData2Update.session_id = reviewData.session_id;
    }

    try {
      // ZMIANA: Najpierw sprawdź czy istnieje rekord powtórki dla tej fiszki i użytkownika
      const { data: existingReview, error: existingReviewError } = await supabase
        .from("flashcard_reviews")
        .select("id")
        .eq("flashcard_id", flashcardId)
        .eq("user_id", userId)
        .order("review_date", { ascending: false })
        .limit(1);

      if (existingReviewError) {
        console.error("Błąd podczas sprawdzania istniejącej recenzji:", existingReviewError);
        // Kontynuuj tworzenie nowego rekordu
      }

      let reviewError;

      if (existingReview && existingReview.length > 0) {
        // Aktualizuj istniejący rekord powtórki
        const { error: updateError } = await supabase
          .from("flashcard_reviews")
          .update(reviewData2Update)
          .eq("id", existingReview[0].id);

        reviewError = updateError;
        if (!updateError) {
          console.log(`Zaktualizowano recenzję dla fiszki ${flashcardId} z oceną ${reviewData.difficulty_rating}`);
        }
      } else {
        // Utwórz nowy rekord jeśli nie istnieje
        const { error: insertError } = await supabase.from("flashcard_reviews").insert(reviewData2Update);

        reviewError = insertError;
        if (!insertError) {
          console.log(`Utworzono nową recenzję dla fiszki ${flashcardId} z oceną ${reviewData.difficulty_rating}`);
        }
      }

      if (reviewError) {
        console.error("Błąd podczas zapisywania recenzji:", reviewError);
        // Kontynuuj mimo błędu, żeby nie blokować użytkownika
      } else {
        console.log(`Zapisano recenzję dla fiszki ${flashcardId} z oceną ${reviewData.difficulty_rating}`);

        // Aktualizuj statystyki sesji, jeśli podano session_id
        if (reviewData.session_id) {
          try {
            // Najpierw wykonujemy wywołania RPC do inkrementacji
            await supabase.rpc("increment", {
              table: "learning_sessions",
              column: "flashcards_reviewed",
              row_id: reviewData.session_id,
              amount: 1,
            });

            // Następnie aktualizujemy odpowiednie liczniki w zależności od poprawności odpowiedzi
            if (reviewData.is_correct) {
              await supabase.rpc("increment", {
                table: "learning_sessions",
                column: "correct_answers",
                row_id: reviewData.session_id,
                amount: 1,
              });
            } else {
              await supabase.rpc("increment", {
                table: "learning_sessions",
                column: "incorrect_answers",
                row_id: reviewData.session_id,
                amount: 1,
              });
            }

            console.log(
              `Zaktualizowano statystyki sesji ${reviewData.session_id} (przeglądnięto: +1, ${reviewData.is_correct ? "poprawne: +1" : "niepoprawne: +1"})`
            );
          } catch (sessionUpdateError) {
            console.error("Błąd podczas aktualizacji statystyk sesji:", sessionUpdateError);
            // Kontynuuj mimo błędu
          }
        }
      }
    } catch (insertError) {
      console.error("Błąd podczas zapisywania recenzji:", insertError);
      // Kontynuuj mimo błędu, żeby nie blokować użytkownika
    }

    // If the answer is correct, increment the correct_answers_count on the flashcard
    if (reviewData.is_correct) {
      try {
        // First get the current count
        const { data: currentCountData } = await supabase
          .from("flashcards")
          .select("correct_answers_count")
          .eq("id", flashcardId)
          .single();

        if (currentCountData) {
          const newCount = (currentCountData.correct_answers_count || 0) + 1;
          await supabase.from("flashcards").update({ correct_answers_count: newCount }).eq("id", flashcardId);

          console.log(`Zaktualizowano licznik poprawnych odpowiedzi dla fiszki ${flashcardId} do ${newCount}`);
        }
      } catch (updateError) {
        console.error("Błąd aktualizacji licznika poprawnych odpowiedzi:", updateError);
        // Kontynuuj mimo błędu
      }
    }

    // Return the next review date
    return { next_review_date: nextReviewDate.toISOString() };
  } catch (error) {
    console.error("Error reviewing flashcard:", error);
    throw error;
  }
}

/**
 * Creates a new flashcard manually entered by the user
 *
 * @param supabase - The authenticated Supabase client instance
 * @param userId - The ID of the user creating the flashcard
 * @param data - The flashcard data (front_content, back_content)
 * @returns The created flashcard with its ID and metadata
 * @throws Error if the database operation fails
 */
export async function createFlashcard(
  supabase: SupabaseClient,
  userId: UUID,
  data: { front_content: string; back_content: string }
) {
  try {
    // Create the flashcard in the database
    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front_content: data.front_content,
        back_content: data.back_content,
        is_ai_generated: false,
        correct_answers_count: 0,
      })
      .select("id, front_content, back_content, is_ai_generated, created_at, correct_answers_count")
      .single();

    // Handle errors
    if (error) {
      console.error("Error creating flashcard:", error);
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    return flashcard;
  } catch (error) {
    console.error("Error in createFlashcard:", error);
    throw error;
  }
}
