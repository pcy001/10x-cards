import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardResponseDto, FlashcardsResponseDto } from '@/types';
import FlashcardsHeader from './FlashcardsHeader';
import FlashcardsList from './FlashcardsList';
import Pagination from './Pagination';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { mapFlashcardToViewModel, FlashcardViewModel, FlashcardsQueryParams } from './types';

interface FlashcardsListContainerProps {
  initialPage?: number;
  initialPerPage?: number;
  initialSortBy?: string;
  initialSortDir?: string;
}

export default function FlashcardsListContainer({
  initialPage = 1,
  initialPerPage = 20,
  initialSortBy = 'created_at',
  initialSortDir = 'desc'
}: FlashcardsListContainerProps) {
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalItems: 0,
    perPage: initialPerPage
  });
  const [sortBy, setSortBy] = useState<'created_at' | 'correct_answers_count'>(
    initialSortBy as 'created_at' | 'correct_answers_count'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir as 'asc' | 'desc');
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Funkcja do pobierania fiszek z API
  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        per_page: pagination.perPage.toString(),
        sort_by: sortBy,
        sort_dir: sortDir
      });

      const response = await fetch(`/api/flashcards?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać listy fiszek');
      }

      const data: FlashcardsResponseDto = await response.json();
      
      setFlashcards(data.data.map(mapFlashcardToViewModel));
      setPagination({
        currentPage: data.pagination.current_page,
        totalPages: data.pagination.pages,
        totalItems: data.pagination.total,
        perPage: data.pagination.per_page
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się pobrać fiszek');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, sortBy, sortDir]);

  // Efekt do pobierania fiszek przy zmianie parametrów
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Funkcje do zarządzania paginacją
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
  };

  // Funkcje do zarządzania sortowaniem
  const handleSortChange = (newSortBy: string, newSortDir: string) => {
    setSortBy(newSortBy as 'created_at' | 'correct_answers_count');
    setSortDir(newSortDir as 'asc' | 'desc');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Funkcje do zarządzania usuwaniem fiszek
  const handleDeleteInitiate = (id: string) => {
    setFlashcardToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!flashcardToDelete) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/flashcards/${flashcardToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć fiszki');
      }

      setFlashcards(prev => prev.filter(f => f.id !== flashcardToDelete));
      setFlashcardToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się usunąć fiszki');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setFlashcardToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <FlashcardsHeader
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchFlashcards()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {!isLoading && flashcards.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych fiszek</p>
          <a 
            href="/flashcards/create"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-block"
          >
            Utwórz pierwszą fiszkę
          </a>
        </div>
      )}

      {(flashcards.length > 0 || isLoading) && (
        <FlashcardsList
          flashcards={flashcards}
          onDeleteFlashcard={handleDeleteInitiate}
          isLoading={isLoading}
        />
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          perPage={pagination.perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        flashcardId={flashcardToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
} 