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
 * Generates flashcards from text using OpenRouter.ai API
 *
 * @param sourceText - The text to generate flashcards from
 * @returns Array of generated flashcards
 * @throws Error if the API request fails
 */
export async function generateFlashcardsFromText(sourceText: string): Promise<GeneratedFlashcardDto[]> {
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
        "X-Title": "Flashcard Generator",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant that generates educational flashcards. Create concise, clear flashcards with a question on the front and answer on the back. Return them in JSON format.",
          },
          {
            role: "user",
            content: `Generate educational flashcards from the following text. Create between 5-10 flashcards depending on the content length and complexity. Each flashcard should have a front_content (question) and back_content (answer).
            
Text:
${sourceText}

Return only valid JSON in this format without markdown formatting:
[
  { "front_content": "Question 1?", "back_content": "Answer 1" },
  { "front_content": "Question 2?", "back_content": "Answer 2" }
]`,
          },
        ],
        max_tokens: 1500,
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
    let flashcardsData: { front_content: string; back_content: string }[];

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
    return flashcardsData.map((card) => ({
      temp_id: generateRandomId(),
      front_content: card.front_content,
      back_content: card.back_content,
    }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}
