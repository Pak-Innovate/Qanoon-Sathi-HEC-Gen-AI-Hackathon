#!/usr/bin/env python3
"""
QaanoonSathi: Legal Document Ingestion Pipeline
═══════════════════════════════════════════════════════════════════════════════
Ingest PDFs from law_data folder → Generate Gemini embeddings → Store in Supabase

Configuration:
- Model: gemini-embedding-001 (3072 dimensions)
- API: Google Generative AI (v1beta)
- Database: Supabase (law_documents table)
- Fallback: Multi-API key support with exponential backoff
═══════════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import time
import logging
import json
from pathlib import Path
from typing import List, Optional, Dict, Tuple
import requests
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

# Auto-install dependencies
for pkg_name, import_name in [("supabase", "supabase")]:
    try:
        __import__(import_name)
    except ImportError:
        print(f"⏳ Installing {pkg_name}...")
        os.system(f"pip install {pkg_name}")

from supabase import create_client

# ═════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═════════════════════════════════════════════════════════════════════════════

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Gemini Configuration (Must match backend)
GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
EXPECTED_DIMS = 3072  # CRITICAL: Gemini API returns 3072-dimensional embeddings

# Ingestion Parameters
LAW_DATA_DIR = Path("./law_data")
CHUNK_SIZE = 500  # Characters per chunk
BATCH_SIZE = 10    # Documents per insert
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1  # Seconds
MAX_WORKERS = 5    # Concurrent embedding requests (increase for faster ingestion, decrease if rate-limited)

# ═════════════════════════════════════════════════════════════════════════════
# API KEY MANAGEMENT
# ═════════════════════════════════════════════════════════════════════════════

def get_all_api_keys() -> List[str]:
    """Get all available Gemini API keys in priority order."""
    keys = []
    for key_var in ["GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"]:
        key = os.getenv(key_var, "").strip()
        if key and not key.startswith("YOUR_"):
            keys.append(key)
    return keys


# ═════════════════════════════════════════════════════════════════════════════
# EMBEDDING GENERATION
# ═════════════════════════════════════════════════════════════════════════════

def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate 3072-dim embedding using gemini-embedding-001 via REST API.
    Tries multiple API keys with automatic fallback.
    
    Args:
        text: Text to embed (will be truncated to 5000 chars)
    
    Returns:
        List of 3072 floats, or None if all attempts fail
    """
    all_keys = get_all_api_keys()
    if not all_keys:
        logger.error("❌ No Gemini API keys found in .env")
        return None
    
    truncated = text[:5000]
    last_error = None
    
    for key_idx, api_key in enumerate(all_keys):
        key_label = "Primary" if key_idx == 0 else f"Fallback {key_idx}"
        
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                url = f"{GEMINI_API_ENDPOINT}/{GEMINI_EMBEDDING_MODEL}:embedContent?key={api_key}"
                
                response = requests.post(
                    url,
                    json={"content": {"parts": [{"text": truncated}]}},
                    timeout=30
                )
                
                if not response.ok:
                    error_msg = response.json().get("error", {}).get("message", f"HTTP {response.status_code}")
                    
                    if response.status_code in [429, 503] and attempt < MAX_RETRIES:
                        delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))
                        logger.debug(f"  ⏳ {key_label} transient error, retrying in {delay}s...")
                        time.sleep(delay)
                        continue
                    
                    raise Exception(error_msg)
                
                data = response.json()
                embedding = data.get("embedding", {}).get("values", [])
                
                if not embedding or len(embedding) != EXPECTED_DIMS:
                    raise Exception(f"Invalid embedding: dimension {len(embedding)} != {EXPECTED_DIMS}")
                
                logger.debug(f"  ✅ Embedding generated ({key_label})")
                return embedding
                
            except Exception as e:
                last_error = e
                if attempt == MAX_RETRIES and key_idx < len(all_keys) - 1:
                    logger.debug(f"  ⚠️  {key_label} failed, trying next key...")
                    break
                elif attempt == MAX_RETRIES:
                    logger.error(f"  ❌ {key_label} failed: {str(e)[:80]}")
    
    logger.error(f"❌ Embedding failed for all keys: {str(last_error)[:100]}")
    return None


# ═════════════════════════════════════════════════════════════════════════════
# JSON PROCESSING
# ═════════════════════════════════════════════════════════════════════════════

def load_law_chunks_json() -> Optional[List[Dict]]:
    """Load law chunks from law_chunks.json."""
    json_path = LAW_DATA_DIR / "law_chunks.json"
    try:
        if not json_path.exists():
            logger.warning(f"  ⚠️  law_chunks.json not found at {json_path}")
            return None
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract chunks from the JSON structure
        chunks = data.get("chunks", [])
        if not chunks:
            logger.warning("  ⚠️  No chunks found in law_chunks.json")
            return None
        
        logger.info(f"  ✅ Loaded {len(chunks)} chunks from law_chunks.json")
        return chunks
        
    except Exception as e:
        logger.error(f"  ❌ Failed to load law_chunks.json: {str(e)}")
        return None


def load_law_questions_json() -> Optional[List[Dict]]:
    """Load Q&A pairs from law_questions.json."""
    json_path = LAW_DATA_DIR / "law_questions.json"
    try:
        if not json_path.exists():
            logger.warning(f"  ⚠️  law_questions.json not found at {json_path}")
            return None
        
        with open(json_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        if not questions:
            logger.warning("  ⚠️  No questions found in law_questions.json")
            return None
        
        logger.info(f"  ✅ Loaded {len(questions)} Q&A pairs from law_questions.json")
        return questions
        
    except Exception as e:
        logger.error(f"  ❌ Failed to load law_questions.json: {str(e)}")
        return None


# ═════════════════════════════════════════════════════════════════════════════
# PDF PROCESSING (DEPRECATED - KEPT FOR REFERENCE)
# ═════════════════════════════════════════════════════════════════════════════

# def extract_text_from_pdf(pdf_path: Path) -> Optional[str]:
#     """Extract text from PDF file. [DEPRECATED - Use JSON instead]"""
#     pass



def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Split text into chunks at sentence boundaries."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    current_chunk = ""
    
    # Split by common sentence endings
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += " " + sentence
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks if chunks else [text]


def detect_category(filename: str) -> str:
    """Infer document category from filename."""
    filename_lower = filename.lower()
    
    if any(w in filename_lower for w in ['islamic', 'sharia', 'quran']):
        return 'islamic_law'
    elif any(w in filename_lower for w in ['inherit', 'succession', 'waris']):
        return 'inheritance'
    elif any(w in filename_lower for w in ['harass', 'abuse', 'violence']):
        return 'harassment'
    elif any(w in filename_lower for w in ['penal', 'criminal']):
        return 'criminal_law'
    else:
        return 'general'


# ═════════════════════════════════════════════════════════════════════════════
# SUPABASE OPERATIONS
# ═════════════════════════════════════════════════════════════════════════════

def init_supabase():
    """Initialize Supabase client."""
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    
    if not url or not key:
        logger.error("❌ SUPABASE_URL or SUPABASE_SERVICE_KEY missing")
        return None
    
    try:
        return create_client(url, key)
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")
        return None


def insert_documents(supabase, documents: List[Dict]) -> Tuple[int, int]:
    """
    Insert documents into law_documents table.
    Returns (successful_count, failed_count)
    """
    if not documents:
        return 0, 0
    
    successful = 0
    failed = 0
    
    try:
        response = supabase.table("law_documents").insert(documents).execute()
        successful = len(documents)
        logger.info(f"  ✅ Inserted {successful} documents")
        return successful, 0
        
    except Exception as e:
        logger.error(f"  ❌ Insert failed: {str(e)[:100]}")
        return 0, len(documents)


# ═════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═════════════════════════════════════════════════════════════════════════════

def main():
    """Main ingestion pipeline - Process JSON law data."""
    logger.info("\n" + "═" * 80)
    logger.info("🚀 QaanoonSathi Legal Document Ingestion (JSON Mode)")
    logger.info("═" * 80)
    
    # Validate directory
    if not LAW_DATA_DIR.exists():
        logger.error(f"❌ Directory not found: {LAW_DATA_DIR}")
        return
    
    logger.info(f"📂 Processing law_data directory: {LAW_DATA_DIR}")
    logger.info(f"🔧 Model: {GEMINI_EMBEDDING_MODEL} ({EXPECTED_DIMS} dims)")
    logger.info(f"📊 Batch size: {BATCH_SIZE} documents")
    logger.info("-" * 80)
    
    # Initialize Supabase
    supabase = init_supabase()
    if not supabase:
        return
    
    # Statistics
    total_successful = 0
    total_failed = 0
    
    # ─────────────────────────────────────────────────────────────────
    # PROCESS LAW CHUNKS
    # ─────────────────────────────────────────────────────────────────
    logger.info("\n📄 PROCESSING: law_chunks.json")
    logger.info("-" * 80)
    
    chunks = load_law_chunks_json()
    if chunks:
        documents = []
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Submit all embedding tasks
            future_to_chunk = {
                executor.submit(generate_embedding, chunk.get("text", "")): chunk
                for chunk in chunks if chunk.get("text")
            }
            
            # Collect results as they complete
            for idx, future in enumerate(as_completed(future_to_chunk), 1):
                chunk = future_to_chunk[future]
                try:
                    embedding = future.result()
                    if embedding:
                        documents.append({
                            "content": chunk.get("text", "")[:3000],  # Truncate for safety
                            "embedding": embedding,
                            "category": detect_category(chunk.get("law_name", "general")),
                            "source": chunk.get("law_name", chunk.get("source", "unknown")),
                            "section": f"Chunk {chunk.get('chunk_index', 0) + 1}",
                            "lang": "mixed",
                        })
                        
                        # Insert in batches
                        if len(documents) >= BATCH_SIZE:
                            successful, failed = insert_documents(supabase, documents)
                            total_successful += successful
                            total_failed += failed
                            documents = []
                            logger.debug(f"  ✓ Processed {idx}/{len(chunks)} chunks")
                    else:
                        logger.debug(f"    ⚠️  Skipping chunk {idx}")
                except Exception as e:
                    logger.warning(f"    ⚠️  Chunk {idx} failed: {str(e)[:50]}")
                    total_failed += 1
        
        # Insert remaining documents
        if documents:
            successful, failed = insert_documents(supabase, documents)
            total_successful += successful
            total_failed += failed
        
        logger.info(f"✅ law_chunks.json processed")
    
    # ─────────────────────────────────────────────────────────────────
    # PROCESS Q&A PAIRS (OPTIONAL)
    # ─────────────────────────────────────────────────────────────────
    logger.info("\n❓ PROCESSING: law_questions.json (Q&A pairs)")
    logger.info("-" * 80)
    
    questions = load_law_questions_json()
    if questions:
        documents = []
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Combine question + answer for better semantic embedding
            future_to_qa = {
                executor.submit(
                    generate_embedding, 
                    f"{qa.get('question', '')} {qa.get('answer', '')}"
                ): qa
                for qa in questions if qa.get('question') and qa.get('answer')
            }
            
            # Collect results as they complete
            for idx, future in enumerate(as_completed(future_to_qa), 1):
                qa = future_to_qa[future]
                try:
                    embedding = future.result()
                    if embedding:
                        documents.append({
                            "content": f"Q: {qa.get('question', '')}\nA: {qa.get('answer', '')}"[:3000],
                            "embedding": embedding,
                            "category": "qa",
                            "source": qa.get("source", "Q&A Database"),
                            "section": qa.get("topic", "General"),
                            "lang": "mixed",
                        })
                        
                        # Insert in batches
                        if len(documents) >= BATCH_SIZE:
                            successful, failed = insert_documents(supabase, documents)
                            total_successful += successful
                            total_failed += failed
                            documents = []
                            logger.debug(f"  ✓ Processed {idx}/{len(questions)} Q&A pairs")
                    else:
                        logger.debug(f"    ⚠️  Skipping Q&A {idx}")
                except Exception as e:
                    logger.warning(f"    ⚠️  Q&A {idx} failed: {str(e)[:50]}")
                    total_failed += 1
        
        # Insert remaining documents
        if documents:
            successful, failed = insert_documents(supabase, documents)
            total_successful += successful
            total_failed += failed
        
        logger.info(f"✅ law_questions.json processed")
    
    # Summary
    logger.info("\n" + "═" * 80)
    logger.info("📊 INGESTION SUMMARY")
    logger.info("═" * 80)
    logger.info(f"Total Documents Inserted:  {total_successful}")
    logger.info(f"Total Documents Failed:    {total_failed}")
    logger.info(f"Success Rate:              {total_successful / (total_successful + total_failed) * 100:.1f}%" if (total_successful + total_failed) > 0 else "N/A")
    logger.info("═" * 80)
    logger.info("✨ Ingestion complete! Your law data is now searchable in the vector DB.\n")



if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n⏸️  Ingestion cancelled by user")
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {e}")
        sys.exit(1)
