# Plan implementacji widoku dodawania fiszek

## 1. Przegląd widoku

Widok dodawania fiszek pozwala użytkownikowi na ręczne tworzenie nowych fiszek poprzez wprowadzenie treści dla przodu i tyłu fiszki. Jest to prostszy alternatywny sposób tworzenia fiszek w porównaniu do generatora wykorzystującego AI.

## 2. Specyfikacja widoku

### 2.1. Ścieżka URL
- `/flashcards/create`

### 2.2. Komponenty strony
- Formularz dodawania fiszki
  - Pole tekstowe dla przodu fiszki (front_content)
  - Pole tekstowe dla tyłu fiszki (back_content)
  - Liczniki znaków dla obu pól
  - Przyciski akcji (Zapisz/Anuluj)
- Sekcja pomocy/instrukcji
- Komunikaty o błędach walidacji

### 2.3. Interakcje
- Wprowadzanie tekstu w pola formularza
- Walidacja danych podczas wprowadzania
- Zapisanie fiszki po kliknięciu przycisku "Zapisz"
- Anulowanie i powrót do listy fiszek po kliknięciu "Anuluj"
- Przekierowanie do listy fiszek po pomyślnym zapisaniu

### 2.4. Stany
- Stan początkowy (puste pola)
- Stan walidacji (błędy wyświetlane pod polami)
- Stan ładowania (podczas wysyłania danych do API)
- Stan sukcesu (po pomyślnym zapisaniu)
- Stan błędu (gdy wystąpi błąd API)

## 3. Struktura plików

```
src/
├── pages/
│   └── flashcards/
│       └── create.astro         # Strona dodawania fiszek
├── components/
│   └── flashcards/
│       └── FlashcardForm.tsx    # Komponent formularza dodawania fiszek
│       └── CharCounter.tsx      # Komponent licznika znaków
```

## 4. Implementacja komponentów

### 4.1. Strona create.astro

```astro
---
import Layout from "@/layouts/Layout.astro";
import FlashcardForm from "@/components/flashcards/FlashcardForm";

// Sprawdź czy użytkownik jest zalogowany
const supabase = Astro.locals.supabase;
const {
  data: { session },
} = await supabase.auth.getSession();

// Jeśli użytkownik nie jest zalogowany, przekieruj do strony logowania
if (!session) {
  return Astro.redirect("/login");
}
---

<Layout title="Dodaj nową fiszkę - 10xCards">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Dodaj nową fiszkę</h1>
    
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <p class="text-gray-600 mb-6">
        Wprowadź treść przodu i tyłu fiszki. Przód powinien zawierać pytanie lub termin do nauki,
        a tył odpowiedź lub definicję.
      </p>
      
      <FlashcardForm client:load />
    </div>
  </div>
</Layout>
```

### 4.2. Komponent FlashcardForm.tsx

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CharCounter from "./CharCounter";

interface FormData {
  front_content: string;
  back_content: string;
}

export default function FlashcardForm() {
  const [formData, setFormData] = useState<FormData>({
    front_content: "",
    back_content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.front_content.trim()) {
      newErrors.front_content = "Przód fiszki jest wymagany";
    } else if (formData.front_content.length > 500) {
      newErrors.front_content = "Maksymalna długość to 500 znaków";
    }
    
    if (!formData.back_content.trim()) {
      newErrors.back_content = "Tył fiszki jest wymagany";
    } else if (formData.back_content.length > 200) {
      newErrors.back_content = "Maksymalna długość to 200 znaków";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Usuń błąd dla tego pola, jeśli został wcześniej wyświetlony
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja formularza
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Wystąpił błąd podczas zapisywania fiszki");
      }
      
      // Pomyślnie zapisano fiszkę, przekieruj do listy fiszek
      // Zapisz informację o sukcesie w sessionStorage aby wyświetlić komunikat
      sessionStorage.setItem("flashcardCreated", "true");
      navigate("/flashcards");
    } catch (error) {
      console.error("Error creating flashcard:", error);
      setApiError(error instanceof Error ? error.message : "Nieznany błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/flashcards");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="front_content" className="block text-sm font-medium">
          Przód fiszki <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="front_content"
          name="front_content"
          value={formData.front_content}
          onChange={handleChange}
          placeholder="Wpisz treść przodu fiszki (np. pytanie, termin do nauki)"
          className={`h-32 ${errors.front_content ? "border-red-500" : ""}`}
          disabled={isSubmitting}
        />
        <div className="flex justify-between">
          {errors.front_content && (
            <p className="text-sm text-red-500">{errors.front_content}</p>
          )}
          <CharCounter
            current={formData.front_content.length}
            max={500}
            className="text-xs text-gray-500"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="back_content" className="block text-sm font-medium">
          Tył fiszki <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="back_content"
          name="back_content"
          value={formData.back_content}
          onChange={handleChange}
          placeholder="Wpisz treść tyłu fiszki (np. odpowiedź, definicja)"
          className={`h-32 ${errors.back_content ? "border-red-500" : ""}`}
          disabled={isSubmitting}
        />
        <div className="flex justify-between">
          {errors.back_content && (
            <p className="text-sm text-red-500">{errors.back_content}</p>
          )}
          <CharCounter
            current={formData.back_content.length}
            max={200}
            className="text-xs text-gray-500"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz fiszkę"}
        </Button>
      </div>
    </form>
  );
}
```

### 4.3. Komponent CharCounter.tsx

```tsx
interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
}

export default function CharCounter({ current, max, className = "" }: CharCounterProps) {
  const isNearLimit = current > max * 0.8;
  const isOverLimit = current > max;
  
  let textColor = "text-gray-500";
  if (isOverLimit) {
    textColor = "text-red-500";
  } else if (isNearLimit) {
    textColor = "text-amber-500";
  }
  
  return (
    <span className={`${textColor} ${className}`}>
      {current}/{max} znaków
    </span>
  );
}
```

## 5. Integracja z widokiem listy fiszek

Aby zintegrować nowy widok z istniejącym widokiem listy fiszek, należy dodać przycisk "Dodaj nową fiszkę" w widoku listy:

```astro
<!-- W pliku src/pages/flashcards/index.astro -->
<div class="flex justify-between items-center mb-6">
  <h1 class="text-2xl font-bold">Twoje fiszki</h1>
  <div class="space-x-4">
    <a href="/flashcards/create" class="btn-primary">
      Dodaj nową fiszkę
    </a>
    <a href="/flashcards/generate" class="btn-secondary">
      Generuj fiszki z AI
    </a>
  </div>
</div>
```

Dodatkowo, należy wyświetlić komunikat o pomyślnym dodaniu fiszki po przekierowaniu z widoku dodawania:

```tsx
// W komponencie obsługującym listę fiszek
import { useEffect, useState } from "react";

export default function FlashcardsList() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  useEffect(() => {
    // Sprawdź, czy jest informacja o dodaniu fiszki
    const wasFlashcardCreated = sessionStorage.getItem("flashcardCreated") === "true";
    if (wasFlashcardCreated) {
      setShowSuccessMessage(true);
      // Usuń informację z sessionStorage
      sessionStorage.removeItem("flashcardCreated");
      
      // Ukryj komunikat po 5 sekundach
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <div>
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Fiszka została pomyślnie dodana!
        </div>
      )}
      
      {/* Reszta komponentu listy fiszek */}
    </div>
  );
}
```

## 6. Wytyczne dostępności i UX

### 6.1. Dostępność
- Wszystkie pola formularza mają odpowiednie etykiety
- Błędy walidacji są wyraźnie oznaczone i powiązane z odpowiednimi polami
- Przyciski mają odpowiednie stany (focus, hover, active, disabled)
- Zapewnione jest odpowiednie kontrastowanie kolorów
- Obsługa formularza jest możliwa przy użyciu klawiatury

### 6.2. UX (User Experience)
- Intuicyjny układ formularza z jasnymi instrukcjami
- Natychmiastowa walidacja po opuszczeniu pola
- Liczniki znaków informujące o limicie
- Wyraźne oznaczenie pól wymaganych
- Przyciski z czytelnym opisem akcji
- Informacja zwrotna o statusie operacji
- Możliwość anulowania operacji

## 7. Testy

### 7.1. Przypadki testowe
1. Użytkownik wprowadza poprawne dane i z powodzeniem tworzy fiszkę
2. Użytkownik próbuje wysłać pusty formularz i widzi komunikaty o błędach
3. Użytkownik wprowadza zbyt długi tekst i widzi odpowiedni komunikat
4. Użytkownik wprowadza poprawne dane, ale występuje błąd serwera
5. Użytkownik klika "Anuluj" i wraca do listy fiszek bez tworzenia nowej fiszki
6. Użytkownik jest przekierowany do strony logowania, gdy nie jest zalogowany

### 7.2. Responsywność
Chociaż priorytetem jest widok desktopowy, formularz powinien zachowywać podstawową użyteczność na mniejszych ekranach:
- Pola formularza zajmują 100% szerokości na małych ekranach
- Przyciski są odpowiednio rozmieszczone
- Tekst i etykiety są czytelne na wszystkich rozmiarach ekranu 