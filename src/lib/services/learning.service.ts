import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UUID,
  StartLearningSessionResponseDto,
  LearningSessionFlashcardDto,
  EndLearningSessionResponseDto,
  SessionSummaryDto,
} from "../../types";
import type { StartLearningSessionInput } from "../validation/schemas";

export interface GetDueCountInput {
  userId: UUID;
  today: Date;
}

export interface GetDueCountResult {
  dueToday: number;
  dueNextWeek: {
    total: number;
    byDay: {
      date: string; // YYYY-MM-DD
      count: number;
    }[];
  };
}

/**
 * Starts a new learning session and returns flashcards due for review
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param options - Optional limit parameter
 * @returns Object containing the session ID and flashcards for review
 * @throws Error if session creation or flashcard retrieval fails
 */
export async function startLearningSession(
  supabase: SupabaseClient,
  userId: UUID,
  options: StartLearningSessionInput
): Promise<StartLearningSessionResponseDto> {
  console.log(`Starting learning session for user ${userId} with options:`, options);

  try {
    // Zamiast używać funkcji RPC, pobierz fiszki bezpośrednio z tabeli
    console.log(`Checking for flashcards due for review for user ${userId}`);
    
    // Najpierw pobierz wszystkie fiszki użytkownika
    const { data: userFlashcards, error: userFlashcardsError } = await supabase
      .from("flashcards")
      .select("id, front_content")
      .eq("user_id", userId)
      .limit(options.limit || 20);

    if (userFlashcardsError) {
      console.error("Error fetching user flashcards:", userFlashcardsError);
      throw new Error(`Failed to fetch user flashcards: ${userFlashcardsError.message}`);
    }

    // Jeśli nie ma fiszek, zwróć pustą tablicę bez tworzenia sesji
    if (!userFlashcards || !Array.isArray(userFlashcards) || userFlashcards.length === 0) {
      console.log("No flashcards found for user");
      return {
        session_id: null,
        flashcards: [],
      };
    }

    // Skoro są fiszki, utwórz sesję nauki
    console.log(`Creating learning session for ${userFlashcards.length} flashcards`);

    // Create a new learning session
    const { data: sessionData, error: sessionError } = await supabase
      .from("learning_sessions")
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
        flashcards_count: userFlashcards.length,
        flashcards_reviewed: 0,
        correct_answers: 0,
        incorrect_answers: 0,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      throw new Error(`Failed to create learning session: ${sessionError.message}`);
    }

    if (!sessionData || !sessionData.id) {
      console.error("No session data returned:", sessionData);
      throw new Error("Failed to create learning session: No session ID returned");
    }

    const sessionId = sessionData.id;
    console.log(`Created learning session with ID: ${sessionId}`);

    // Convert database results to DTOs
    const flashcards: LearningSessionFlashcardDto[] = userFlashcards.map(card => ({
      id: card.id,
      front_content: card.front_content,
    }));

    console.log(`Retrieved ${flashcards.length} flashcards for review`);

    return {
      session_id: sessionId,
      flashcards,
    };
  } catch (error) {
    console.error("Unexpected error in startLearningSession:", error);
    throw error;
  }
}

/**
 * Ends a learning session and calculates summary statistics
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param sessionId - The ID of the learning session to end
 * @returns Object containing session summary statistics
 * @throws Error if session retrieval or update fails
 */
export async function endLearningSession(
  supabase: SupabaseClient,
  userId: UUID,
  sessionId: UUID
): Promise<EndLearningSessionResponseDto> {
  // Check if the session exists and belongs to the user
  const { data: sessionData, error: sessionError } = await supabase
    .from("learning_sessions")
    .select("id, started_at, flashcards_count")
    .match({ id: sessionId, user_id: userId })
    .single();

  if (sessionError) {
    if (sessionError.code === "PGRST116") {
      throw new Error(`Session not found: ${sessionId}`);
    }
    throw new Error(`Failed to get learning session: ${sessionError.message}`);
  }

  const endedAt = new Date();

  // Update the session to mark it as ended
  const { error: updateError } = await supabase
    .from("learning_sessions")
    .update({
      ended_at: endedAt.toISOString(),
    })
    .eq("id", sessionId);

  if (updateError) {
    throw new Error(`Failed to update learning session: ${updateError.message}`);
  }

  // Get flashcard review statistics for this session
  const { data: reviewStats, error: reviewStatsError } = await supabase
    .from("flashcard_reviews")
    .select("is_correct")
    .gte("review_date", sessionData.started_at)
    .lte("review_date", endedAt.toISOString())
    .eq("user_id", userId);

  if (reviewStatsError) {
    throw new Error(`Failed to get review statistics: ${reviewStatsError.message}`);
  }

  // Calculate statistics
  const flashcardsReviewed = reviewStats.length;
  const correctAnswers = reviewStats.filter((review) => review.is_correct).length;
  const incorrectAnswers = flashcardsReviewed - correctAnswers;
  const completionPercentage =
    sessionData.flashcards_count > 0 ? Math.round((flashcardsReviewed / sessionData.flashcards_count) * 100) : 0;

  // Calculate duration in seconds
  const startedAt = new Date(sessionData.started_at);
  const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

  // Update the session with the calculated statistics
  await supabase
    .from("learning_sessions")
    .update({
      flashcards_reviewed: flashcardsReviewed,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
    })
    .eq("id", sessionId);

  return {
    session_summary: {
      flashcards_reviewed: flashcardsReviewed,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      completion_percentage: completionPercentage,
      duration_seconds: durationSeconds,
    },
  };
}

/**
 * Gets count of flashcards due for review today and in the next week
 *
 * @param supabase - The authenticated Supabase client instance
 * @param input - Object containing userId and today's date
 * @returns Count of flashcards due today and by day for the next week
 * @throws Error if the database operation fails
 */
export async function getDueFlashcardsCount(
  supabase: SupabaseClient,
  input: GetDueCountInput
): Promise<GetDueCountResult> {
  try {
    const { userId, today } = input;

    // Format today as YYYY-MM-DD
    const todayStr = today.toISOString().split("T")[0];

    // Calculate tomorrow and 7 days from today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Format dates for queries
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // First get flashcard ids for this user
    const { data: userFlashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("user_id", userId);

    if (flashcardsError) {
      throw new Error(`Failed to fetch user flashcards: ${flashcardsError.message}`);
    }

    // Extract flashcard IDs into an array
    const flashcardIds = userFlashcards.map((card) => card.id);

    // Query 1: Get count of flashcards due today
    const { count: dueTodayCount, error: todayError } = await supabase
      .from("flashcard_reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_correct", true)
      .lte("next_review_date", `${todayStr}T23:59:59`)
      .in("flashcard_id", flashcardIds);

    if (todayError) {
      throw new Error(`Failed to fetch due today count: ${todayError.message}`);
    }

    // Query 2: Get flashcards due in the next week
    const { data: nextWeekCards, error: weekError } = await supabase
      .from("flashcard_reviews")
      .select("next_review_date")
      .eq("is_correct", true)
      .gte("next_review_date", `${tomorrowStr}T00:00:00`)
      .lte("next_review_date", `${nextWeekStr}T23:59:59`)
      .in("flashcard_id", flashcardIds);

    if (weekError) {
      throw new Error(`Failed to fetch next week due cards: ${weekError.message}`);
    }

    // Group by day on the application side
    const dayCountMap = new Map<string, number>();

    // Initialize days with 0 count
    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dayCountMap.set(dateStr, 0);
    }

    // Count flashcards by day
    for (const card of nextWeekCards) {
      const dateStr = new Date(card.next_review_date).toISOString().split("T")[0];
      dayCountMap.set(dateStr, (dayCountMap.get(dateStr) || 0) + 1);
    }

    // Convert map to array format expected by the interface
    const byDayArray = Array.from(dayCountMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Sort by date
    byDayArray.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate total for next week
    const nextWeekTotal = byDayArray.reduce((sum, day) => sum + day.count, 0);

    // Format the response
    return {
      dueToday: dueTodayCount || 0,
      dueNextWeek: {
        total: nextWeekTotal,
        byDay: byDayArray,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching due flashcards count:", error);
    throw error;
  }
}

/**
 * Gets summary statistics for a specific learning session
 *
 * @param supabase - The Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param sessionId - The ID of the learning session to get summary for
 * @returns Session summary statistics
 */
export async function getSessionSummary(
  supabase: SupabaseClient,
  userId: UUID,
  sessionId: UUID
): Promise<SessionSummaryDto> {
  // Check if the session exists and belongs to the user
  const { data: sessionData, error: sessionError } = await supabase
    .from("learning_sessions")
    .select("id, started_at, ended_at, flashcards_count")
    .match({ id: sessionId, user_id: userId })
    .single();

  if (sessionError) {
    if (sessionError.code === "PGRST116") {
      throw new Error(`Session not found: ${sessionId}`);
    }
    throw new Error(`Failed to get learning session: ${sessionError.message}`);
  }

  // Make sure the session has ended
  if (!sessionData.ended_at) {
    // If not ended, let's calculate duration from now
    sessionData.ended_at = new Date().toISOString();
  }

  // Get flashcard review statistics for this session
  const { data: reviewStats, error: reviewStatsError } = await supabase
    .from("flashcard_reviews")
    .select("is_correct")
    .gte("review_date", sessionData.started_at)
    .lte("review_date", sessionData.ended_at)
    .eq("user_id", userId);

  if (reviewStatsError) {
    throw new Error(`Failed to get review statistics: ${reviewStatsError.message}`);
  }

  // Calculate statistics
  const flashcardsReviewed = reviewStats.length;
  const correctAnswers = reviewStats.filter((review) => review.is_correct).length;
  const incorrectAnswers = flashcardsReviewed - correctAnswers;

  // Calculate completion percentage
  const completionPercentage =
    sessionData.flashcards_count > 0 ? Math.round((flashcardsReviewed / sessionData.flashcards_count) * 100) : 0;

  // Calculate duration in seconds
  const startTime = new Date(sessionData.started_at).getTime();
  const endTime = new Date(sessionData.ended_at).getTime();
  const durationSeconds = Math.round((endTime - startTime) / 1000);

  return {
    flashcards_reviewed: flashcardsReviewed,
    correct_answers: correctAnswers,
    incorrect_answers: incorrectAnswers,
    completion_percentage: completionPercentage,
    duration_seconds: durationSeconds,
  };
}
