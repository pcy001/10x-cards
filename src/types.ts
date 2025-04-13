import type { Database } from "./db/database.types";

// Utility type aliases
export type DifficultyRating = Database["public"]["Enums"]["difficulty_rating"];
export type UUID = string;
export type Timestamp = string;

// Entity types based on database models
export interface User {
  id: UUID;
  email: string;
}

export interface Flashcard {
  id: UUID;
  front_content: string;
  back_content: string;
  is_ai_generated: boolean;
  created_at: Timestamp | null;
  correct_answers_count: number;
  user_id: UUID;
}

export interface FlashcardReview {
  id: UUID;
  flashcard_id: UUID;
  difficulty_rating: DifficultyRating;
  is_correct: boolean;
  review_date: Timestamp;
  next_review_date: Timestamp;
}

// DTO types for API requests and responses

// Authentication DTOs
export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface RegisterUserResponseDto {
  id: UUID;
  email: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: UUID;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: Timestamp;
  };
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountDto {
  password: string;
}

// Flashcard DTOs
export interface GenerateFlashcardsDto {
  source_text: string; // Limited to 10,000 characters
}

export interface GeneratedFlashcardDto {
  temp_id: string;
  front_content: string;
  back_content: string;
}

export interface GenerateFlashcardsResponseDto {
  flashcards: GeneratedFlashcardDto[];
}

export interface FlashcardToAcceptDto {
  front_content: string;
  back_content: string;
  is_ai_generated: boolean;
}

export interface AcceptFlashcardsDto {
  flashcards: FlashcardToAcceptDto[];
}

export interface AcceptedFlashcardDto {
  id: UUID;
  front_content: string;
  back_content: string;
  is_ai_generated: boolean;
  created_at: Timestamp;
}

export interface AcceptFlashcardsResponseDto {
  accepted_count: number;
  flashcards: AcceptedFlashcardDto[];
}

export interface CreateFlashcardDto {
  front_content: string; // Limited to 500 characters
  back_content: string; // Limited to 200 characters
}

export interface FlashcardResponseDto {
  id: UUID;
  front_content: string;
  back_content: string;
  is_ai_generated: boolean;
  created_at: Timestamp;
  correct_answers_count: number;
}

export interface FlashcardQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: "created_at" | "correct_answers_count";
  sort_dir?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface FlashcardsResponseDto {
  data: FlashcardResponseDto[];
  pagination: PaginationMeta;
}

export interface UpdateFlashcardDto {
  front_content: string; // Limited to 500 characters
  back_content: string; // Limited to 200 characters
}

export interface BatchDeleteFlashcardsDto {
  flashcard_ids: UUID[];
}

// Learning Session DTOs
export interface StartLearningSessionDto {
  limit?: number; // Optional, default: 20
}

export interface LearningSessionFlashcardDto {
  id: UUID;
  front_content: string;
}

export interface StartLearningSessionResponseDto {
  session_id: UUID;
  flashcards: LearningSessionFlashcardDto[];
}

export interface ReviewFlashcardDto {
  difficulty_rating: DifficultyRating;
  is_correct: boolean;
  session_id: UUID;
}

export interface ReviewFlashcardResponseDto {
  next_review_date: Timestamp;
}

export interface SessionSummaryDto {
  flashcards_reviewed: number;
  correct_answers: number;
  incorrect_answers: number;
  completion_percentage: number;
  duration_seconds: number;
}

export interface EndLearningSessionResponseDto {
  session_summary: SessionSummaryDto;
}

export interface DailyDueCountDto {
  date: string; // YYYY-MM-DD format
  count: number;
}

export interface DueFlashcardsCountResponseDto {
  due_today: number;
  due_next_week: {
    total: number;
    by_day: DailyDueCountDto[];
  };
}
