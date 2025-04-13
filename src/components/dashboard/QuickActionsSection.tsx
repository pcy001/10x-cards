import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, PlusCircle, List } from "lucide-react";

/**
 * Sekcja z szybkimi akcjami na dashboardzie
 */
export default function QuickActionsSection() {
  const quickActions = [
    {
      title: "Stwórz nowe fiszki",
      description: "Dodaj nowe fiszki do swojej kolekcji",
      icon: <PlusCircle className="w-5 h-5" />,
      href: "/flashcards/create",
      variant: "default" as const,
    },
    {
      title: "Wygeneruj fiszki z tekstu",
      description: "Użyj AI do automatycznego generowania fiszek",
      icon: <List className="w-5 h-5" />,
      href: "/flashcards/generate",
      variant: "outline" as const,
    },
    {
      title: "Zarządzaj fiszkami",
      description: "Przeglądaj, edytuj i organizuj swoje fiszki",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/flashcards",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Szybki dostęp</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <a 
              key={index}
              href={action.href}
              className="block"
            >
              <Button
                variant={action.variant}
                className="w-full justify-start h-auto py-3 px-4"
              >
                <div className="flex items-start gap-3">
                  <div className="text-primary">{action.icon}</div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 