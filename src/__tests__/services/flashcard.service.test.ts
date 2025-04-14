import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  saveAcceptedFlashcards, 
  getFlashcards, 
  getFlashcardForReview,
  createFlashcard
} from '../../lib/services/flashcard.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlashcardToAcceptDto } from '../../types';

// Mock user data
const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockFlashcardId = '123e4567-e89b-12d3-a456-426614174001';

// Mock flashcards
const mockFlashcardsToAccept: FlashcardToAcceptDto[] = [
  { front_content: 'Card 1 Front', back_content: 'Card 1 Back', is_ai_generated: true },
  { front_content: 'Card 2 Front', back_content: 'Card 2 Back', is_ai_generated: true },
];

const mockSavedFlashcards = [
  { 
    id: 'card1', 
    front_content: 'Card 1 Front', 
    back_content: 'Card 1 Back', 
    is_ai_generated: true,
    created_at: '2023-05-01T10:00:00Z'
  },
  { 
    id: 'card2', 
    front_content: 'Card 2 Front', 
    back_content: 'Card 2 Back', 
    is_ai_generated: true,
    created_at: '2023-05-01T10:00:00Z' 
  },
];

const mockFlashcardForReview = {
  id: mockFlashcardId,
  front_content: 'Review Card Front',
  back_content: 'Review Card Back',
  is_ai_generated: false,
};

// Create Supabase mock
const createSupabaseMock = () => {
  const supabaseMock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
    data: null,
    error: null,
    count: 10,
  } as unknown as SupabaseClient;
  
  return supabaseMock;
};

describe('Flashcard Service', () => {
  describe('saveAcceptedFlashcards', () => {
    let supabaseMock: SupabaseClient;
    
    beforeEach(() => {
      supabaseMock = createSupabaseMock();
      vi.clearAllMocks();
      
      // Setup default mock responses
      (supabaseMock.from as any).mockReturnThis();
      (supabaseMock.select as any).mockReturnThis();
      (supabaseMock.insert as any).mockReturnThis();
      (supabaseMock.select as any).mockReturnValue({
        data: mockSavedFlashcards,
        error: null,
      });
    });
    
    it('should save accepted flashcards successfully', async () => {
      // Act
      const result = await saveAcceptedFlashcards(
        supabaseMock, 
        mockUserId, 
        mockFlashcardsToAccept
      );
      
      // Assert
      expect(supabaseMock.from).toHaveBeenCalledWith('flashcards');
      expect(supabaseMock.insert).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('front_content');
      expect(result[0]).toHaveProperty('back_content');
      expect(result[0]).toHaveProperty('is_ai_generated');
    });
    
    it('should throw an error when database operation fails', async () => {
      // Arrange
      (supabaseMock.select as any).mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });
      
      // Act & Assert
      await expect(
        saveAcceptedFlashcards(supabaseMock, mockUserId, mockFlashcardsToAccept)
      ).rejects.toThrow('Failed to save flashcards');
    });
  });
  
  describe('getFlashcards', () => {
    let supabaseMock: SupabaseClient;
    
    beforeEach(() => {
      supabaseMock = createSupabaseMock();
      vi.clearAllMocks();
      
      // Setup default mock responses
      (supabaseMock.from as any).mockReturnThis();
      (supabaseMock.select as any).mockReturnThis();
      (supabaseMock.eq as any).mockReturnThis();
      (supabaseMock.order as any).mockReturnThis();
      (supabaseMock.range as any).mockReturnValue({
        data: mockSavedFlashcards,
        error: null,
        count: 10,
      });
    });
    
    it('should return paginated flashcards', async () => {
      // Arrange
      const params = {
        page: 1,
        per_page: 10,
        sort_by: 'created_at',
        sort_dir: 'desc',
      };
      
      // Act
      const result = await getFlashcards(supabaseMock, mockUserId, params);
      
      // Assert
      expect(supabaseMock.from).toHaveBeenCalledWith('flashcards');
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(supabaseMock.order).toHaveBeenCalledWith(
        params.sort_by, 
        { ascending: false }
      );
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('total', 10);
      expect(result.pagination).toHaveProperty('pages', 1);
      expect(result.pagination).toHaveProperty('current_page', 1);
      expect(result.data).toHaveLength(2);
    });
    
    it('should throw an error when database operation fails', async () => {
      // Arrange
      const params = {
        page: 1,
        per_page: 10,
        sort_by: 'created_at',
        sort_dir: 'desc',
      };
      
      (supabaseMock.range as any).mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });
      
      // Act & Assert
      await expect(
        getFlashcards(supabaseMock, mockUserId, params)
      ).rejects.toThrow('Failed to retrieve flashcards');
    });
  });
  
  describe('getFlashcardForReview', () => {
    let supabaseMock: SupabaseClient;
    
    beforeEach(() => {
      supabaseMock = createSupabaseMock();
      vi.clearAllMocks();
      
      // Setup default mock responses
      (supabaseMock.from as any).mockReturnThis();
      (supabaseMock.select as any).mockReturnThis();
      (supabaseMock.eq as any).mockReturnThis();
      (supabaseMock.single as any).mockReturnValue({
        data: mockFlashcardForReview,
        error: null,
      });
    });
    
    it('should return a flashcard for review', async () => {
      // Act
      const result = await getFlashcardForReview(
        supabaseMock, 
        mockUserId, 
        mockFlashcardId
      );
      
      // Assert
      expect(supabaseMock.from).toHaveBeenCalledWith('flashcards');
      expect(supabaseMock.eq).toHaveBeenCalledWith('id', mockFlashcardId);
      expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', mockUserId);
      
      expect(result).toHaveProperty('id', mockFlashcardId);
      expect(result).toHaveProperty('front_content');
      expect(result).toHaveProperty('back_content');
    });
    
    it('should throw an error when flashcard is not found', async () => {
      // Arrange
      (supabaseMock.single as any).mockReturnValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });
      
      // Act & Assert
      await expect(
        getFlashcardForReview(supabaseMock, mockUserId, mockFlashcardId)
      ).rejects.toThrow('Flashcard not found');
    });
  });
  
  describe('createFlashcard', () => {
    let supabaseMock: SupabaseClient;
    
    beforeEach(() => {
      supabaseMock = createSupabaseMock();
      vi.clearAllMocks();
      
      // Setup default mock responses
      (supabaseMock.from as any).mockReturnThis();
      (supabaseMock.insert as any).mockReturnThis();
      (supabaseMock.select as any).mockReturnThis();
      (supabaseMock.single as any).mockReturnValue({
        data: {
          id: mockFlashcardId,
          front_content: 'New Card Front',
          back_content: 'New Card Back',
          is_ai_generated: false,
          created_at: '2023-05-01T10:00:00Z',
          correct_answers_count: 0
        },
        error: null,
      });
    });
    
    it('should create a flashcard successfully', async () => {
      // Arrange
      const flashcardData = {
        front_content: 'New Card Front',
        back_content: 'New Card Back',
      };
      
      // Act
      const result = await createFlashcard(
        supabaseMock, 
        mockUserId, 
        flashcardData
      );
      
      // Assert
      expect(supabaseMock.from).toHaveBeenCalledWith('flashcards');
      expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUserId,
        front_content: flashcardData.front_content,
        back_content: flashcardData.back_content,
        is_ai_generated: false,
      }));
      
      expect(result).toHaveProperty('id', mockFlashcardId);
      expect(result).toHaveProperty('front_content', flashcardData.front_content);
      expect(result).toHaveProperty('back_content', flashcardData.back_content);
      expect(result).toHaveProperty('is_ai_generated', false);
      expect(result).toHaveProperty('correct_answers_count', 0);
    });
    
    it('should throw an error when database operation fails', async () => {
      // Arrange
      const flashcardData = {
        front_content: 'New Card Front',
        back_content: 'New Card Back',
      };
      
      (supabaseMock.single as any).mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });
      
      // Act & Assert
      await expect(
        createFlashcard(supabaseMock, mockUserId, flashcardData)
      ).rejects.toThrow('Failed to create flashcard');
    });
  });
}); 