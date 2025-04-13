# Plan implementacji usługi OpenRouter w 10xCards

## 1. Opis usługi

Usługa OpenRouter będzie odpowiedzialna za komunikację z API OpenRouter w celu generowania fiszek na podstawie dostarczonego tekstu. Umożliwi wykorzystanie zaawansowanych modeli językowych do automatycznego tworzenia fiszek edukacyjnych bez konieczności ręcznego wprowadzania każdej fiszki przez użytkownika.

Główne funkcjonalności usługi:
- Generowanie fiszek na podstawie tekstu źródłowego
- Dostosowanie generowania do określonego języka docelowego
- Kontrola poziomu trudności generowanych fiszek
- Dostosowanie typu generowanych fiszek (słownictwo, zwroty, definicje)
- Obsługa limitów i ograniczeń API

Usługa będzie zintegrowana z istniejącym systemem fiszek i będzie wywoływana przez endpoint API `/api/flashcards/generate`.

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.OPENROUTER_API_KEY;
    
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }
  
  // Metody...
}
```

Konstruktor przyjmuje opcjonalny parametr `apiKey`. Jeśli klucz nie zostanie przekazany, usługa spróbuje pobrać go ze zmiennej środowiskowej `OPENROUTER_API_KEY`. Jeśli klucz API nie jest dostępny, konstruktor zgłosi błąd.

## 3. Publiczne metody i pola

### `generateFlashcards`

Główna metoda publiczna odpowiedzialna za generowanie fiszek.

```typescript
async generateFlashcards(params: GenerateFlashcardsParams): Promise<GeneratedFlashcardDto[]> {
  try {
    const { source_text, target_language, difficulty_level = "intermediate", generation_type = "vocabulary", limit = 10 } = params;
    
    // Walidacja parametrów wejściowych
    this.validateParams(params);
    
    // Przygotowanie promptu dla modelu
    const prompt = this.preparePrompt(params);
    
    // Wywołanie API OpenRouter
    const response = await this.callOpenRouterApi(prompt, limit);
    
    // Parsowanie odpowiedzi
    const flashcards = this.parseResponse(response);
    
    // Walidacja wygenerowanych fiszek
    return this.validateGeneratedFlashcards(flashcards);
  } catch (error) {
    this.handleError(error);
    throw error;
  }
}
```

### Typy danych

```typescript
interface GenerateFlashcardsParams {
  source_text: string;
  target_language: string;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  generation_type?: "vocabulary" | "phrases" | "definitions";
  limit?: number;
}

interface GeneratedFlashcardDto {
  front_content: string;
  back_content: string;
  is_ai_generated: boolean;
}
```

## 4. Prywatne metody i pola

### `validateParams`

```typescript
private validateParams(params: GenerateFlashcardsParams): void {
  const { source_text, target_language, limit } = params;
  
  if (!source_text || source_text.trim().length === 0) {
    throw new Error("Source text is required");
  }
  
  if (source_text.length > 10000) {
    throw new Error("Source text is too long (max 10,000 characters)");
  }
  
  if (!target_language || target_language.trim().length === 0) {
    throw new Error("Target language is required");
  }
  
  if (limit && (limit < 1 || limit > 20)) {
    throw new Error("Limit must be between 1 and 20");
  }
}
```

### `preparePrompt`

```typescript
private preparePrompt(params: GenerateFlashcardsParams): string {
  const { source_text, target_language, difficulty_level, generation_type, limit } = params;
  
  const systemMessage = `
    Jesteś ekspertem w tworzeniu fiszek edukacyjnych. 
    Twoim zadaniem jest wygenerowanie fiszek na podstawie podanego tekstu.
    Generuj fiszki na poziomie trudności: ${difficulty_level}.
    Typ fiszek: ${generation_type}.
    Język docelowy: ${target_language}.
    Utwórz maksymalnie ${limit} fiszek.
  `;
  
  const userMessage = `
    Proszę wygenerować fiszki na podstawie tego tekstu:
    ${source_text}
  `;
  
  return {
    system: systemMessage,
    user: userMessage
  };
}
```

### `callOpenRouterApi`

```typescript
private async callOpenRouterApi(prompt: { system: string; user: string }, limit: number): Promise<any> {
  const requestBody = {
    model: "anthropic/claude-3-opus-20240229",
    messages: [
      {
        role: "system",
        content: prompt.system
      },
      {
        role: "user",
        content: prompt.user
      }
    ],
    response_format: {
      type: "json_object",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front_content: { type: "string" },
                back_content: { type: "string" }
              },
              required: ["front_content", "back_content"]
            }
          }
        },
        required: ["flashcards"]
      }
    },
    temperature: 0.7,
    max_tokens: 4000
  };

  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://10xcards.app", // Adres strony, z której pochodzi zapytanie
      "X-Title": "10xCards" // Nazwa aplikacji
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OpenRouterError(`API call failed with status ${response.status}`, response.status, errorData);
  }

  return await response.json();
}
```

### `parseResponse`

```typescript
private parseResponse(response: any): GeneratedFlashcardDto[] {
  try {
    // Sprawdzenie czy odpowiedź zawiera oczekiwane pola
    if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      throw new Error("Invalid API response format");
    }

    // Parsowanie treści odpowiedzi jako JSON
    const content = JSON.parse(response.choices[0].message.content);
    
    if (!content.flashcards || !Array.isArray(content.flashcards)) {
      throw new Error("Invalid flashcards format in response");
    }

    // Mapowanie odpowiedzi na format DTO
    return content.flashcards.map(card => ({
      front_content: card.front_content,
      back_content: card.back_content,
      is_ai_generated: true
    }));
  } catch (error) {
    console.error("Error parsing OpenRouter response:", error);
    throw new Error("Failed to parse model response");
  }
}
```

### `validateGeneratedFlashcards`

```typescript
private validateGeneratedFlashcards(flashcards: GeneratedFlashcardDto[]): GeneratedFlashcardDto[] {
  return flashcards.filter(card => {
    // Sprawdzenie czy pola nie są puste
    if (!card.front_content || !card.back_content) {
      return false;
    }
    
    // Sprawdzenie maksymalnej długości zawartości
    if (card.front_content.length > 500 || card.back_content.length > 200) {
      // Przycinamy zawartość, jeśli jest za długa
      card.front_content = card.front_content.substring(0, 500);
      card.back_content = card.back_content.substring(0, 200);
    }
    
    return true;
  });
}
```

### `handleError`

```typescript
private handleError(error: any): void {
  // Logowanie błędu
  console.error("OpenRouter service error:", error);
  
  // Konwersja różnych typów błędów na standardowy format
  if (error instanceof OpenRouterError) {
    // Błąd został już sformatowany
    throw error;
  } else if (error instanceof Error) {
    throw new OpenRouterError(error.message, 500);
  } else {
    throw new OpenRouterError("Unknown error occurred", 500);
  }
}
```

## 5. Obsługa błędów

Zdefiniujemy własną klasę błędu, która będzie zawierać szczegółowe informacje o problemach z API:

```typescript
class OpenRouterError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
    this.data = data;
  }
}
```

Kody błędów i ich obsługa:
- 400: Nieprawidłowe żądanie (błędne parametry)
- 401: Nieautoryzowany dostęp (nieprawidłowy klucz API)
- 402: Przekroczony limit kredytów
- 429: Zbyt wiele żądań
- 500: Błąd serwera

Strategia obsługi błędów:
1. Logowanie wszystkich błędów
2. Ponowna próba dla błędów HTTP 429 i 500 (z backoff)
3. Informowanie użytkownika o problemach w zrozumiały sposób
4. Monitorowanie wskaźników błędów w celu identyfikacji problemów

## 6. Kwestie bezpieczeństwa

1. **Ochrona klucza API:**
   - Klucz API przechowywany w zmiennych środowiskowych
   - Nigdy nie ekspozuj klucza w kodzie front-end
   - Używanie polityki CORS dla endpointów API

2. **Walidacja wejść:**
   - Sprawdzanie długości i formatu tekstu źródłowego
   - Filtrowanie niebezpiecznych znaków
   - Implementacja limitów dla zapytań

3. **Ochrona przed nadużyciami:**
   - Implementacja rate limitingu na poziomie API
   - Monitorowanie użycia pod kątem anomalii
   - Ustawienie limitów na ilość generowanych fiszek na użytkownika

4. **Ochrona danych użytkowników:**
   - Nie przesyłaj danych identyfikujących użytkownika do OpenRouter
   - Zaimplementuj politykę prywatności dla generowanych danych
   - Daj użytkownikowi opcję usunięcia wszystkich wygenerowanych danych

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja zmiennych środowiskowych

1. Dodaj zmienną `OPENROUTER_API_KEY` do pliku `.env.local`:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

2. Zaktualizuj plik `src/env.d.ts`, aby uwzględnić nową zmienną środowiskową:
   ```typescript
   interface ImportMetaEnv {
     readonly SUPABASE_URL: string;
     readonly SUPABASE_KEY: string;
     readonly OPENROUTER_API_KEY: string;
     // inne zmienne...
   }
   ```

### Krok 2: Implementacja usługi OpenRouter

1. Utwórz plik `src/lib/services/openrouter.service.ts` z implementacją klasy:
   ```typescript
   import type { GenerateFlashcardsInput } from "../validation/schemas";
   import type { GeneratedFlashcardDto } from "../../types";
   
   // Implementacja klasy OpenRouterService
   export class OpenRouterService {
     // ... implementacja z powyższych sekcji
   }
   
   // Eksport instancji singletona
   export const openRouterService = new OpenRouterService();
   ```

### Krok 3: Implementacja endpointu API do generowania fiszek

1. Utwórz plik `src/pages/api/flashcards/generate.ts`:
   ```typescript
   import type { APIContext } from "astro";
   import { openRouterService } from "../../../lib/services/openrouter.service";
   import { generateFlashcardsSchema } from "../../../lib/validation/schemas";
   import type { GenerateFlashcardsInput } from "../../../lib/validation/schemas";
   
   export const prerender = false;
   
   export async function POST(context: APIContext): Promise<Response> {
     try {
       // Sprawdź czy użytkownik jest zalogowany
       const { data: sessionData } = await context.locals.supabase.auth.getSession();
       if (!sessionData.session) {
         return new Response(
           JSON.stringify({ error: "Unauthorized access. Please login to continue." }),
           { status: 401, headers: { "Content-Type": "application/json" } }
         );
       }
   
       // Pobierz dane z żądania
       const data = await context.request.json();
       
       // Walidacja danych wejściowych
       const validationResult = generateFlashcardsSchema.safeParse(data);
       if (!validationResult.success) {
         return new Response(
           JSON.stringify({ error: "Invalid input data", details: validationResult.error.errors }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }
       
       // Generowanie fiszek
       const flashcardsInput: GenerateFlashcardsInput = validationResult.data;
       const generatedFlashcards = await openRouterService.generateFlashcards(flashcardsInput);
       
       // Zwróć wygenerowane fiszki
       return new Response(
         JSON.stringify({ flashcards: generatedFlashcards }),
         { status: 200, headers: { "Content-Type": "application/json" } }
       );
     } catch (error: any) {
       console.error("Error generating flashcards:", error);
       
       // Określ kod statusu na podstawie błędu
       const status = error.status || 500;
       const message = error.message || "An error occurred while generating flashcards";
       
       return new Response(
         JSON.stringify({ error: message }),
         { status, headers: { "Content-Type": "application/json" } }
       );
     }
   }
   ```

### Krok 4: Implementacja komponentu interfejsu użytkownika

1. Utwórz plik `src/components/flashcards/GenerateFromTextForm.tsx`:
   ```tsx
   import { useState } from "react";
   import { Button } from "@/components/ui/Button";
   import { Card } from "@/components/ui/Card";
   import { Input } from "@/components/ui/Input";
   import { Label } from "@/components/ui/Label";
   import { Textarea } from "@/components/ui/Textarea";
   import { useToast } from "@/components/ui/use-toast";
   import { Check, Loader2 } from "lucide-react";
   import type { GeneratedFlashcardDto } from "../../types";
   import axios from "axios";
   
   export default function GenerateFromTextForm() {
     const [sourceText, setSourceText] = useState("");
     const [targetLanguage, setTargetLanguage] = useState("pl");
     const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
     const [generationType, setGenerationType] = useState("vocabulary");
     const [limit, setLimit] = useState(10);
     const [isGenerating, setIsGenerating] = useState(false);
     const [generatedFlashcards, setGeneratedFlashcards] = useState<GeneratedFlashcardDto[]>([]);
     const [selectedFlashcards, setSelectedFlashcards] = useState<Record<string, boolean>>({});
     const [isSaving, setIsSaving] = useState(false);
     
     const { toast } = useToast();
     
     const handleGenerate = async () => {
       if (!sourceText.trim()) {
         toast({
           title: "Błąd",
           description: "Wprowadź tekst źródłowy.",
           variant: "destructive",
         });
         return;
       }
       
       setIsGenerating(true);
       
       try {
         const response = await axios.post("/api/flashcards/generate", {
           source_text: sourceText,
           target_language: targetLanguage,
           difficulty_level: difficultyLevel,
           generation_type: generationType,
           limit,
         });
         
         setGeneratedFlashcards(response.data.flashcards);
         
         // Inicjalizacja stanu zaznaczenia (wszystkie domyślnie zaznaczone)
         const initialSelection = response.data.flashcards.reduce((acc, card, index) => {
           acc[index] = true;
           return acc;
         }, {});
         
         setSelectedFlashcards(initialSelection);
         
         toast({
           title: "Sukces",
           description: `Wygenerowano ${response.data.flashcards.length} fiszek.`,
         });
       } catch (error: any) {
         console.error("Error generating flashcards:", error);
         
         toast({
           title: "Błąd generowania",
           description: error.response?.data?.error || "Wystąpił problem podczas generowania fiszek.",
           variant: "destructive",
         });
       } finally {
         setIsGenerating(false);
       }
     };
     
     const handleSaveSelected = async () => {
       const flashcardsToSave = generatedFlashcards.filter((_, index) => selectedFlashcards[index]);
       
       if (flashcardsToSave.length === 0) {
         toast({
           title: "Informacja",
           description: "Nie wybrano żadnych fiszek do zapisania.",
         });
         return;
       }
       
       setIsSaving(true);
       
       try {
         const response = await axios.post("/api/flashcards/accept", {
           flashcards: flashcardsToSave,
         });
         
         toast({
           title: "Sukces",
           description: `Zapisano ${response.data.accepted_count} fiszek.`,
         });
         
         // Czyszczenie formularza
         setGeneratedFlashcards([]);
         setSelectedFlashcards({});
         setSourceText("");
       } catch (error: any) {
         console.error("Error saving flashcards:", error);
         
         toast({
           title: "Błąd zapisywania",
           description: error.response?.data?.error || "Wystąpił problem podczas zapisywania fiszek.",
           variant: "destructive",
         });
       } finally {
         setIsSaving(false);
       }
     };
     
     // Reszta komponentu z renderowaniem formularza i wygenerowanych fiszek
     // ...
   }
   ```

### Krok 5: Integracja z istniejącym kodem

1. Zaktualizuj plik `src/pages/flashcards/create.astro`, aby dodać nową zakładkę/opcję generowania z tekstu:
   ```astro
   ---
   import Layout from "../../layouts/MainLayout.astro";
   import CreateFlashcardForm from "../../components/flashcards/CreateFlashcardForm";
   import GenerateFromTextForm from "../../components/flashcards/GenerateFromTextForm";
   import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
   
   // Sprawdź czy użytkownik jest zalogowany
   const supabase = Astro.locals.supabase;
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     return Astro.redirect("/auth/login?redirect=/flashcards/create");
   }
   ---

   <Layout title="Stwórz fiszkę | 10xCards">
     <div class="container mx-auto p-4">
       <h1 class="text-2xl font-bold mb-4">Tworzenie fiszek</h1>
       
       <Tabs defaultValue="manual" class="w-full">
         <TabsList>
           <TabsTrigger value="manual">Ręczne tworzenie</TabsTrigger>
           <TabsTrigger value="generate">Generowanie z tekstu</TabsTrigger>
         </TabsList>
         
         <TabsContent value="manual">
           <CreateFlashcardForm client:load />
         </TabsContent>
         
         <TabsContent value="generate">
           <GenerateFromTextForm client:load />
         </TabsContent>
       </Tabs>
     </div>
   </Layout>
   ```

### Krok 6: Testowanie

1. Testowanie jednostkowe:
   - Testy walidacji parametrów
   - Testy parsowania odpowiedzi
   - Testy obsługi błędów

2. Testowanie integracyjne:
   - Testy endpointu API
   - Testy z mockami odpowiedzi OpenRouter

3. Testowanie end-to-end:
   - Testy generowania fiszek z różnymi parametrami
   - Testy zapisywania wygenerowanych fiszek

### Krok 7: Rozbudowa i monitorowanie

1. Dodanie metryk i logowania:
   - Czas odpowiedzi API
   - Liczba wygenerowanych fiszek
   - Wskaźniki błędów

2. Dodanie funkcji opinie o jakości:
   - Pozwól użytkownikom oceniać jakość wygenerowanych fiszek
   - Wykorzystaj opinie do doskonalenia promptów

3. Optymalizacja kosztów:
   - Monitorowanie kosztów API
   - Dostosowanie limitów i parametrów dla optymalizacji kosztów

4. Rozszerzenie funkcjonalności:
   - Dodanie dodatkowych modeli AI
   - Implementacja nowych typów generowanych fiszek 