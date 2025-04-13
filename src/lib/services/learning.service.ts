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
    // Check if userId is provided and valid
    if (!userId) {
      console.error("No user ID provided for learning session");
      throw new Error("User ID is required to start a learning session");
    }

    // Pobieramy fiszki użytkownika
    let flashcardsQuery = supabase.from("flashcards").select("id, front_content").eq("user_id", userId);
    
    // Jeśli wybrano tylko fiszki do powtórki, dodajemy odpowiednie filtry
    if (options.only_due) {
      console.log("Pobieranie tylko fiszek gotowych do powtórki");
      
      // Najpierw pobieramy IDs fiszek, które są gotowe do powtórki
      const now = new Date();
      const nowISOString = now.toISOString();
      console.log(`Current time for due flashcards query: ${nowISOString}`);
      
      // Debugging: Sprawdź najbliższą powtórkę
      const { data: nextReview, error: nextReviewError } = await supabase
        .from("flashcard_reviews")
        .select("flashcard_id, next_review_date, difficulty_rating")
        .eq("user_id", userId)
        .order("next_review_date", { ascending: true })
        .limit(5);
      
      if (!nextReviewError && nextReview && nextReview.length > 0) {
        console.log("Najbliższe powtórki:");
        nextReview.forEach((review, index) => {
          const reviewDate = new Date(review.next_review_date);
          const secondsToReview = Math.floor((reviewDate.getTime() - now.getTime()) / 1000);
          console.log(`  [${index + 1}] ID: ${review.flashcard_id}, data: ${review.next_review_date}, ocena: ${review.difficulty_rating}, za ${secondsToReview} sekund`);
        });
      }
      
      // Teraz pobieramy fiszki do powtórki - BEZ filtra is_correct
      const { data: dueReviews, error: dueReviewsError } = await supabase
        .from("flashcard_reviews")
        .select("flashcard_id, next_review_date")
        .eq("user_id", userId)
        .lte("next_review_date", nowISOString)
        .order("next_review_date", { ascending: true });
      
      if (dueReviewsError) {
        console.error("Error fetching due flashcards:", dueReviewsError);
        throw new Error(`Failed to fetch due flashcards: ${dueReviewsError.message}`);
      }
      
      // Znajdź unikalne flashcard_id (eliminuj duplikaty)
      const uniqueDueFlashcardIds = [...new Set(dueReviews.map(card => card.flashcard_id))];
      
      // Debugging: wyświetl znalezione fiszki do powtórki
      if (dueReviews && dueReviews.length > 0) {
        console.log(`Found ${dueReviews.length} flashcard reviews with ${uniqueDueFlashcardIds.length} unique flashcards due for review:`);
        dueReviews.forEach((review, index) => {
          if (index < 5) { // limit logs to first 5 for brevity
            console.log(`  [${index + 1}] ID: ${review.flashcard_id}, due: ${review.next_review_date}`);
          }
        });
      } else {
        console.log("No flashcards found due for review at this time");
      }
      
      // Jeśli nie ma fiszek do powtórki, zwracamy pustą listę
      if (!dueReviews || uniqueDueFlashcardIds.length === 0) {
        console.log("No flashcards due for review");
        return {
          session_id: null,
          flashcards: [],
        };
      }
      
      // Filtrujemy fiszki według unikalnych IDs tych, które są gotowe do powtórki
      flashcardsQuery = flashcardsQuery.in("id", uniqueDueFlashcardIds);
      
      console.log(`Found ${uniqueDueFlashcardIds.length} unique flashcards due for review`);
    }
    
    // Dodajemy limit do zapytania
    flashcardsQuery = flashcardsQuery.limit(options.limit || 20);
    
    // Wykonujemy zapytanie o fiszki
    const { data: userFlashcards, error: userFlashcardsError } = await flashcardsQuery;

    if (userFlashcardsError) {
      console.error("Error fetching user flashcards:", userFlashcardsError);
      throw new Error(`Failed to fetch user flashcards: ${userFlashcardsError.message}`);
    }

    // If no flashcards found, return empty response
    if (!userFlashcards || userFlashcards.length === 0) {
      console.log("No flashcards found for user");
      return {
        session_id: null,
        flashcards: [],
      };
    }

    // Create learning session
    console.log(`Creating learning session for ${userFlashcards.length} flashcards`);
    const now = new Date().toISOString();
    
    let sessionId = null;
    
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("learning_sessions")
        .insert({
          user_id: userId,
          started_at: now,
          flashcards_count: userFlashcards.length,
          flashcards_reviewed: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          is_due_only: options.only_due || false,
        })
        .select("id")
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        // Continue without session ID
      } else if (!sessionData || !sessionData.id) {
        console.error("No session data returned");
        // Continue without session ID
      } else {
        sessionId = sessionData.id;
        console.log(`Created learning session with ID: ${sessionId}`);
      }
    } catch (sessionError) {
      console.error("Error creating session:", sessionError);
      // Continue without session ID
    }

    // Prepare flashcards for learning
    const flashcards: LearningSessionFlashcardDto[] = userFlashcards.map(card => ({
      id: card.id,
      front_content: card.front_content,
    }));

    console.log(`Retrieved ${flashcards.length} flashcards for review${sessionId ? ` with session ID: ${sessionId}` : ' without session tracking'}`);

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
  try {
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

    // Get flashcard review statistics for this session
    const { data: reviewStats, error: reviewStatsError } = await supabase
      .from("flashcard_reviews")
      .select("is_correct")
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (reviewStatsError) {
      throw new Error(`Failed to get review statistics: ${reviewStatsError.message}`);
    }

    // Calculate statistics
    const flashcardsReviewed = reviewStats ? reviewStats.length : 0;
    const correctAnswers = reviewStats ? reviewStats.filter((review) => review.is_correct).length : 0;
    const incorrectAnswers = flashcardsReviewed - correctAnswers;
    const completionPercentage =
      sessionData.flashcards_count > 0 ? Math.round((flashcardsReviewed / sessionData.flashcards_count) * 100) : 0;

    // Calculate duration in seconds
    const startedAt = new Date(sessionData.started_at);
    const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

    // Update the session to mark it as ended with the calculated statistics
    const { error: updateError } = await supabase
      .from("learning_sessions")
      .update({
        ended_at: endedAt.toISOString(),
        flashcards_reviewed: flashcardsReviewed,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
      })
      .eq("id", sessionId);

    if (updateError) {
      throw new Error(`Failed to update learning session: ${updateError.message}`);
    }

    return {
      session_summary: {
        flashcards_reviewed: flashcardsReviewed,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        completion_percentage: completionPercentage,
        duration_seconds: durationSeconds,
      },
    };
  } catch (error) {
    console.error("Error in endLearningSession:", error);
    throw error;
  }
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

    // Format today's full timestamp for accurate comparison
    const nowISOString = today.toISOString();
    
    console.log(`Szukam fiszek do powtórki dla aktualnego czasu: ${nowISOString}`);
    
    // Format today as YYYY-MM-DD for day-based calculations
    const todayStr = nowISOString.split("T")[0];

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
    
    if (flashcardIds.length === 0) {
      console.log("Nie znaleziono żadnych fiszek dla tego użytkownika");
      return { dueToday: 0, dueNextWeek: { total: 0, byDay: [] } };
    }

    // ZMIANA: Pobierz UNIKALNE flashcard_id, które są do powtórki zamiast liczyć rekordy powtórek
    // Najpierw pobierz wszystkie fiszki do powtórki
    const { data: dueTodayFlashcards, error: todayError } = await supabase
      .from("flashcard_reviews")
      .select("flashcard_id, next_review_date")
      .lte("next_review_date", nowISOString)
      .in("flashcard_id", flashcardIds);

    if (todayError) {
      throw new Error(`Failed to fetch due today flashcards: ${todayError.message}`);
    }

    // Znajdź unikalne flashcard_id (eliminuj duplikaty)
    const uniqueDueFlashcardIds = [...new Set(dueTodayFlashcards.map(card => card.flashcard_id))];
    const dueTodayCount = uniqueDueFlashcardIds.length;

    console.log(`Znaleziono ${dueTodayFlashcards.length} rekordów powtórek i ${dueTodayCount} unikalnych fiszek do powtórki teraz (${nowISOString})`);

    // Sprawdź najbliższą powtórkę dla debugowania
    const { data: nextReview, error: nextReviewError } = await supabase
      .from("flashcard_reviews")
      .select("next_review_date, difficulty_rating, flashcard_id")
      .in("flashcard_id", flashcardIds)
      .order("next_review_date", { ascending: true })
      .limit(3);

    if (!nextReviewError && nextReview && nextReview.length > 0) {
      console.log(`Najbliższe powtórki:`);
      for (let i = 0; i < nextReview.length; i++) {
        console.log(`[${i+1}] Fiszka: ${nextReview[i].flashcard_id}, zaplanowana na: ${nextReview[i].next_review_date}, ocena: ${nextReview[i].difficulty_rating}`);
        
        // Oblicz ile sekund do następnej powtórki
        const nextReviewDate = new Date(nextReview[i].next_review_date);
        const secondsToNextReview = Math.floor((nextReviewDate.getTime() - today.getTime()) / 1000);
        
        if (secondsToNextReview > 0) {
          console.log(`  Do tej powtórki pozostało: ${secondsToNextReview} sekund (${Math.floor(secondsToNextReview/60)} minut i ${secondsToNextReview%60} sekund)`);
        } else {
          console.log(`  Ta powtórka jest już dostępna! (${secondsToNextReview} sekund temu)`);
        }
      }
    } else {
      console.log("Nie znaleziono żadnych zaplanowanych powtórek");
    }

    // Query 2: Get flashcards due in the next week
    // ZMIANA: Pobierz UNIKALNE flashcard_id dla powtórek w następnym tygodniu
    const { data: nextWeekCards, error: weekError } = await supabase
      .from("flashcard_reviews")
      .select("flashcard_id, next_review_date")
      .gte("next_review_date", `${tomorrowStr}T00:00:00`)
      .lte("next_review_date", `${nextWeekStr}T23:59:59`)
      .in("flashcard_id", flashcardIds);

    if (weekError) {
      throw new Error(`Failed to fetch next week due cards: ${weekError.message}`);
    }

    // Group by day on the application side, ale używając unikalnych flashcard_id
    const dayCountMap = new Map<string, Set<string>>();

    // Initialize days with empty sets
    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dayCountMap.set(dateStr, new Set<string>());
    }

    // Count unique flashcards by day
    for (const card of nextWeekCards) {
      const dateStr = new Date(card.next_review_date).toISOString().split("T")[0];
      const daySet = dayCountMap.get(dateStr) || new Set<string>();
      daySet.add(card.flashcard_id);
      dayCountMap.set(dateStr, daySet);
    }

    // Convert map to array format expected by the interface
    const byDayArray = Array.from(dayCountMap).map(([date, flashcardSet]) => ({
      date,
      count: flashcardSet.size,
    }));

    // Sort by date
    byDayArray.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate total unique flashcards for next week
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
    .select("id, started_at, ended_at, flashcards_count, flashcards_reviewed, correct_answers, incorrect_answers")
    .match({ id: sessionId, user_id: userId })
    .single();

  if (sessionError) {
    if (sessionError.code === "PGRST116") {
      throw new Error(`Session not found: ${sessionId}`);
    }
    throw new Error(`Failed to get learning session: ${sessionError.message}`);
  }

  // Make sure the session has ended
  const endTime = sessionData.ended_at 
    ? new Date(sessionData.ended_at).getTime()
    : new Date().getTime();
  
  // Pobierz wartości bezpośrednio z tabeli learning_sessions
  const flashcardsReviewed = sessionData.flashcards_reviewed || 0;
  const correctAnswers = sessionData.correct_answers || 0;
  const incorrectAnswers = sessionData.incorrect_answers || 0;

  // Calculate completion percentage
  const completionPercentage =
    sessionData.flashcards_count > 0 ? Math.round((flashcardsReviewed / sessionData.flashcards_count) * 100) : 0;

  // Calculate duration in seconds
  const startTime = new Date(sessionData.started_at).getTime();
  const durationSeconds = Math.round((endTime - startTime) / 1000);

  return {
    flashcards_reviewed: flashcardsReviewed,
    correct_answers: correctAnswers,
    incorrect_answers: incorrectAnswers,
    completion_percentage: completionPercentage,
    duration_seconds: durationSeconds,
  };
}
