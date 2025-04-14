# Plan implementacji usługi OpenRouter w 10xCards

## 1. Opis usługi

Usługa OpenRouter będzie odpowiedzialna za komunikację z API OpenRouter, umożliwiając dostęp do różnych modeli LLM (Large Language Models) w celu generowania fiszek edukacyjnych na podstawie dostarczonych tekstów. OpenRouter działa jako agregator różnych dostawców AI (OpenAI, Anthropic, Google i innych), umożliwiając wybór modelu zapewniającego najlepszy stosunek wydajności do kosztów.

Główne funkcje usługi obejmują:
- Komunikację z API OpenRouter za pomocą kluczy API
- Wysyłanie odpowiednio skonstruowanych promptów do wybranych modeli
- Żądanie odpowiedzi w ustrukturyzowanym formacie JSON (fiszki)
- Parsowanie otrzymanych odpowiedzi do formatu aplikacji
- Obsługę błędów i ponawianie nieudanych zapytań
- Optymalizację kosztów przy zachowaniu wysokiej jakości generowanych fiszek

Usługa zostanie zaimplementowana w TypeScript jako moduł serwisowy, zgodnie z architekturą aplikacji 10xCards, i będzie wywoływana przez endpoint API `/api/flashcards/generate`.

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private defaultModel = "anthropic/claude-3-opus-20240229";
  
  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    defaultModel?: string;
  }) {
    this.apiKey = options?.apiKey || import.meta.env.OPENROUTER_API_KEY;
    
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
    
    if (options?.baseUrl) {
      this.baseUrl = options.baseUrl;
    }
    
    if (options?.defaultModel) {
      this.defaultModel = options.defaultModel;
    }
  }
  
  // Metody...
}
```

Konstruktor przyjmuje opcjonalny obiekt konfiguracyjny zawierający następujące parametry:
- `apiKey`: Klucz API OpenRouter (jeśli nie podano, zostanie użyty klucz ze zmiennej środowiskowej)
- `baseUrl`: Bazowy URL API (z domyślną wartością "https://openrouter.ai/api/v1")
- `defaultModel`: Domyślny model do użycia (z domyślną wartością "anthropic/claude-3-opus-20240229")

Konstrukcja serwisu rzuci wyjątek, jeśli klucz API nie zostanie dostarczony ani przez parametr, ani przez zmienną środowiskową.

## 3. Publiczne metody i pola

### 3.1. `generateFlashcards`

Główna metoda odpowiedzialna za generowanie fiszek na podstawie tekstu źródłowego.

```typescript
async generateFlashcards(params: {
  sourceText: string;
  targetLanguage: string;
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  generationType?: "vocabulary" | "phrases" | "definitions";
  limit?: number;
  model?: string;
}): Promise<Array<{
  frontContent: string;
  backContent: string;
  isAiGenerated: boolean;
}>> {
  // Walidacja parametrów
  this.validateParams(params);
  
  // Domyślne wartości
  const limit = params.limit || 10;
  const model = params.model || this.defaultModel;
  const difficultyLevel = params.difficultyLevel || "intermediate";
  const generationType = params.generationType || "vocabulary";
  
  // Przygotowanie promptów
  const { systemMessage, userMessage } = this.preparePrompts(params);
  
  // Przygotowanie schematu JSON dla odpowiedzi
  const responseFormat = this.prepareResponseFormat();
  
  try {
    // Wywołanie API OpenRouter
    const response = await this.callApi({
      model,
      systemMessage,
      userMessage,
      responseFormat,
      maxTokens: Math.min(4000, limit * 400), // Zależne od liczby fiszek
    });
    
    // Parsowanie i walidacja odpowiedzi
    const flashcards = this.parseResponse(response);
    
    // Zwrócenie wygenerowanych fiszek
    return flashcards.slice(0, limit).map(card => ({
      frontContent: card.front,
      backContent: card.back,
      isAiGenerated: true
    }));
  } catch (error) {
    this.handleError(error);
    throw error;
  }
}
```

### 3.2. `getAvailableModels`

Metoda do pobierania listy dostępnych modeli z OpenRouter.

```typescript
async getAvailableModels(): Promise<Array<{
  id: string;
  name: string;
  contextLength: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}>> {
  try {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new OpenRouterError(
        `Failed to fetch models: ${response.statusText}`,
        response.status
      );
    }
    
    const data = await response.json();
    
    return data.data.map(model => ({
      id: model.id,
      name: model.name,
      contextLength: model.context_length,
      pricing: {
        prompt: model.pricing.prompt,
        completion: model.pricing.completion
      }
    }));
  } catch (error) {
    this.handleError(error);
    throw error;
  }
}
```

## 4. Prywatne metody i pola

### 4.1. `validateParams`

```typescript
private validateParams(params: {
  sourceText: string;
  targetLanguage: string;
  difficultyLevel?: string;
  generationType?: string;
  limit?: number;
}): void {
  if (!params.sourceText || params.sourceText.trim() === "") {
    throw new OpenRouterError("Source text is required", 400);
  }
  
  if (params.sourceText.length > 15000) {
    throw new OpenRouterError("Source text is too long (max 15,000 characters)", 400);
  }
  
  if (!params.targetLanguage || params.targetLanguage.trim() === "") {
    throw new OpenRouterError("Target language is required", 400);
  }
  
  if (params.limit !== undefined) {
    if (params.limit < 1) {
      throw new OpenRouterError("Limit must be at least 1", 400);
    }
    
    if (params.limit > 30) {
      throw new OpenRouterError("Limit cannot exceed 30 flashcards", 400);
    }
  }
}
```

### 4.2. `preparePrompts`

```typescript
private preparePrompts(params: {
  sourceText: string;
  targetLanguage: string;
  difficultyLevel?: string;
  generationType?: string;
  limit?: number;
}): { systemMessage: string; userMessage: string } {
  const {
    sourceText,
    targetLanguage,
    difficultyLevel = "intermediate",
    generationType = "vocabulary",
    limit = 10
  } = params;
  
  const systemMessage = `Jesteś ekspertem w tworzeniu fiszek edukacyjnych dla osób uczących się języków obcych. 
Tworzysz wysokiej jakości, precyzyjne fiszki na podstawie dostarczonych tekstów.
Poziom trudności: ${difficultyLevel}.
Typ fiszek: ${generationType}.
Język docelowy: ${targetLanguage}.
Wygeneruj dokładnie ${limit} fiszek w odpowiedzi JSON.
Każda fiszka powinna mieć pole "front" (przód) i "back" (tył).
- Dla słownictwa (vocabulary): na przodzie umieść słowo w języku oryginalnym, na tyle tłumaczenie.
- Dla zwrotów (phrases): na przodzie umieść zwrot w języku oryginalnym, na tyle tłumaczenie.
- Dla definicji (definitions): na przodzie umieść słowo lub pojęcie, na tyle definicję.
Upewnij się, że przód i tył fiszki są związane z kontekstem tekstu źródłowego.`;
  
  const userMessage = `Proszę o stworzenie ${limit} fiszek na podstawie poniższego tekstu:

${sourceText}`;
  
  return { systemMessage, userMessage };
}
```

### 4.3. `prepareResponseFormat`

```typescript
private prepareResponseFormat() {
  return {
    type: "json_object",
    schema: {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: {
                type: "string",
                description: "Front side of the flashcard (question/word/term)"
              },
              back: {
                type: "string",
                description: "Back side of the flashcard (answer/translation/definition)"
              }
            },
            required: ["front", "back"]
          }
        }
      },
      required: ["flashcards"]
    }
  };
}
```

### 4.4. `callApi`

```typescript
private async callApi(options: {
  model: string;
  systemMessage: string;
  userMessage: string;
  responseFormat: any;
  maxTokens?: number;
  temperature?: number;
}): Promise<any> {
  const {
    model,
    systemMessage,
    userMessage,
    responseFormat,
    maxTokens = 4000,
    temperature = 0.7
  } = options;
  
  const payload = {
    model,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ],
    response_format: responseFormat,
    max_tokens: maxTokens,
    temperature,
  };
  
  const response = await fetch(`${this.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://10xcards.app",
      "X-Title": "10xCards"
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    throw new OpenRouterError(
      `API request failed: ${errorData.message || response.statusText}`,
      response.status,
      errorData
    );
  }
  
  return await response.json();
}
```

### 4.5. `parseResponse`

```typescript
private parseResponse(response: any): Array<{ front: string; back: string }> {
  try {
    if (!response.choices || 
        !response.choices[0] || 
        !response.choices[0].message || 
        !response.choices[0].message.content) {
      throw new Error("Invalid API response format");
    }
    
    const content = JSON.parse(response.choices[0].message.content);
    
    if (!content.flashcards || !Array.isArray(content.flashcards)) {
      throw new Error("Invalid flashcards format in response");
    }
    
    // Walidacja każdej fiszki
    return content.flashcards.filter(card => {
      // Sprawdzenie czy karta ma wymagane pola
      if (!card.front || !card.back) {
        return false;
      }
      
      // Sprawdzenie czy pola nie są puste
      if (card.front.trim() === "" || card.back.trim() === "") {
        return false;
      }
      
      // Sprawdzenie długości pól
      if (card.front.length > 500 || card.back.length > 1000) {
        card.front = card.front.substring(0, 500);
        card.back = card.back.substring(0, 1000);
      }
      
      return true;
    });
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new OpenRouterError(
      "Failed to parse API response",
      500,
      { originalError: error }
    );
  }
}
```

### 4.6. `handleError`

```typescript
private handleError(error: any): void {
  // Logowanie błędu do konsoli
  console.error("[OpenRouterService] Error:", error);
  
  // Jeśli błąd jest już typu OpenRouterError, po prostu go propaguj
  if (error instanceof OpenRouterError) {
    throw error;
  }
  
  // W przeciwnym razie, opakuj błąd w OpenRouterError
  if (error instanceof Error) {
    throw new OpenRouterError(
      error.message,
      500,
      { originalError: error }
    );
  }
  
  // Dla innych typów błędów
  throw new OpenRouterError(
    "Unknown error occurred",
    500,
    { originalError: error }
  );
}
```

## 5. Obsługa błędów

### 5.1. Klasa błędu OpenRouter

```typescript
export class OpenRouterError extends Error {
  status: number;
  details: any;
  
  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
    this.details = details;
    
    // Zachowanie stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenRouterError);
    }
  }
}
```

### 5.2. Kody błędów

| Kod statusu | Opis | Przyczyna | Rozwiązanie |
|-------------|------|-----------|-------------|
| 400 | Bad Request | Nieprawidłowe parametry żądania | Sprawdź poprawność parametrów |
| 401 | Unauthorized | Nieprawidłowy klucz API | Sprawdź klucz API |
| 402 | Payment Required | Brak środków na koncie | Doładuj konto OpenRouter |
| 403 | Forbidden | Brak uprawnień do zasobu | Sprawdź uprawnienia konta |
| 404 | Not Found | Zasób nie istnieje | Sprawdź URL i nazwę modelu |
| 429 | Too Many Requests | Przekroczono limit zapytań | Implementuj mechanizm ponownych prób z exponential backoff |
| 500 | Internal Server Error | Błąd serwera OpenRouter | Zaimplementuj ponowne próby dla błędów serwera |

### 5.3. Strategia obsługi błędów

1. **Walidacja parametrów wejściowych** przed wywołaniem API, aby uniknąć błędów 400
2. **Exponential backoff** dla błędów 429 i 500
3. **Przechowywanie logów błędów** w celu analizy i debugowania
4. **Przyjazne dla użytkownika komunikaty błędów** w interfejsie użytkownika
5. **Monitorowanie wskaźników błędów** w celu wykrycia problemów z usługą

## 6. Kwestie bezpieczeństwa

### 6.1. Bezpieczeństwo kluczy API

1. **Przechowywanie kluczy API**:
   - Używaj zmiennych środowiskowych do przechowywania kluczy API
   - Nie umieszczaj kluczy API w kodzie źródłowym lub w repozytoriach
   - Używaj różnych kluczy API dla środowisk deweloperskich i produkcyjnych

2. **Ochrona endpointów API**:
   - Wszystkie endpointy API powinny być zabezpieczone autentykacją użytkownika
   - Implementuj ograniczenia na liczbę zapytań na użytkownika (rate limiting)

### 6.2. Bezpieczeństwo danych

1. **Ochrona danych użytkownika**:
   - Nie przesyłaj danych osobowych użytkowników do OpenRouter
   - Filtruj wrażliwe informacje z tekstów źródłowych
   - Implementuj politykę prywatności zgodną z RODO/GDPR

2. **Walidacja wejść i wyjść**:
   - Zawsze waliduj dane wejściowe przed wysłaniem do API
   - Sprawdzaj integralność danych wyjściowych przed zapisaniem w bazie danych
   - Używaj sanityzacji danych, aby zapobiec atakom XSS i injection

### 6.3. Monitorowanie i audyt

1. **Monitorowanie użycia**:
   - Śledź liczbę zapytań do API per użytkownik
   - Monitoruj koszty używania API
   - Ustawiaj alerty przy nietypowych wzorcach użycia

2. **Audyt bezpieczeństwa**:
   - Regularnie przeprowadzaj audyty bezpieczeństwa kodu i API
   - Implementuj dzienniki audytu dla ważnych operacji
   - Sprawdzaj najnowsze zalecenia bezpieczeństwa dla API zewnętrznych

## 7. Plan wdrożenia krok po kroku

### Etap 1: Konfiguracja środowiska

1. **Dodaj zmienne środowiskowe**:
   ```bash
   # W pliku .env.local
   OPENROUTER_API_KEY=your_api_key_here
   ```

2. **Dodaj typy dla zmiennych środowiskowych**:
   ```typescript
   // src/env.d.ts
   interface ImportMetaEnv {
     // Istniejące zmienne
     readonly SUPABASE_URL: string;
     readonly SUPABASE_KEY: string;
     
     // Nowa zmienna
     readonly OPENROUTER_API_KEY: string;
   }
   ```

### Etap 2: Implementacja klasy serwisu

1. **Utwórz plik klasy błędu**:
   ```typescript
   // src/lib/errors/openrouter-error.ts
   export class OpenRouterError extends Error {
     // Implementacja z sekcji 5.1
   }
   ```

2. **Utwórz plik serwisu OpenRouter**:
   ```typescript
   // src/lib/services/openrouter.service.ts
   import { OpenRouterError } from "../errors/openrouter-error";
   
   export class OpenRouterService {
     // Implementacja z sekcji 2, 3 i 4
   }
   
   // Eksport instancji singletona
   export const openRouterService = new OpenRouterService();
   ```

### Etap 3: Implementacja schematów walidacji

1. **Stwórz schematy walidacji za pomocą Zod**:
   ```typescript
   // src/lib/validation/flashcard-schemas.ts
   import { z } from "zod";
   
   export const generateFlashcardsSchema = z.object({
     source_text: z.string().min(1, "Tekst źródłowy jest wymagany").max(15000, "Tekst źródłowy jest zbyt długi"),
     target_language: z.string().min(1, "Język docelowy jest wymagany"),
     difficulty_level: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
     generation_type: z.enum(["vocabulary", "phrases", "definitions"]).optional().default("vocabulary"),
     limit: z.number().int().min(1).max(30).optional().default(10),
     model: z.string().optional()
   });
   
   export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
   ```

### Etap 4: Implementacja endpointu API

1. **Utwórz endpoint API do generowania fiszek**:
   ```typescript
   // src/pages/api/flashcards/generate.ts
   import type { APIContext } from "astro";
   import { openRouterService } from "../../../lib/services/openrouter.service";
   import { generateFlashcardsSchema } from "../../../lib/validation/flashcard-schemas";
   import { OpenRouterError } from "../../../lib/errors/openrouter-error";
   
   export const prerender = false;
   
   export async function POST(context: APIContext) {
     try {
       // Sprawdź czy użytkownik jest zalogowany
       const { data: sessionData } = await context.locals.supabase.auth.getSession();
       if (!sessionData.session) {
         return new Response(
           JSON.stringify({ error: "Unauthorized access" }),
           { status: 401, headers: { "Content-Type": "application/json" } }
         );
       }
       
       // Pobierz i zwaliduj dane wejściowe
       const body = await context.request.json();
       const validationResult = generateFlashcardsSchema.safeParse(body);
       
       if (!validationResult.success) {
         return new Response(
           JSON.stringify({ 
             error: "Invalid input data", 
             details: validationResult.error.format() 
           }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }
       
       // Konwersja nazw parametrów z snake_case na camelCase
       const params = {
         sourceText: validationResult.data.source_text,
         targetLanguage: validationResult.data.target_language,
         difficultyLevel: validationResult.data.difficulty_level,
         generationType: validationResult.data.generation_type,
         limit: validationResult.data.limit,
         model: validationResult.data.model
       };
       
       // Wygeneruj fiszki
       const flashcards = await openRouterService.generateFlashcards(params);
       
       // Zwróć odpowiedź
       return new Response(
         JSON.stringify({ flashcards }),
         { status: 200, headers: { "Content-Type": "application/json" } }
       );
     } catch (error) {
       console.error("Error generating flashcards:", error);
       
       // Handle OpenRouterError
       if (error instanceof OpenRouterError) {
         return new Response(
           JSON.stringify({ 
             error: error.message,
             details: error.details 
           }),
           { status: error.status, headers: { "Content-Type": "application/json" } }
         );
       }
       
       // Handle other errors
       return new Response(
         JSON.stringify({ error: "Internal server error" }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   }
   ```

### Etap 5: Implementacja interfejsu użytkownika

1. **Utwórz komponent formularza generowania fiszek**:
   ```tsx
   // src/components/flashcards/GenerateFromTextForm.tsx
   import { useState } from "react";
   import { Button } from "@/components/ui/Button";
   import { Label } from "@/components/ui/Label";
   import { Textarea } from "@/components/ui/Textarea";
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
   import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
   import { useToast } from "@/components/ui/use-toast";
   import { Loader2 } from "lucide-react";
   
   export default function GenerateFromTextForm() {
     const [sourceText, setSourceText] = useState("");
     const [targetLanguage, setTargetLanguage] = useState("pl");
     const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
     const [generationType, setGenerationType] = useState("vocabulary");
     const [limit, setLimit] = useState(10);
     const [isGenerating, setIsGenerating] = useState(false);
     const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
     
     const { toast } = useToast();
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       
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
         const response = await fetch("/api/flashcards/generate", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             source_text: sourceText,
             target_language: targetLanguage,
             difficulty_level: difficultyLevel,
             generation_type: generationType,
             limit: Number(limit),
           }),
         });
         
         const data = await response.json();
         
         if (!response.ok) {
           throw new Error(data.error || "Failed to generate flashcards");
         }
         
         setGeneratedFlashcards(data.flashcards);
         
         toast({
           title: "Sukces",
           description: `Wygenerowano ${data.flashcards.length} fiszek.`,
         });
       } catch (error) {
         console.error("Error generating flashcards:", error);
         
         toast({
           title: "Błąd generowania",
           description: error.message || "Wystąpił problem podczas generowania fiszek.",
           variant: "destructive",
         });
       } finally {
         setIsGenerating(false);
       }
     };
     
     // Renderowanie komponentu...
   }
   ```

2. **Zintegruj komponent z istniejącą stroną**:
   ```astro
   <!-- src/pages/flashcards/create.astro -->
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

### Etap 6: Testowanie i debugowanie

1. **Utwórz testy jednostkowe dla serwisu**:
   ```typescript
   // tests/openrouter.service.test.ts
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import { OpenRouterService } from '../src/lib/services/openrouter.service';
   
   // Testy jednostkowe...
   ```

2. **Testowanie manualne**:
   - Przetestuj generowanie fiszek z różnymi parametrami
   - Sprawdź obsługę błędów poprzez symulowanie różnych warunków błędu
   - Zweryfikuj, czy logi błędów są odpowiednio rejestrowane

### Etap 7: Dokumentacja i wdrożenie

1. **Zaktualizuj dokumentację API**:
   - Dodaj dokumentację endpointu `/api/flashcards/generate`
   - Opisz wymagane parametry i format odpowiedzi
   - Udokumentuj obsługę błędów

2. **Wdrażanie**:
   - Uruchom testy przed wdrożeniem
   - Wdrażaj stopniowo, zaczynając od środowiska deweloperskiego
   - Monitoruj logi po wdrożeniu, aby wykryć potencjalne problemy 