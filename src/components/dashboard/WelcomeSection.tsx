import { Card, CardContent } from "@/components/ui/card";

interface WelcomeSectionProps {
  userName: string;
}

/**
 * Sekcja powitalna na dashboardzie
 */
export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  // Pobierz aktualną godzinę, aby dostosować powitanie
  const currentHour = new Date().getHours();
  let greeting = "Witaj";

  if (currentHour < 12) {
    greeting = "Dzień dobry";
  } else if (currentHour < 18) {
    greeting = "Witaj";
  } else {
    greeting = "Dobry wieczór";
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-sm">
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold mb-2">
          {greeting}, <span className="text-primary">{userName}</span>!
        </h1>
        <p className="text-muted-foreground">
          Witaj w aplikacji 10xCards. To twój dashboard, z którego możesz zarządzać swoimi fiszkami
          i szybko rozpoczynać sesje nauki.
        </p>
      </CardContent>
    </Card>
  );
} 