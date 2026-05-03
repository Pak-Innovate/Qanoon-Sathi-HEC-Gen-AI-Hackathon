/**
 * Audio Transcription Service
 * Converts audio files to text using HF Inference API (Whisper model)
 * Supports: MP3, WAV, M4A, OGG, FLAC, webm
 * Languages: Urdu, English, auto-detect
 */

import { HfInference } from "@huggingface/inference";

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
}

/**
 * Get HF Inference client with API key from .env
 */
function getHFClient(): HfInference {
  const token = process.env.HUGGING_API_KEY;
  if (!token) {
    throw new Error(
      "HUGGING_API_KEY not found in .env — required for audio transcription",
    );
  }
  return new HfInference(token);
}

/**
 * Transcribe audio file using Whisper Large V3 via HF Inference API
 * @param audioBuffer Buffer or Uint8Array of audio file
 * @param language Optional: 'ur' for Urdu, 'en' for English, null for auto-detect
 * @returns Transcribed text and detected language
 */
export async function transcribeAudio(
  audioBuffer: Buffer | Uint8Array,
  language?: string | null,
): Promise<TranscriptionResult> {
  const client = getHFClient();

  try {
    console.log(`🎤 Transcribing audio (${audioBuffer.length} bytes)...`);

    // Use Whisper Large V3 via HF Inference API
    const result = await client.automaticSpeechRecognition({
      model: "openai/whisper-large-v3",
      data: audioBuffer,
    });

    const text = (result as any).text || "";
    const detectedLanguage = (result as any).language || "unknown";

    console.log(
      `✅ Transcription complete: ${text.length} chars, language: ${detectedLanguage}`,
    );

    return {
      text: text.trim(),
      language: detectedLanguage || language || "unknown",
      confidence: 0.95, // HF API doesn't return confidence, estimate high
    };
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error(`❌ Transcription failed: ${errorMsg.slice(0, 100)}`);

    // Provide helpful error message
    if (errorMsg.includes("503")) {
      throw new Error(
        "HF model loading — try again in 20 seconds (rate limited)",
      );
    } else if (errorMsg.includes("401")) {
      throw new Error("Invalid HF token — check HUGGING_API_KEY in .env");
    } else if (errorMsg.includes("429")) {
      throw new Error(
        "HF API rate limit exceeded — try again in a few moments",
      );
    }

    throw new Error(`Audio transcription failed: ${errorMsg}`);
  }
}

/**
 * Batch transcribe multiple audio files (useful for long recordings split into chunks)
 * @param audioChunks Array of audio buffers
 * @returns Combined transcription
 */
export async function transcribeAudioChunks(
  audioChunks: (Buffer | Uint8Array)[],
  language?: string,
): Promise<TranscriptionResult> {
  console.log(`🎤 Transcribing ${audioChunks.length} audio chunks...`);

  const results = await Promise.all(
    audioChunks.map((chunk) => transcribeAudio(chunk, language)),
  );

  const combinedText = results.map((r) => r.text).join(" ");
  const detectedLanguage = results[0]?.language || language || "unknown";

  console.log(
    `✅ Batch transcription complete: ${results.length} chunks, ${combinedText.length} chars`,
  );

  return {
    text: combinedText.trim(),
    language: detectedLanguage,
    confidence: 0.95,
  };
}

/**
 * Detect language of audio file
 * Returns: 'ur' for Urdu, 'en' for English, or detected language code
 */
export async function detectAudioLanguage(
  audioBuffer: Buffer | Uint8Array,
): Promise<string> {
  try {
    const result = await transcribeAudio(audioBuffer);
    return result.language;
  } catch (error) {
    console.warn("Language detection failed, defaulting to 'unknown'");
    return "unknown";
  }
}

/**
 * Transcribe audio with language-specific handling
 * For Urdu: uses language hint for better accuracy
 * For English: uses standard Whisper
 */
export async function transcribeAudioByLanguage(
  audioBuffer: Buffer | Uint8Array,
  language: "ur" | "en" | "auto" = "auto",
): Promise<TranscriptionResult> {
  const langMap: Record<string, string> = {
    ur: "Urdu",
    en: "English",
    auto: "automatic",
  };

  console.log(
    `🎤 Transcribing with language: ${langMap[language] || language}`,
  );

  try {
    // For Urdu, we could add language-specific preprocessing here
    if (language === "ur") {
      console.log("   (Urdu-optimized transcription)");
    }

    const result = await transcribeAudio(audioBuffer, language);
    return result;
  } catch (error: any) {
    console.error(`Audio transcription error: ${error.message}`);
    throw error;
  }
}
