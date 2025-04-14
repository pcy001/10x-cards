import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startLearningSession, endLearningSession } from '../../lib/services/learning.service';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock user and session data
const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockSessionId = '123e4567-e89b-12d3-a456-426614174001';
const mockStartedAt = new Date('2023-05-01T10:00:00Z');
const mockEndedAt = new Date('2023-05-01T10:30:00Z');

// Mock flashcards
const mockFlashcards = [
  { id: 'card1', front_content: 'Card 1 Front' },
  { id: 'card2', front_content: 'Card 2 Front' },
];

// Mock database responses
const mockSessionData = {
  id: mockSessionId,
  started_at: mockStartedAt.toISOString(),
  flashcards_count: 2,
};

const mockReviewStats = [
  { is_correct: true },
  { is_correct: false },
];

describe('Learning Service', () => {
  describe('startLearningSession', () => {
    let supabaseMock: any;
    
    beforeEach(() => {
      // Create a more complete mock with chaining methods
      supabaseMock = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'flashcards') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              limit: vi.fn().mockReturnThis(),
              then: vi.fn().mockImplementation((callback) => {
                return Promise.resolve(callback({
                  data: mockFlashcards,
                  error: null
                }));
              })
            };
          }
          
          if (table === 'learning_sessions') {
            return {
              insert: vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockReturnValue({
                data: { id: mockSessionId },
                error: null
              })
            };
          }
          
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis()
          };
        })
      } as unknown as SupabaseClient;
      
      vi.clearAllMocks();
    });
    
    it('should start a learning session with default options', async () => {
      // Arrange
      const options = { limit: 10 };
      
      // Act
      const result = await startLearningSession(supabaseMock, mockUserId, options);
      
      // Assert
      expect(result).toHaveProperty('session_id');
      expect(result).toHaveProperty('flashcards');
      expect(result.flashcards).toHaveLength(mockFlashcards.length);
    });
    
    it('should handle errors when creating a session', async () => {
      // Arrange
      const options = { limit: 10 };
      
      // Override the learning_sessions mock to simulate error
      supabaseMock.from = vi.fn().mockImplementation((table) => {
        if (table === 'learning_sessions') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnValue({
              data: null,
              error: { message: 'Database error' }
            })
          };
        }
        
        // Return regular mock for flashcards
        if (table === 'flashcards') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((callback) => {
              return Promise.resolve(callback({
                data: mockFlashcards,
                error: null
              }));
            })
          };
        }
        
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis()
        };
      });
      
      // Act
      const result = await startLearningSession(supabaseMock, mockUserId, options);
      
      // Assert
      expect(result.session_id).toBeNull();
      expect(result.flashcards).toHaveLength(mockFlashcards.length);
    });
  });
  
  describe('endLearningSession', () => {
    let supabaseMock: any;
    
    beforeEach(() => {
      // Create a more complete mock with chaining methods
      supabaseMock = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'learning_sessions') {
            return {
              select: vi.fn().mockReturnThis(),
              match: vi.fn().mockReturnThis(),
              update: vi.fn().mockImplementation(() => ({
                eq: vi.fn().mockReturnValue({
                  data: null,
                  error: null
                })
              })),
              single: vi.fn().mockReturnValue({
                data: mockSessionData,
                error: null
              })
            };
          }
          
          if (table === 'flashcard_reviews') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              data: mockReviewStats,
              error: null
            };
          }
          
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis()
          };
        })
      } as unknown as SupabaseClient;
      
      vi.clearAllMocks();
      
      // Mock date
      vi.useFakeTimers();
      vi.setSystemTime(mockEndedAt);
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should end a learning session and calculate statistics', async () => {
      // Act
      const result = await endLearningSession(supabaseMock, mockUserId, mockSessionId);
      
      // Assert
      expect(result).toHaveProperty('session_summary');
      expect(result.session_summary).toHaveProperty('flashcards_reviewed', 2);
      expect(result.session_summary).toHaveProperty('correct_answers', 1);
      expect(result.session_summary).toHaveProperty('incorrect_answers', 1);
      expect(result.session_summary).toHaveProperty('completion_percentage', 100);
      expect(result.session_summary).toHaveProperty('duration_seconds', 1800);
    });
    
    it('should throw an error if session is not found', async () => {
      // Arrange
      supabaseMock.from = vi.fn().mockImplementation((table) => {
        if (table === 'learning_sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            match: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnValue({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' }
            })
          };
        }
        
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis()
        };
      });
      
      // Act & Assert
      await expect(endLearningSession(supabaseMock, mockUserId, mockSessionId))
        .rejects.toThrow('Session not found');
    });
  });
}); 