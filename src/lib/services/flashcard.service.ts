import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlashcardToAcceptDto,
  AcceptedFlashcardDto,
  UUID,
  FlashcardsResponseDto,
  FlashcardResponseDto,
  PaginationMeta,
} from "../../types";
import type { FlashcardsQueryInput } from "../validation/schemas";

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
