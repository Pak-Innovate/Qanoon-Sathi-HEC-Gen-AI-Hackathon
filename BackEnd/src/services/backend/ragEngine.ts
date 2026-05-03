import { searchSimilarChunks } from "./supabaseClient.js";
import { generateAnswer } from "./llmService.js";
import { getAllGeminiApiKeys } from "./utils.js";
import {
  cleanAndNormalizeQuery,
  type QuerySourceType,
} from "./inputProcessor.js";

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDING SYSTEM: Google Gemini gemini-embedding-001 (REST API - v1beta)
//
// WHY GEMINI:
//   - Reliable, production-grade embedding API with built-in retry logic
//   - 768-dimensional vectors (matches Supabase VECTOR(768) columns)
//   - Multiple API keys supported for redundancy and fallback
//   - Uses v1beta API with verified model availability
//
// IMPORTANT: All Supabase documents must be embedded with gemini-embedding-001
// for vector space consistency
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const EXPECTED_DIMS = 3072; // Updated: Gemini API returns 3072 dimensions
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Generates a 768-dim embedding using Google Gemini gemini-embedding-001 via v1beta REST API.
 * Tries multiple API keys with automatic fallback if one fails.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const allKeys = getAllGeminiApiKeys();

  if (allKeys.length === 0) {
    throw new Error(
      "No Gemini API keys found in .env — set GEMINI_API_KEY, GEMINI_API_KEY_2, or GEMINI_API_KEY_3",
    );
  }

  const truncated = text.slice(0, 5000);
  let lastError: Error | null = null;

  // Try each API key
  for (let keyIndex = 0; keyIndex < allKeys.length; keyIndex++) {
    const apiKey = allKeys[keyIndex];
    const keyLabel = keyIndex === 0 ? "Primary" : `Fallback ${keyIndex}`;

    console.log(`🔄 Embedding attempt with ${keyLabel} key...`);

    // Retry logic for each key
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const url = `${GEMINI_API_ENDPOINT}/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: {
              parts: [{ text: truncated }],
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg =
            errorData.error?.message || `HTTP ${response.status}`;

          console.log(`🔍 API Response Status: ${response.status}`);
          console.log(`🔍 Model Attempted: ${GEMINI_EMBEDDING_MODEL}`);
          console.log(`🔍 Error: ${errorMsg.slice(0, 100)}`);

          // Retry on transient errors
          if (
            attempt < MAX_RETRIES &&
            (response.status === 429 ||
              response.status === 503 ||
              errorMsg.includes("timeout"))
          ) {
            const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.warn(
              `⏳ Transient error (${keyLabel}), retrying in ${delayMs}ms... [${attempt}/${MAX_RETRIES}]`,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          throw new Error(errorMsg);
        }

        const data = await response.json();
        const embedding = data.embedding?.values;

        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error(
            `Invalid embedding response: ${JSON.stringify(data).slice(0, 100)}`,
          );
        }

        // Validate dimensions
        if (embedding.length !== EXPECTED_DIMS) {
          throw new Error(
            `Dimension mismatch: expected ${EXPECTED_DIMS}, got ${embedding.length}`,
          );
        }

        console.log(
          `✅ Embedding generated: ${embedding.length} dims (${keyLabel} key, attempt ${attempt})`,
        );
        return embedding;
      } catch (err: any) {
        lastError = err;
        const errorMsg = err.message || String(err);

        // Log retry attempts
        if (attempt < MAX_RETRIES && keyIndex === allKeys.length - 1) {
          const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(
            `⏳ Retrying final key in ${delayMs}ms... [${attempt}/${MAX_RETRIES}]`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else if (attempt === MAX_RETRIES && keyIndex < allKeys.length - 1) {
          console.warn(
            `⚠️ ${keyLabel} key exhausted retries, trying next key...`,
          );
          break; // Try next API key
        } else if (attempt === MAX_RETRIES) {
          console.error(
            `❌ All retries failed for ${keyLabel} key: ${errorMsg.slice(0, 100)}`,
          );
        }
      }
    }
  }

  throw lastError || new Error("Embedding generation failed for all API keys");
}

/**
 * Maps frontend category display names to Supabase category column values
 */
function normalizeCategory(category: string): string {
  const MAP: Record<string, string> = {
    "Islamic Law": "islamic_law",
    "islamic law": "islamic_law",
    islamic_law: "islamic_law",
    Harassment: "harassment",
    harassment: "harassment",
    Inheritance: "inheritance",
    inheritance: "inheritance",
    "Verify a law": "", // No filter — search all
    Verify: "",
    verify: "",
  };
  return MAP[category] ?? category ?? "";
}

/**
 * Main RAG query function.
 * Flow: embed query → search Supabase → generate answer from context
 * Now with source-aware processing for audio, images, and PDFs
 */
export async function performRagQuery(
  query: string,
  category: string = "",
  lang: string = "en",
  userId?: string,
  sourceType: QuerySourceType = "text",
) {
  console.log(
    `🔍 RAG query: "${query.substring(0, 60)}..." | cat: ${category} | lang: ${lang} | source: ${sourceType}`,
  );

  try {
    // ── 0. Clean and normalize query (source-aware) ──────────────────────────
    let cleanedQuery = query;
    try {
      cleanedQuery = await cleanAndNormalizeQuery(query, sourceType);
      console.log(
        `✅ Query cleaned: "${cleanedQuery.substring(0, 60)}..." (source: ${sourceType})`,
      );
    } catch (cleanErr) {
      console.warn(
        `⚠️ Query cleaning failed (${sourceType}), using raw query`,
        cleanErr,
      );
      cleanedQuery = query;
    }

    // ── 1. Embed the query ──────────────────────────────────────────────────
    let embedding: number[];
    try {
      embedding = await generateEmbedding(cleanedQuery);
    } catch (embedErr: any) {
      console.error("❌ Embedding failed:", embedErr.message);
      // Return graceful error — don't crash, let fallback LLM respond
      return {
        answer:
          lang === "ur"
            ? "معذرت، ایمبیڈنگ سروس وقتی طور پر دستیاب نہیں ہے۔ براہ کرم چند لمحوں بعد دوبارہ کوشش کریں۔"
            : `Embedding service temporarily unavailable: ${embedErr.message}. Please try again in a moment.`,
        sources: [],
        error: embedErr.message,
        llmUsed: "None",
        sourceType,
      };
    }

    // ── 2. Search Supabase vector DB ─────────────────────────────────────────
    const dbCategory = normalizeCategory(category);
    console.log(
      `🔎 Searching Supabase [category: "${dbCategory || "ALL"}"]...`,
    );
    const chunks = await searchSimilarChunks(embedding, 3, dbCategory);
    console.log(`   Found ${chunks.length} chunks`);

    // ── 3. Handle no results ─────────────────────────────────────────────────
    if (chunks.length === 0) {
      console.warn("⚠️ No relevant chunks found in Supabase");
      return {
        answer:
          lang === "ur"
            ? "آپ کے سوال سے متعلق معلومات ہمارے قانونی ڈیٹا بیس میں نہیں ملی۔ براہ کرم کسی مستند پاکستانی وکیل سے رجوع کریں۔"
            : "This specific information was not found in our legal database. Please consult a licensed Pakistani attorney (Vakeel) for specific legal advice.",
        sources: [],
        llmUsed: "None",
        sourceType,
      };
    }

    // ── 4. Build context from retrieved chunks ───────────────────────────────
    const context = chunks
      .map(
        (c: any) =>
          `[Source: ${c.source} | Section: ${c.section || "N/A"}]\n${c.content}`,
      )
      .join("\n\n" + "─".repeat(40) + "\n\n");

    // ── 5. Generate answer via LLM ───────────────────────────────────────────
    const generated = await generateAnswer(query, context, lang);

    const result = {
      ...generated,
      sources: chunks.map((c: any) => ({
        source: c.source,
        section: c.section || "",
      })),
      sourceType, // Include source type in result for frontend tracking
    };

    // ── 6. Save to history (non-blocking) ────────────────────────────────────
    if (userId) {
      import("./supabaseClient.js")
        .then(({ supabase }) =>
          supabase.from("search_history").insert({
            user_id: userId,
            query,
            answer: result.answer,
            category: dbCategory,
            lang,
            sources: result.sources,
            source_type: sourceType, // Track input source type
          }),
        )
        .catch((err) => console.warn("History save failed (non-fatal):", err));
    }

    return result;
  } catch (error: any) {
    console.error("🔴 RAG pipeline error:", error.message);
    return {
      answer:
        lang === "ur"
          ? "معذرت، سرور میں تکنیکی خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔"
          : "A technical error occurred. Please try again in a moment.",
      sources: [],
      error: error.message,
      llmUsed: "Fallback",
    };
  }
}
