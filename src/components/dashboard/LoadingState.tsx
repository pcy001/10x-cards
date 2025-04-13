import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Komponent wyświetlający stan ładowania dashboardu
 */
export default function LoadingState() {
  return (
    <div className="space-y-4">
      {/* Skeleton dla sekcji powitalnej */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>

      {/* Skeleton dla sekcji liczby fiszek */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-8 w-40 mx-auto mt-4" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton dla sekcji szybkich akcji */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 