import { GoogleGenAI } from "@google/genai";

/**
 * Gets all available Gemini API keys in priority order
 * Returns array of valid keys for fallback logic
 */
export function getAllGeminiApiKeys(): string[] {
  const keys: string[] = [];

  // Priority order: Primary + Fallbacks
  const keysToTry = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GOOGLE_API_KEY,
    process.env.Gemini_Key,
  ];

  const isPlaceholder = (k: string | undefined): boolean =>
    !k ||
    k === "MY_GEMINI_API_KEY" ||
    k === "YOUR_API_KEY" ||
    k === "YOUR_SECOND_GEMINI_KEY_HERE" ||
    k === "YOUR_THIRD_GEMINI_KEY_HERE" ||
    k.startsWith("REPLACE_ME");

  for (const key of keysToTry) {
    if (typeof key === "string" && !isPlaceholder(key)) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Gets all available Groq API keys in priority order
 * Returns array of valid keys for fallback logic
 */
export function getAllGroqApiKeys(): string[] {
  const keys: string[] = [];

  // Priority order: Primary + Fallbacks
  const keysToTry = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ];

  const isPlaceholder = (k: string | undefined): boolean =>
    !k || k.startsWith("gsk_REPLACE") || k.startsWith("YOUR_");

  for (const key of keysToTry) {
    if (typeof key === "string" && !isPlaceholder(key)) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Utility to get API key with fallback and logging (masked)
 * Now returns the primary key (use getAllGeminiApiKeys for all keys)
 */
export function getGeminiApiKey(): string {
  const keys = getAllGeminiApiKeys();
  if (keys.length === 0) {
    console.warn("⚠️ No valid GEMINI_API_KEY found in environment.");
    return "";
  }

  const key = keys[0];
  console.log(
    `✅ Using Gemini API Key (${keys.length} total available): ${key.substring(0, 6)}...${key.substring(key.length - 4)}`,
  );
  return key;
}

/**
 * Gets a GenAI client using the correct SDK
 * Allows specifying which API key to use (for fallback scenarios)
 */
export function getGenAIClient(apiKey?: string) {
  try {
    const key = apiKey || getGeminiApiKey();
    if (!key) {
      console.error("❌ Cannot initialize GenAI: No API Key found");
      return null;
    }

    // Validate key format (simple check)
    if (
      key === "MY_GEMINI_API_KEY" ||
      key === "YOUR_SECOND_GEMINI_KEY_HERE" ||
      key === "YOUR_THIRD_GEMINI_KEY_HERE"
    ) {
      console.error(
        "❌ Placeholder GEMINI_API_KEY detected. Please set a real key in .env file.",
      );
      return null;
    }

    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.error("❌ Failed to create GenAI client:", err);
    return null;
  }
}
