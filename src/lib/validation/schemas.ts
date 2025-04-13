import { z } from "zod";

/**
 * Schema for validating flashcard generation requests
 * Ensures source text is present and within size limits
 */
export const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1, "Text source cannot be empty")
    .max(10000, "Text source cannot exceed 10,000 characters"),
  target_language: z
    .string()
    .min(2, "Target language code must be at least 2 characters")
    .max(5, "Target language code cannot exceed 5 characters"),
  generation_type: z.enum(["vocabulary", "phrases", "definitions"]).optional(),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  limit: z.number().int().positive().max(20, "Cannot generate more than 20 flashcards at once").optional(),
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

/**
 * Schema for validating flashcard acceptance requests
 * Ensures at least one flashcard is provided and content meets length requirements
 */
export const acceptFlashcardsSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front_content: z
          .string()
          .min(1, "Front content cannot be empty")
          .max(500, "Front content cannot exceed 500 characters"),
        back_content: z
          .string()
          .min(1, "Back content cannot be empty")
          .max(200, "Back content cannot exceed 200 characters"),
        is_ai_generated: z.boolean(),
      })
    )
    .min(1, "At least one flashcard must be provided"),
});

export type AcceptFlashcardsInput = z.infer<typeof acceptFlashcardsSchema>;

/**
 * Schema for validating flashcard query parameters
 * Used for the GET /api/flashcards endpoint to support pagination and sorting
 */
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  per_page: z.coerce.number().positive().max(100).default(20),
  sort_by: z.enum(["created_at", "correct_answers_count"]).default("created_at"),
  sort_dir: z.enum(["asc", "desc"]).default("desc"),
});

export type FlashcardsQueryInput = z.infer<typeof flashcardsQuerySchema>;

/**
 * Schema for validating learning session start requests
 * Ensures the limit parameter is a positive integer with a maximum value
 */
export const startLearningSessionSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type StartLearningSessionInput = z.infer<typeof startLearningSessionSchema>;

/**
 * Schema for validating session ID path parameter
 * Ensures the session_id is a valid UUID
 */
export const sessionIdParamSchema = z.object({
  session_id: z.string().uuid("Session ID must be a valid UUID"),
});

export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;

/**
 * Schema for validating flashcard review submissions
 * Validates the difficulty rating, correctness flag, and session ID
 */
export const reviewFlashcardSchema = z.object({
  difficulty_rating: z.enum(["nie_pamietam", "trudne", "srednie", "latwe"]),
  is_correct: z.boolean(),
  session_id: z.string().uuid("Session ID must be a valid UUID"),
});

export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
