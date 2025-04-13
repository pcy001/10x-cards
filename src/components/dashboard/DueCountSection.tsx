import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";
import { DueCountResponse } from "@/types/dashboard";

interface DueCountSectionProps {
  dueCount: DueCountResponse;
}

/**
 * Sekcja wyświetlająca liczbę fiszek oczekujących na powtórzenie
 */
export default function DueCountSection({ dueCount }: DueCountSectionProps) {
  const startLearningSession = () => {
    window.location.href = "/learning/start";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Fiszki do powtórki</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Licznik fiszek i pasek postępu */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Łącznie</span>
              <span className="font-semibold">{dueCount.total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              {dueCount.total > 0 ? (
                <div
                  className="h-full bg-primary"
                  style={{ width: "100%" }}
                ></div>
              ) : (
                <div className="h-full bg-primary/20" style={{ width: "100%" }}></div>
              )}
            </div>
            {dueCount.total > 0 ? (
              <Button
                onClick={startLearningSession}
                className="w-full mt-4 gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Rozpocznij naukę
              </Button>
            ) : (
              <p className="text-center text-muted-foreground text-sm mt-4">
                Nie masz fiszek do powtórki
              </p>
            )}
          </div>

          {/* Podział na kategorie */}
          {dueCount.byCategory.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-3">Według kategorii</h3>
              <div className="space-y-2">
                {dueCount.byCategory.map((category) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 bg-muted rounded-full w-20 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              (category.count / dueCount.total) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {category.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs justify-between"
                onClick={() => { window.location.href = "/categories"; }}
              >
                Zobacz wszystkie kategorie
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 