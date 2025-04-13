import { SessionSummaryDto } from '@/types';
import type { ReactNode } from 'react';

// Model widoku dla podsumowania sesji
export interface SessionSummaryViewModel {
  flashcardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionPercentage: number;
  durationSeconds: number;
  endTime?: Date | string;
}

// Mapper do konwersji DTO na ViewModel
export function mapSessionSummaryToViewModel(summaryDto: SessionSummaryDto): SessionSummaryViewModel {
  return {
    flashcardsReviewed: summaryDto.flashcards_reviewed,
    correctAnswers: summaryDto.correct_answers,
    incorrectAnswers: summaryDto.incorrect_answers,
    completionPercentage: summaryDto.completion_percentage,
    durationSeconds: summaryDto.duration_seconds,
    endTime: new Date()
  };
}

// Typy dla komponentów
export interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  variant?: 'default' | 'success' | 'error';
}

export interface CompletionProgressBarProps {
  completionPercentage: number;
}

export interface SessionDurationDisplayProps {
  durationSeconds: number;
}

export interface ActionButtonsProps {
  onBackToDashboard?: () => void;
  dashboardUrl?: string;
}

export interface BackToDashboardButtonProps {
  onClick?: () => void;
  href?: string;
} 