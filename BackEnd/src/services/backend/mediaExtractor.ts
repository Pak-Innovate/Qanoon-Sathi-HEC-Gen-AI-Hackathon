/**
 * Media Extractor Service - Main Orchestrator
 * Routes different media types to appropriate extraction handlers
 * Handles: Audio (speech-to-text), Images (OCR), PDFs (text extraction)
 *
 * Input flow:
 * - Audio file → transcribeAudio() → normalized text
 * - Image file → extractTextFromImage() → normalized text
 * - PDF file → extractTextFromPDF() → normalized text
 *
 * All extracted text is compatible with existing RAG pipeline
 */

import {
  transcribeAudio,
  detectAudioLanguage,
  type TranscriptionResult,
} from "./audioTranscriber.js";
import {
  extractTextFromImage,
  extractTextFromImages,
  type OCRResult,
} from "./imageOcr.js";
import {
  extractTextFromPDF,
  extractTextFromPDFPage,
  type PDFExtractionResult,
} from "./pdfProcessor.js";

/**
 * Supported media types
 */
export type MediaType = "audio" | "image" | "pdf";

/**
 * Result from media extraction
 */
export interface MediaExtractionResult {
  text: string; // Normalized extracted text
  mediaType: MediaType;
  language: string; // 'ur' or 'en' or 'unknown'
  confidence: number; // 0-1, reliability of extraction
  method: string; // 'whisper', 'tesseract', 'hf-api', 'pdfjs', etc
  metadata?: {
    pages?: number;
    isScanned?: boolean;
    duration?: number; // For audio, in seconds
  };
  error?: string;
}

/**
 * Detect media type from MIME type
 */
function detectMediaType(mimeType: string): MediaType | null {
  if (
    mimeType.startsWith("audio/") ||
    mimeType.includes("wav") ||
    mimeType.includes("mp3") ||
    mimeType.includes("ogg")
  ) {
    return "audio";
  } else if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.includes("pdf") || mimeType === "application/pdf") {
    return "pdf";
  }
  return null;
}

/**
 * Extract text from media file (audio, image, or PDF)
 * Main entry point - routes to appropriate handler based on media type
 *
 * @param fileBuffer Buffer containing the media file
 * @param mimeType MIME type of the file (e.g., 'audio/mp3', 'image/jpeg', 'application/pdf')
 * @param language Optional: 'ur' for Urdu, 'en' for English, auto-detect if not specified
 * @returns Extracted text and metadata
 */
export async function extractTextFromMedia(
  fileBuffer: Buffer | Uint8Array,
  mimeType: string,
  language?: string,
): Promise<MediaExtractionResult> {
  const mediaType = detectMediaType(mimeType);

  if (!mediaType) {
    return {
      text: "",
      mediaType: "audio",
      language: "unknown",
      confidence: 0,
      method: "none",
      error: `Unsupported media type: ${mimeType}. Supported: audio/*, image/*, application/pdf`,
    };
  }

  console.log(
    `📥 Extracting media: type=${mediaType}, size=${fileBuffer.length} bytes, lang=${language || "auto"}`,
  );

  try {
    switch (mediaType) {
      case "audio":
        return await extractFromAudio(fileBuffer, language);
      case "image":
        return await extractFromImage(fileBuffer, language);
      case "pdf":
        return await extractFromPDF(fileBuffer, language);
      default:
        return {
          text: "",
          mediaType: "audio",
          language: "unknown",
          confidence: 0,
          method: "none",
          error: `Unknown media type: ${mediaType}`,
        };
    }
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error(`❌ Media extraction failed: ${errorMsg}`);

    return {
      text: "",
      mediaType: mediaType || "audio",
      language: "unknown",
      confidence: 0,
      method: "error",
      error: errorMsg,
    };
  }
}

/**
 * Extract text from audio file
 * Uses HF Inference API for Whisper speech-to-text
 */
async function extractFromAudio(
  audioBuffer: Buffer | Uint8Array,
  language?: string,
): Promise<MediaExtractionResult> {
  console.log(`🎤 Processing audio file...`);

  try {
    let detectedLang = language;

    // Auto-detect language if not specified
    if (!language || language === "auto") {
      console.log("   Detecting audio language...");
      detectedLang = await detectAudioLanguage(audioBuffer);
      console.log(`   Language detected: ${detectedLang}`);
    }

    // Transcribe audio
    const result = await transcribeAudio(audioBuffer, detectedLang);

    if (!result.text || result.text.length === 0) {
      return {
        text: "",
        mediaType: "audio",
        language: detectedLang || "unknown",
        confidence: 0,
        method: "whisper",
        error: "Audio transcription returned empty result",
      };
    }

    console.log(
      `✅ Audio extraction complete: ${result.text.length} chars, language: ${result.language}`,
    );

    return {
      text: result.text,
      mediaType: "audio",
      language: result.language || detectedLang || "unknown",
      confidence: result.confidence || 0.9,
      method: "whisper",
      metadata: {
        duration: audioBuffer.length / 44100 / 2, // Rough estimate (16-bit audio assumption)
      },
    };
  } catch (error: any) {
    return {
      text: "",
      mediaType: "audio",
      language: language || "unknown",
      confidence: 0,
      method: "whisper",
      error: error.message || String(error),
    };
  }
}

/**
 * Extract text from image file
 * Uses HF API first (document understanding), falls back to Tesseract.js OCR
 */
async function extractFromImage(
  imageBuffer: Buffer | Uint8Array,
  language?: string,
): Promise<MediaExtractionResult> {
  console.log(`📸 Processing image file...`);

  try {
    const lang = (language === "ur" ? "ur" : "en") as "ur" | "en";

    // Extract text from image
    const result = await extractTextFromImage(imageBuffer, lang);

    if (!result.text || result.text.length === 0) {
      return {
        text: "",
        mediaType: "image",
        language: lang,
        confidence: 0,
        method: result.method,
        error: "Image text extraction returned empty result",
      };
    }

    console.log(
      `✅ Image extraction complete: ${result.text.length} chars, method: ${result.method}, confidence: ${result.confidence.toFixed(2)}`,
    );

    return {
      text: result.text,
      mediaType: "image",
      language: lang,
      confidence: result.confidence,
      method:
        result.method === "hf-api" ? "donut-document-qa" : "tesseract-ocr",
      metadata: {
        isScanned: result.method === "tesseract", // Tesseract typically used for scans
      },
    };
  } catch (error: any) {
    return {
      text: "",
      mediaType: "image",
      language: language || "en",
      confidence: 0,
      method: "ocr",
      error: error.message || String(error),
    };
  }
}

/**
 * Extract text from PDF file
 * Handles both digital PDFs (native text extraction) and scanned PDFs (OCR fallback)
 */
async function extractFromPDF(
  pdfBuffer: Buffer | Uint8Array,
  language?: string,
): Promise<MediaExtractionResult> {
  console.log(`📄 Processing PDF file...`);

  try {
    const lang = (language === "ur" ? "ur" : "en") as "ur" | "en";

    // Extract text from PDF
    const result = await extractTextFromPDF(pdfBuffer, lang);

    if (!result.text || result.text.length === 0) {
      return {
        text: "",
        mediaType: "pdf",
        language: lang,
        confidence: 0,
        method: result.isScanned ? "ocr" : "pdfjs",
        metadata: {
          pages: result.pageCount,
          isScanned: result.isScanned,
        },
        error: "PDF text extraction returned empty result",
      };
    }

    console.log(
      `✅ PDF extraction complete: ${result.totalChars} chars, ${result.pageCount} pages, type: ${result.isScanned ? "scanned" : "digital"}`,
    );

    return {
      text: result.text,
      mediaType: "pdf",
      language: lang,
      confidence: result.isScanned ? 0.75 : 0.95, // Digital PDFs more reliable
      method: result.isScanned ? "ocr" : "pdfjs",
      metadata: {
        pages: result.pageCount,
        isScanned: result.isScanned,
      },
    };
  } catch (error: any) {
    return {
      text: "",
      mediaType: "pdf",
      language: language || "en",
      confidence: 0,
      method: "pdf",
      error: error.message || String(error),
    };
  }
}

/**
 * Batch extract text from multiple media files
 * Useful for processing multiple uploads or pages
 *
 * @param fileBuffers Array of file buffers
 * @param mimeTypes Array of MIME types (same length as fileBuffers)
 * @param language Language preference
 * @returns Array of extraction results
 */
export async function extractTextFromMultipleMedia(
  fileBuffers: (Buffer | Uint8Array)[],
  mimeTypes: string[],
  language?: string,
): Promise<MediaExtractionResult[]> {
  if (fileBuffers.length !== mimeTypes.length) {
    throw new Error("File buffers and MIME types arrays must have same length");
  }

  console.log(`📥 Batch processing ${fileBuffers.length} media files...`);

  return Promise.all(
    fileBuffers.map((buffer, idx) =>
      extractTextFromMedia(buffer, mimeTypes[idx], language),
    ),
  );
}

/**
 * Normalize extracted text for RAG query
 * Remove excessive whitespace, fix encoding issues, prepare for embedding
 *
 * @param extractedText Raw text from media extraction
 * @param mediaType Type of media for context-specific normalization
 * @returns Normalized text ready for RAG pipeline
 */
export function normalizeExtractedText(
  extractedText: string,
  mediaType: MediaType = "audio",
): string {
  if (!extractedText) return "";

  let text = extractedText;

  // Remove multiple spaces, tabs, newlines (normalize whitespace)
  text = text.replace(/\s+/g, " ");

  // Remove control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Fix common OCR errors (image-specific)
  if (mediaType === "image") {
    text = text.replace(/\|/g, "l"); // OCR pipes to L
    text = text.replace(/O([0-9])/g, "$1"); // OCR O followed by digit
  }

  // Trim whitespace
  text = text.trim();

  return text;
}

/**
 * Validate extraction result before passing to RAG
 * Checks for minimum quality thresholds
 *
 * @param result Extraction result to validate
 * @returns True if result is valid for RAG processing
 */
export function validateExtractionResult(result: MediaExtractionResult): {
  isValid: boolean;
  message: string;
} {
  // Check for errors
  if (result.error) {
    return {
      isValid: false,
      message: `Extraction error: ${result.error}`,
    };
  }

  // Check if we got any text
  if (!result.text || result.text.length === 0) {
    return {
      isValid: false,
      message: "No text extracted from media",
    };
  }

  // For audio, check minimum length (speech should be at least 3-5 words)
  if (result.mediaType === "audio" && result.text.length < 20) {
    return {
      isValid: false,
      message: `Audio too short: ${result.text.length} chars (minimum 20)`,
    };
  }

  // For images, warn if confidence is low but still accept
  if (result.mediaType === "image" && result.confidence < 0.6) {
    return {
      isValid: true,
      message: `⚠️ Low confidence OCR: ${result.confidence.toFixed(2)}. Manual review recommended.`,
    };
  }

  return {
    isValid: true,
    message: "Extraction valid",
  };
}
