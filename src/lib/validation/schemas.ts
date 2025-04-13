import { z } from 'zod';

/**
 * Schema for validating flashcard generation requests
 * Ensures source text is present and within size limits
 */
export const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1, "Text source cannot be empty")
    .max(10000, "Text source cannot exceed 10,000 characters")
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>; 

/**
 * Schema for validating flashcard acceptance requests
 * Ensures at least one flashcard is provided and content meets length requirements
 */
export const acceptFlashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      front_content: z.string()
        .min(1, "Front content cannot be empty")
        .max(500, "Front content cannot exceed 500 characters"),
      back_content: z.string()
        .min(1, "Back content cannot be empty")
        .max(200, "Back content cannot exceed 200 characters"),
      is_ai_generated: z.boolean()
    })
  ).min(1, "At least one flashcard must be provided")
});

export type AcceptFlashcardsInput = z.infer<typeof acceptFlashcardsSchema>; 

/**
 * Schema for validating flashcard query parameters
 * Used for the GET /api/flashcards endpoint to support pagination and sorting
 */
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  per_page: z.coerce.number().positive().max(100).default(20),
  sort_by: z.enum(['created_at', 'correct_answers_count']).default('created_at'),
  sort_dir: z.enum(['asc', 'desc']).default('desc')
});

export type FlashcardsQueryInput = z.infer<typeof flashcardsQuerySchema>; 