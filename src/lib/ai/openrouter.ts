import type { GeneratedFlashcardDto } from "../../types";
import { generateRandomId } from "../utils";

/**
 * Interface for OpenRouter.ai API response
 */
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Interface for language detection from OpenRouter.ai API
 */
interface LanguageDetectionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Interface for flashcard generation parameters
 */
interface FlashcardGenerationParams {
  sourceText: string;
  targetLanguage: string;
  generationType?: "vocabulary" | "phrases" | "definitions";
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  limit?: number;
}

/**
 * Detects the language of a text using OpenRouter.ai API
 *
 * @param text - The text to detect language for
 * @returns Detected language code (ISO 639-1)
 * @throws Error if the API request fails
 */
async function detectLanguage(text: string): Promise<string> {
  try {
    const API_KEY = import.meta.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": import.meta.env.PUBLIC_WEBSITE_URL || "http://localhost:4321",
        "X-Title": "Language Detector",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a language detection AI. Identify the language of the given text and return only the ISO 639-1 language code (2 letters).",
          },
          {
            role: "user",
            content: `Identify the language of this text and respond with only the ISO 639-1 code (2 letters):
            
${text.substring(0, 500)}`, // Use just the first 500 chars for detection
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as LanguageDetectionResponse;

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenRouter API for language detection");
    }

    // Extract the language code
    const languageCode = data.choices[0].message.content.trim().toLowerCase();

    // Basic validation of language code
    if (!/^[a-z]{2,3}(-[a-z]{2,3})?$/.test(languageCode)) {
      throw new Error("Invalid language code format returned from detection");
    }

    return languageCode;
  } catch (error) {
    console.error("Error detecting language:", error);
    // Default to English if detection fails
    return "en";
  }
}

/**
 * Generates flashcards from text using OpenRouter.ai API
 *
 * @param params - Parameters for flashcard generation
 * @returns Object containing detected language and array of generated flashcards
 * @throws Error if the API request fails
 */
export async function generateFlashcardsFromText(
  params: FlashcardGenerationParams
): Promise<{ detectedLanguage: string; flashcards: GeneratedFlashcardDto[] }> {
  try {
    const {
      sourceText,
      targetLanguage,
      generationType = "vocabulary",
      difficultyLevel = "intermediate",
      limit = 10,
    } = params;

    // Detect the source language
    const detectedLanguage = await detectLanguage(sourceText);

    const API_KEY = import.meta.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Construct the prompt based on parameters
    const systemPrompt = "You are a helpful AI assistant that generates educational flashcards.";
    let userPrompt = `Generate educational flashcards from the following text. The source text is in ${detectedLanguage} language.`;

    // Adjust prompt based on generation type
    if (generationType === "vocabulary") {
      userPrompt += ` Extract key vocabulary terms and translate them to ${targetLanguage}.`;
    } else if (generationType === "phrases") {
      userPrompt += ` Extract useful phrases and translate them to ${targetLanguage}.`;
    } else if (generationType === "definitions") {
      if (detectedLanguage === targetLanguage) {
        userPrompt += ` Create definition cards where the term is on the front and its definition is on the back. Both should be in ${targetLanguage}.`;
      } else {
        userPrompt += ` Extract key terms and provide their definitions in ${targetLanguage}.`;
      }
    }

    // Adjust based on difficulty level
    userPrompt += ` Focus on ${difficultyLevel} level content.`;

    // Add limit information
    userPrompt += ` Create ${limit} flashcards.`;

    // Complete the instruction
    userPrompt += ` Each flashcard should have a front_content (in ${detectedLanguage}), back_content (in ${targetLanguage}), context (where it appears in text), and difficulty.
            
Text:
${sourceText}

Return only valid JSON in this format without markdown formatting:
[
  { 
    "front_content": "Term or question in ${detectedLanguage}", 
    "back_content": "Translation or answer in ${targetLanguage}",
    "context": "Sentence or phrase where this appears in the text",
    "difficulty": "easy/medium/hard"
  }
]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": import.meta.env.PUBLIC_WEBSITE_URL || "http://localhost:4321",
        "X-Title": "Flashcard Generator",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterResponse;

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenRouter API");
    }

    // Parse the JSON string from the response content
    let flashcardsData: {
      front_content: string;
      back_content: string;
      context?: string;
      difficulty?: string;
    }[];

    try {
      const jsonContent = data.choices[0].message.content.trim();
      flashcardsData = JSON.parse(jsonContent);
    } catch {
      throw new Error("Failed to parse flashcards from API response");
    }

    // Validate and transform the flashcards
    if (!Array.isArray(flashcardsData)) {
      throw new Error("API response did not return an array of flashcards");
    }

    // Add temp_id to each flashcard
    const flashcards = flashcardsData.map((card) => ({
      temp_id: generateRandomId(),
      front_content: card.front_content,
      back_content: card.back_content,
      context: card.context || undefined,
      difficulty: card.difficulty || undefined,
    }));

    return {
      detectedLanguage,
      flashcards,
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}
