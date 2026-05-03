import { Groq } from "groq-sdk";
import { getGenAIClient, getAllGroqApiKeys } from "./utils.js";

export type QuerySourceType = "text" | "audio" | "image" | "pdf" | "unknown";

/**
 * Normalizes Roman Urdu and cleans the query for optimal RAG embedding
 * Now supports source-aware hints for better context understanding
 */
export async function cleanAndNormalizeQuery(
  query: string,
  sourceType: QuerySourceType = "text",
): Promise<string> {
  const groqKeys = getAllGroqApiKeys();

  // Build source-specific context hints
  let sourceHint = "";
  switch (sourceType) {
    case "audio":
      sourceHint =
        "This query was transcribed from speech. It may contain speech patterns or slightly informal language. Convert to proper legal terminology while preserving the intent.";
      break;
    case "image":
      sourceHint =
        "This query was extracted from a legal document image via OCR. Preserve legal terminology and formatting. Remove any OCR artifacts.";
      break;
    case "pdf":
      sourceHint =
        "This query was extracted from a PDF document. Preserve all legal terms and section references. Maintain document structure hints.";
      break;
    default:
      sourceHint = "";
  }

  for (const groqKey of groqKeys) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const systemPrompt = `Normalize this legal query for a Pakistani law database search.
Task:
1. If in Roman Urdu, convert to clear English/Urdu legal terms
2. Remove conversational filler and speech artifacts
3. Maintain the legal core and intent
4. Expand abbreviations commonly used in Pakistani law
5. Preserve legal terminology and section references

${sourceHint ? `Context: ${sourceHint}` : ""}`;

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Input: "${query}"\n\nOutput normalized query:`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 200,
        temperature: 0.3, // Lower temp for more consistent normalization
      });

      const cleaned = response.choices[0]?.message?.content?.trim() || query;
      console.log(
        `✅ Query normalized (source: ${sourceType}): ${query.slice(0, 50)}... → ${cleaned.slice(0, 50)}...`,
      );
      return cleaned;
    } catch (error) {
      console.warn(
        `⚠️ Groq cleaning failed (${sourceType}), trying next key...`,
      );
    }
  }

  console.warn(`⚠️ Query cleaning failed (${sourceType}), using raw query`);
  return query;
}

/**
 * Extracts text from an image or PDF for legal query processing
 */
export async function extractTextFromMedia(
  fileData: string,
  mimeType: string,
): Promise<string> {
  const ai = getGenAIClient();
  if (!ai) throw new Error("AI client not available");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro-vision-latest",
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        },
        "This is a legal document or a photo of a legal query. Extract the core legal question or relevant facts from this. If it's a document, summarize the main legal issue.",
      ],
    });

    return response.text.trim();
  } catch (error) {
    console.error("Media extraction failed:", error);
    throw new Error("Could not process the uploaded file.");
  }
}

/**
 * Simulates ASR/Whisper using Gemini (Gemini 1.5 Flash handles audio/video too)
 */
export async function processAudioInput(audioData: string): Promise<string> {
  // In a real scenario, we'd send the audio byte stream to Gemini
  // For this environment, we'll assume the frontend captures audio and sends base64
  return extractTextFromMedia(audioData, "audio/mp3");
}
