import { useState, useEffect } from 'react';
import { SessionSummaryDto } from '@/types';
import { SessionSummaryViewModel, mapSessionSummaryToViewModel } from './types';

export function useSummaryData(initialSummary?: SessionSummaryDto) {
  const [summaryData, setSummaryData] = useState<SessionSummaryViewModel | null>(
    initialSummary ? mapSessionSummaryToViewModel(initialSummary) : null
  );
  const [isLoading, setIsLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);
  
  // Sprawdź czy mamy dane w sessionStorage lub w URL
  useEffect(() => {
    if (!initialSummary && !summaryData) {
      // Najpierw sprawdzamy w sessionStorage
      const sessionStorageData = sessionStorage.getItem('learningSessionSummary');
      
      if (sessionStorageData) {
        try {
          const parsedData = JSON.parse(sessionStorageData) as SessionSummaryDto;
          setSummaryData(mapSessionSummaryToViewModel(parsedData));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Błąd parsowania danych z sessionStorage:", e);
          // Jeśli nie udało się sparsować danych, próbujemy pobrać z URL
        }
      }
      
      // Jeśli nie mamy danych w sessionStorage, próbujemy z URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId) {
        fetchSessionSummary(sessionId);
      } else {
        setError('Brak identyfikatora sesji');
        setIsLoading(false);
      }
    }
  }, [initialSummary, summaryData]);
  
  async function fetchSessionSummary(sessionId: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/learning/sessions/${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać podsumowania sesji');
      }
      
      const data: { session_summary: SessionSummaryDto } = await response.json();
      
      // Zapisz dane w sessionStorage dla przyszłego użycia
      sessionStorage.setItem('learningSessionSummary', JSON.stringify(data.session_summary));
      
      setSummaryData(mapSessionSummaryToViewModel(data.session_summary));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  }
  
  return { summaryData, isLoading, error };
} 