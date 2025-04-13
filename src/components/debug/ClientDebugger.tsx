import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Component wyświetlający informacje debugowania dla deweloperów
 */
export default function ClientDebugger() {
  const [flashcardReviews, setFlashcardReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      // Dodaj timestamp, aby uniknąć cache'owania
      const cacheBuster = new Date().getTime();
      
      // Znajdź najbliższą powtórkę
      try {
        const nextReviewResponse = await axios.get(`/api/debug/next-review?t=${cacheBuster}`);
        if (nextReviewResponse.data && nextReviewResponse.data.reviews) {
          setFlashcardReviews(nextReviewResponse.data.reviews);
        }
      } catch (reviewErr) {
        console.error("Error fetching reviews:", reviewErr);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching debug data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateTimeRemaining = (dateString: string) => {
    const reviewDate = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((reviewDate.getTime() - now.getTime()) / 1000);
    
    if (diffSeconds < 0) {
      return "Dostępne teraz";
    }
    
    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    
    return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  };

  return (
    <div className="space-y-3 text-xs">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Debugowanie fiszek</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          {loading ? (
            <div className="text-center py-2">Ładowanie danych...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {/* Tabelka z przeglądem recenzji fiszek */}
              <div>
                <h3 className="font-medium mb-1">Nadchodzące powtórki ({flashcardReviews.length})</h3>
                {flashcardReviews.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-semibold py-1 px-2">ID</th>
                          <th className="text-left font-semibold py-1 px-2">Następna powtórka</th>
                          <th className="text-left font-semibold py-1 px-2">Pozostało</th>
                          <th className="text-left font-semibold py-1 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flashcardReviews.map((review, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                            <td className="py-1 px-2 font-mono">{review.flashcard_id?.substring(0, 8)}...</td>
                            <td className="py-1 px-2">{formatDate(review.next_review_date)}</td>
                            <td className="py-1 px-2">{calculateTimeRemaining(review.next_review_date)}</td>
                            <td className="py-1 px-2">
                              <span 
                                className={`inline-block px-1.5 py-0.5 rounded-full text-xs ${
                                  new Date(review.next_review_date) <= new Date() 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                }`}
                              >
                                {new Date(review.next_review_date) <= new Date() ? "Dostępne" : "Oczekujące"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-2 text-muted-foreground">Brak zaplanowanych powtórek</div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={fetchDebugData}>
                  Odśwież dane
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 