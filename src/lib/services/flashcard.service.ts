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

    // Optional: Verify that the session exists and belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from("learning_sessions")
      .select("id")
      .eq("id", reviewData.session_id)
      .eq("user_id", userId)
      .single();

    if (sessionError || !sessionData) {
      throw new Error("Invalid session");
    }

    // Get the previous review to determine the interval
    const { data: previousReview, error: previousReviewError } = await supabase
      .from("flashcard_reviews")
      .select("next_review_date, review_date")
      .eq("flashcard_id", flashcardId)
      .order("review_date", { ascending: false })
      .limit(1);

    if (previousReviewError) {
      console.warn("Error fetching previous review:", previousReviewError);
      // Continue execution despite this error
    }

    // Calculate previous interval in days (if available)
    let previousInterval = 0;
    if (previousReview && previousReview.length > 0) {
      const prevReviewDate = new Date(previousReview[0].review_date);
      const prevNextReviewDate = new Date(previousReview[0].next_review_date);
      // Calculate difference in days
      const diffTime = Math.abs(prevNextReviewDate.getTime() - prevReviewDate.getTime());
      previousInterval = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const now = new Date();

    // Call the database function to calculate the next review date
    const { data: nextReviewData, error: calcError } = await supabase.rpc("calculate_next_review_date", {
      p_current_date: now.toISOString(),
      p_difficulty_rating: reviewData.difficulty_rating,
      p_previous_interval: previousInterval,
    });

    if (calcError) {
      console.error("Error calculating next review date:", calcError);
      throw new Error(`Failed to calculate next review date: ${calcError.message}`);
    }

    // Convert the response to Date
    const nextReviewDate = nextReviewData ? new Date(nextReviewData) : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Try to use RPC function if it exists (single transaction)
    try {
      const { error } = await supabase.rpc("submit_flashcard_review", {
        p_flashcard_id: flashcardId,
        p_is_correct: reviewData.is_correct,
        p_difficulty_rating: reviewData.difficulty_rating,
        p_next_review_date: nextReviewDate.toISOString(),
        p_session_id: reviewData.session_id,
      });

      if (error) {
        // Fall back to direct database operations if RPC function doesn't exist yet
        throw error;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore the specific error and fall back to direct operations
      console.warn("RPC function submit_flashcard_review not available, falling back to direct operations");

      // Insert the review record
      const { error: reviewError } = await supabase.from("flashcard_reviews").insert({
        flashcard_id: flashcardId,
        difficulty_rating: reviewData.difficulty_rating,
        is_correct: reviewData.is_correct,
        review_date: now.toISOString(),
        next_review_date: nextReviewDate.toISOString(),
      });

      if (reviewError) {
        throw new Error(`Failed to insert review: ${reviewError.message}`);
      }

      // If the answer is correct, increment the correct_answers_count
      if (reviewData.is_correct) {
        const { error: updateError } = await supabase
          .from("flashcards")
          .update({ correct_answers_count: supabase.rpc("increment_counter", { row_id: flashcardId }) })
          .eq("id", flashcardId);

        if (updateError) {
          console.error("Error updating correct answers count:", updateError);
          // Continue execution despite this error
        }
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
