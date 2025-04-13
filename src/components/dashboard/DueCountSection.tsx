import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, LucideLibrary } from "lucide-react";
import useDueCount from "@/hooks/useDueCount";
import { useEffect, useState } from "react";

/**
 * Sekcja wyświetlająca liczbę fiszek oczekujących na powtórzenie
 */
export default function DueCountSection() {
  // Używamy hooka do pobrania danych o fiszkach do powtórki
  const { data: dueCountData, isLoading, error, refetch } = useDueCount();
  
  // Stan do śledzenia liczby odświeżeń
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Pobierz dueToday z danych
  const dueTodayCount = dueCountData?.due_today || 0;
  const dueNextWeekTotal = dueCountData?.due_next_week?.total || 0;
  const totalDueCount = dueTodayCount + dueNextWeekTotal;

  // Dodajemy więcej logów dla debugowania
  useEffect(() => {
    console.log('DueCountSection - mounted/updated');
    console.log('DueCountSection - dueCountData:', JSON.stringify(dueCountData, null, 2));
    console.log('DueCountSection - dueTodayCount:', dueTodayCount);
    console.log('DueCountSection - dueNextWeekTotal:', dueNextWeekTotal);
    console.log('DueCountSection - isLoading:', isLoading);
    console.log('DueCountSection - error:', error);
    
    // Odśwież dane przy montowaniu komponentu
    refetch().then(() => {
      setRefreshCount(prev => prev + 1);
      console.log('DueCountSection - dane odświeżone, liczba odświeżeń:', refreshCount + 1);
    });
    
    // Dodajemy timer, który będzie odświeżał dane co 2 sekundy
    const timer = setInterval(() => {
      refetch().then(() => {
        setRefreshCount(prev => prev + 1);
        console.log('DueCountSection - timer odświeżył dane, liczba odświeżeń:', refreshCount + 1);
      });
    }, 2000);
    
    // Czyszczenie timera przy odmontowaniu komponentu
    return () => clearInterval(timer);
  }, [dueCountData, isLoading, error, refetch, refreshCount]);

  const startLearningSession = (onlyDue: boolean = false) => {
    console.log('Rozpoczynanie sesji nauki, onlyDue:', onlyDue);
    window.location.href = `/learning/start${onlyDue ? "?only_due=true" : ""}`;
  };

  // Ręczne odświeżenie danych
  const handleManualRefresh = () => {
    console.log('DueCountSection - ręczne odświeżenie danych');
    refetch().then(() => {
      setRefreshCount(prev => prev + 1);
      console.log('DueCountSection - dane odświeżone ręcznie, liczba odświeżeń:', refreshCount + 1);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fiszki do powtórki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fiszki do powtórki</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500 text-sm">
            Nie udało się pobrać danych. Spróbuj odświeżyć stronę.
          </p>
          <p className="text-center text-red-500 text-xs mt-1">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <div className="mt-3 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Fiszki do powtórki</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleManualRefresh} className="h-8 w-8 p-0">
          <span className="sr-only">Odśwież</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Licznik fiszek i pasek postępu */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Na dziś</span>
              <span className="font-semibold">{dueTodayCount}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              {dueTodayCount > 0 ? (
                <div
                  className="h-full bg-primary"
                  style={{ width: "100%" }}
                ></div>
              ) : (
                <div className="h-full bg-primary/20" style={{ width: "100%" }}></div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              {dueTodayCount > 0 ? (
                <Button
                  onClick={() => startLearningSession(true)}
                  className="w-full gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Powtórz fiszki ({dueTodayCount})
                </Button>
              ) : (
                <p className="text-center text-muted-foreground text-sm">
                  Nie masz fiszek do powtórki na dziś
                </p>
              )}
              
              <Button
                onClick={() => startLearningSession(false)}
                variant="outline"
                className="w-full gap-2"
              >
                <LucideLibrary className="w-4 h-4" />
                Przeglądaj wszystkie fiszki
              </Button>
            </div>
          </div>

          {/* Nadchodzące powtórki */}
          {dueNextWeekTotal > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-3">Nadchodzące powtórki</h3>
              <div className="space-y-2">
                {dueCountData?.due_next_week?.by_day.map((day) => day.count > 0 && (
                  <div key={day.date} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'long' })}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 bg-muted rounded-full w-20 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              (day.count / dueNextWeekTotal) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Debug info - tylko w wersji deweloperskiej */}
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-400">
            <p>Odświeżeń: {refreshCount}</p>
            <p>API: {JSON.stringify({due: dueTodayCount, next: dueNextWeekTotal, data: dueCountData})}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 