import type { GeneratedFlashcardDto } from "../../types";

// Interfejsy dla odpowiedzi z OpenRouter
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface GenerateFlashcardsRequest {
  sourceText: string;
  targetLanguage: string;
  generationType?: "vocabulary" | "phrases" | "definitions";
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  limit?: number;
}

/**
 * Detects the language of the provided text using AI
 *
 * @param text - The text to detect language for
 * @returns ISO language code of the detected language
 */
export async function detectLanguage(text: string): Promise<string> {
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not set. Using fallback language detection.");
    return guessLanguage(text);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://10xcards.com",
        "X-Title": "10xCards",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a language detection specialist. Respond only with the ISO language code.",
          },
          {
            role: "user",
            content: `Detect the language of this text and respond with only the ISO language code (e.g., "en", "pl", "es"):
            
            ${text.substring(0, 1000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const languageCode = data.choices[0].message.content.trim().toLowerCase();

    // Verify it's a valid language code
    if (/^[a-z]{2,3}(-[a-z]{2,3})?$/.test(languageCode)) {
      return languageCode.split("-")[0]; // Return just the primary language part
    } else {
      console.warn("Invalid language code detected, using fallback.");
      return guessLanguage(text);
    }
  } catch (error) {
    console.error("Error detecting language:", error);
    return guessLanguage(text);
  }
}

/**
 * Generates flashcards from the provided text using AI
 *
 * @param params - Parameters for flashcard generation
 * @returns Array of generated flashcards
 */
export async function generateFlashcardsWithAI(params: GenerateFlashcardsRequest): Promise<GeneratedFlashcardDto[]> {
  const { sourceText, targetLanguage, generationType, difficultyLevel, limit } = params;
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not set. Using fallback flashcard generation.");
    return generateSampleFlashcards(limit || 10);
  }

  const actualLimit = limit || 10;

  try {
    const prompt = `
Generate ${actualLimit} flashcards from the following text to help learn ${targetLanguage} language.
${generationType ? `Focus on ${generationType}.` : ""}
${difficultyLevel ? `Target difficulty level: ${difficultyLevel}.` : ""}

For each flashcard:
1. Extract an important term or phrase in the source language
2. Provide the translation in ${targetLanguage}
3. Include the context where it appears in the original text
4. Assess difficulty level (beginner, intermediate, advanced)

Output format must be valid JSON array:
[
  {
    "temp_id": "string identifier",
    "front_content": "term in source language",
    "back_content": "translation in target language",
    "context": "original context",
    "difficulty": "difficulty level"
  }
]

SOURCE TEXT:
${sourceText}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://10xcards.com",
        "X-Title": "10xCards",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: "You are a language learning flashcard generator. Output valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices[0].message.content.trim();

    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonContent = jsonMatch[1].trim();

    try {
      const parsedCards = JSON.parse(jsonContent) as GeneratedFlashcardDto[];

      // Validate and ensure the structure is correct
      return parsedCards.map((card, index) => ({
        temp_id: card.temp_id || `temp-${index + 1}`,
        front_content: card.front_content || "",
        back_content: card.back_content || "",
        context: card.context || "",
        difficulty: card.difficulty || "intermediate",
      }));
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return generateSampleFlashcards(actualLimit);
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return generateSampleFlashcards(actualLimit);
  }
}

// Fallback function to guess language
function guessLanguage(text: string): string {
  // Simple language detection based on character frequency
  const polishChars = "ąćęłńóśźż";
  const spanishChars = "áéíóúüñ";
  const germanChars = "äöüß";
  const frenchChars = "àâæçéèêëîïôœùûü";

  text = text.toLowerCase();

  // Count occurrences of special characters
  let polishCount = 0;
  let spanishCount = 0;
  let germanCount = 0;
  let frenchCount = 0;

  for (const char of text) {
    if (polishChars.includes(char)) polishCount++;
    if (spanishChars.includes(char)) spanishCount++;
    if (germanChars.includes(char)) germanCount++;
    if (frenchChars.includes(char)) frenchCount++;
  }

  const max = Math.max(polishCount, spanishCount, germanCount, frenchCount);

  if (max === 0) return "en"; // Default to English
  if (max === polishCount) return "pl";
  if (max === spanishCount) return "es";
  if (max === germanCount) return "de";
  if (max === frenchCount) return "fr";

  return "en";
}

// Fallback function for generating sample flashcards
function generateSampleFlashcards(count: number): GeneratedFlashcardDto[] {
  const sampleWords = [
    { source: "apple", target: "jabłko", context: "I like to eat an apple every day.", difficulty: "beginner" },
    { source: "book", target: "książka", context: "She reads a book before sleep.", difficulty: "beginner" },
    { source: "computer", target: "komputer", context: "I work on my computer.", difficulty: "beginner" },
    { source: "school", target: "szkoła", context: "Children go to school to learn.", difficulty: "beginner" },
    { source: "friend", target: "przyjaciel", context: "He is my best friend.", difficulty: "intermediate" },
    { source: "house", target: "dom", context: "We live in a big house.", difficulty: "beginner" },
    { source: "car", target: "samochód", context: "I drive to work by car.", difficulty: "beginner" },
    { source: "water", target: "woda", context: "Drink plenty of water every day.", difficulty: "beginner" },
    { source: "time", target: "czas", context: "Time flies when you're having fun.", difficulty: "intermediate" },
    { source: "music", target: "muzyka", context: "I listen to music when I work.", difficulty: "beginner" },
    { source: "dog", target: "pies", context: "I walk my dog every evening.", difficulty: "beginner" },
    { source: "sun", target: "słońce", context: "The sun is shining brightly today.", difficulty: "beginner" },
    {
      source: "environment",
      target: "środowisko",
      context: "We must protect our environment.",
      difficulty: "intermediate",
    },
    {
      source: "development",
      target: "rozwój",
      context: "Professional development is important.",
      difficulty: "advanced",
    },
    {
      source: "responsibility",
      target: "odpowiedzialność",
      context: "Taking responsibility for your actions.",
      difficulty: "advanced",
    },
  ];

  return sampleWords.slice(0, count).map((word, index) => ({
    temp_id: `temp-${index + 1}`,
    front_content: word.source,
    back_content: word.target,
    context: word.context,
    difficulty: word.difficulty,
  }));
}
