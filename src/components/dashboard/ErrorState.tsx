import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Komponent wyświetlający informację o błędzie
 */
export default function ErrorState({
  message = "Wystąpił problem podczas ładowania danych. Spróbuj ponownie później.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Spróbuj ponownie
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 