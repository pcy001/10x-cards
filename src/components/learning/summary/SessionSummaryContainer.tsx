import React, { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useSummaryData } from './useSummaryData';
import { SummaryHeader } from './SummaryHeader';
import { StatisticsDisplay } from './StatisticsDisplay';
import { SessionDurationDisplay } from './SessionDurationDisplay';
import { ActionButtons } from './ActionButtons';
import { SessionSummaryViewModel } from './types';

export default function SessionSummaryContainer() {
  const { summaryData, isLoading, error } = useSummaryData();

  // Sprawdzenie, czy możemy użyć danych z poprzedniej sesji
  useEffect(() => {
    const sessionStorageData = sessionStorage.getItem('learningSessionSummary');
    if (!summaryData && sessionStorageData) {
      try {
        const parsedData = JSON.parse(sessionStorageData) as SessionSummaryViewModel;
        // Tutaj moglibyśmy ustawić dane, ale ponieważ używamy już hooka useSummaryData,
        // który sam pobiera dane z API, nie musimy tego robić.
        // W rzeczywistej implementacji można by dodać parametr do hooka useSummaryData,
        // aby przyjmował również dane z sessionStorage.
      } catch (e) {
        console.error("Błąd parsowania danych z sessionStorage:", e);
      }
    }
  }, [summaryData]);

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
    // Opcjonalnie wyczyść dane sesji po powrocie do dashboardu
    sessionStorage.removeItem('learningSessionSummary');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Ładowanie podsumowania sesji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Brak danych podsumowania sesji</div>
        <ActionButtons onBackToDashboard={handleBackToDashboard} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-lg shadow border">
      <SummaryHeader endTime={summaryData.endTime} />
      
      <StatisticsDisplay 
        flashcardsReviewed={summaryData.flashcardsReviewed}
        correctAnswers={summaryData.correctAnswers}
        incorrectAnswers={summaryData.incorrectAnswers}
        completionPercentage={summaryData.completionPercentage}
      />
      
      <SessionDurationDisplay durationSeconds={summaryData.durationSeconds} />
      
      <div className="flex justify-center mt-8">
        <ActionButtons onBackToDashboard={handleBackToDashboard} />
      </div>
    </div>
  );
} 