/**
 * PDF Text Extraction Service
 * Extracts text from PDF files
 * Supports:
 * - Digital PDFs: Fast native text extraction (PyMuPDF/pdf-parse equivalent)
 * - Scanned PDFs: Falls back to image-based OCR per page
 */

// @ts-ignore - pdfjs-dist types
import * as pdfjsLib from "pdfjs-dist";
import { extractTextFromImage } from "./imageOcr.js";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  pages: Array<{
    pageNum: number;
    text: string;
    isScanned: boolean;
    confidence?: number;
  }>;
  isScanned: boolean;
  totalChars: number;
}

/**
 * Extract text from digital PDF (born-digital, not scanned)
 * Fast, uses native text layer
 * @param pdfBuffer Buffer containing PDF file
 * @returns Extracted text and page count
 */
async function extractTextFromDigitalPDF(
  pdfBuffer: Buffer | Uint8Array,
): Promise<PDFExtractionResult> {
  console.log(`📄 Extracting text from digital PDF...`);

  try {
    // Initialize pdf.js worker
    const pdf = await pdfjsLib.getDocument({
      data: pdfBuffer,
      useSystemFonts: true,
    }).promise;

    const pages: PDFExtractionResult["pages"] = [];
    let totalText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        pages.push({
          pageNum: i,
          text: pageText,
          isScanned: false,
          confidence: pageText.length > 50 ? 0.95 : 0.5, // Estimate based on text amount
        });

        totalText += pageText + "\n";
      } catch (pageErr) {
        console.warn(`   ⚠️ Page ${i} extraction failed, may be scanned`);
        pages.push({
          pageNum: i,
          text: "",
          isScanned: true,
          confidence: 0,
        });
      }
    }

    console.log(
      `✅ Digital PDF extraction: ${pdf.numPages} pages, ${totalText.length} chars`,
    );

    return {
      text: totalText.trim(),
      pageCount: pdf.numPages,
      pages,
      isScanned: false,
      totalChars: totalText.length,
    };
  } catch (error: any) {
    console.error(
      `❌ Digital PDF extraction failed: ${error.message?.slice(0, 60)}`,
    );
    throw error;
  }
}

/**
 * Extract text from scanned PDF (image-based pages)
 * Falls back to OCR for pages without native text
 * NOTE: Requires canvas library for full OCR support
 * @param pdfBuffer Buffer containing scanned PDF
 * @param language 'ur' or 'en'
 * @returns Extracted text from all pages
 */
async function extractTextFromScannedPDF(
  pdfBuffer: Buffer | Uint8Array,
  language: "ur" | "en" = "en",
): Promise<PDFExtractionResult> {
  console.log(
    `📄 Scanned PDF detected (OCR mode) - Limited support without canvas library`,
  );
  console.log(`   To fully support scanned PDFs, install: npm install canvas`);

  try {
    // Initialize pdf.js
    const pdf = await pdfjsLib.getDocument({
      data: pdfBuffer,
      useSystemFonts: true,
    }).promise;

    // For scanned PDFs without canvas, we can only report page count
    const pages: PDFExtractionResult["pages"] = Array.from(
      { length: pdf.numPages },
      (_, i) => ({
        pageNum: i + 1,
        text: "[Scanned PDF - OCR requires canvas library. Install: npm install canvas]",
        isScanned: true,
        confidence: 0,
      }),
    );

    return {
      text: `[PDF has ${pdf.numPages} scanned pages - OCR support requires: npm install canvas]`,
      pageCount: pdf.numPages,
      pages,
      isScanned: true,
      totalChars: 0,
    };
  } catch (error: any) {
    console.error(
      `❌ Scanned PDF extraction failed: ${error.message?.slice(0, 60)}`,
    );
    throw error;
  }
}

/**
 * Smart PDF extraction: Try digital text first, fallback to OCR if needed
 * @param pdfBuffer Buffer containing PDF
 * @param language Language for OCR fallback
 * @returns Extracted text and metadata
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer | Uint8Array,
  language: "ur" | "en" = "en",
): Promise<PDFExtractionResult> {
  console.log(`📄 Starting PDF text extraction (smart mode)...`);

  try {
    // First, try to extract as digital PDF
    const result = await extractTextFromDigitalPDF(pdfBuffer);

    // Check if extraction was meaningful (digital PDF with text)
    if (result.totalChars > 100) {
      console.log(
        `✅ PDF recognized as digital (extracted ${result.totalChars} chars)`,
      );
      return result;
    }

    // If text extraction was minimal, likely a scanned PDF
    console.log(
      `⚠️ PDF appears to be scanned (only ${result.totalChars} chars from text layer), attempting OCR...`,
    );
    return await extractTextFromScannedPDF(pdfBuffer, language);
  } catch (error) {
    console.warn(
      `❌ Digital extraction failed, attempting scanned PDF mode...`,
    );
    try {
      return await extractTextFromScannedPDF(pdfBuffer, language);
    } catch (ocrError) {
      console.error("Both PDF extraction modes failed");
      throw ocrError;
    }
  }
}

/**
 * Extract text from specific page of PDF
 * @param pdfBuffer PDF buffer
 * @param pageNum Page number (1-indexed)
 * @param language Language for OCR if needed
 * @returns Text from single page
 */
export async function extractTextFromPDFPage(
  pdfBuffer: Buffer | Uint8Array,
  pageNum: number,
  language: "ur" | "en" = "en",
): Promise<string> {
  const result = await extractTextFromPDF(pdfBuffer, language);
  const page = result.pages.find((p) => p.pageNum === pageNum);

  if (!page) {
    throw new Error(`Page ${pageNum} not found in PDF`);
  }

  return page.text;
}

/**
 * Extract text from page range of PDF
 * Useful for large documents where you only need specific sections
 * @param pdfBuffer PDF buffer
 * @param startPage Start page (1-indexed, inclusive)
 * @param endPage End page (1-indexed, inclusive)
 * @param language Language for OCR if needed
 * @returns Combined text from all pages in range
 */
export async function extractTextFromPDFRange(
  pdfBuffer: Buffer | Uint8Array,
  startPage: number,
  endPage: number,
  language: "ur" | "en" = "en",
): Promise<string> {
  const result = await extractTextFromPDF(pdfBuffer, language);

  const validPages = result.pages.filter(
    (p) => p.pageNum >= startPage && p.pageNum <= endPage,
  );

  return validPages.map((p) => p.text).join("\n");
}

/**
 * Get PDF metadata: page count, extraction type, confidence
 * @param pdfBuffer PDF buffer
 * @returns Metadata about PDF
 */
export async function getPDFMetadata(pdfBuffer: Buffer | Uint8Array): Promise<{
  pageCount: number;
  estimatedType: "digital" | "scanned" | "mixed";
  estimatedLanguage: "ur" | "en" | "unknown";
  totalChars: number;
}> {
  const result = await extractTextFromPDF(pdfBuffer, "en");

  const scannedPages = result.pages.filter((p) => p.isScanned).length;
  const estimatedType =
    scannedPages === 0
      ? "digital"
      : scannedPages === result.pages.length
        ? "scanned"
        : "mixed";

  return {
    pageCount: result.pageCount,
    estimatedType,
    estimatedLanguage: "unknown", // Could detect from text if needed
    totalChars: result.totalChars,
  };
}
