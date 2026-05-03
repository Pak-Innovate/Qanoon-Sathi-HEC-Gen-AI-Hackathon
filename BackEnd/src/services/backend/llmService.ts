import { Groq } from "groq-sdk";
import { getGenAIClient, getGeminiApiKey, getAllGroqApiKeys } from "./utils.js";

const SYSTEM_PROMPT = `You are QaanoonSathi, an AI legal assistant specializing in Pakistani law.
Answer ONLY based on the provided context. If the context does not contain
the answer, say exactly: 'This information is not available in our legal database.
Please consult a licensed Pakistani attorney (Vakeel).'
Always cite the specific law name and section you used.
For Urdu queries, respond entirely in Urdu. For English queries, respond in English.
End every response with this disclaimer: [QaanoonSathi provides general legal
information only and is not a substitute for professional legal advice.]`;

/**
 * Generates an answer using the best available LLM.
 * PRIMARY: Groq (Llama 3.3-70B) - Fast, no quota limits
 * FALLBACK: Gemini Pro - If all Groq keys exhausted
 */
export async function generateAnswer(
  prompt: string,
  context: string,
  lang: string = "en",
) {
  const fullPrompt = `
Context:
${context}

User Query:
${prompt}

Answer in ${lang === "ur" ? "Urdu" : "English"}:
`;

  // 1. Try Groq (PRIMARY) with all available keys
  const groqKeys = getAllGroqApiKeys();
  let lastGroqError: Error | null = null;

  for (let keyIdx = 0; keyIdx < groqKeys.length; keyIdx++) {
    const groqKey = groqKeys[keyIdx];
    const keyLabel = keyIdx === 0 ? `Groq Primary` : `Groq Fallback ${keyIdx}`;

    try {
      console.log(`🔄 Generating answer with ${keyLabel}...`);
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fullPrompt },
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content;
      if (text) {
        console.log(
          `✅ Answer generated with ${keyLabel} (${groqKeys.length} keys available)`,
        );
        return {
          answer: text,
          llmUsed: "Groq (Llama 3.3-70B)",
        };
      }
    } catch (error: any) {
      lastGroqError = error;
      console.warn(`⚠️ ${keyLabel} failed: ${error.message?.slice(0, 60)}`);
      if (keyIdx < groqKeys.length - 1) {
        console.log(`   Trying next Groq key...`);
      }
    }
  }

  // 2. Try Gemini (FALLBACK)
  try {
    console.log("🔄 All Groq keys failed, attempting Gemini fallback...");
    const ai = getGenAIClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-pro",
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      const text = response.text;
      if (text) {
        console.log("✅ Answer generated with Gemini Pro");
        return {
          answer: text,
          llmUsed: "Gemini Pro",
        };
      }
    }
  } catch (error: any) {
    console.error(
      "❌ Gemini fallback failed:",
      error.message?.slice(0, 100) || error,
    );
  }

  // 3. Last resort
  console.error("❌ All LLM providers exhausted");
  return {
    answer:
      lang === "ur"
        ? "معذرت، اس وقت میں آپ کے سوال کا جواب دینے سے قاصر ہوں۔ براہ کرم بعد میں کوشش کریں۔"
        : "I'm sorry, I am currently unable to process your request. Please try again later.",
    llmUsed: "None (Fallback)",
  };
}
