import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || 
              process.env.VITE_SUPABASE_URL || 
              process.env.NEXT_PUBLIC_SUPABASE_URL || 
              '';
  
  const key = process.env.SUPABASE_SERVICE_KEY || 
              process.env.SUPABASE_ANON_KEY || 
              process.env.VITE_SUPABASE_ANON_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              '';
              
  return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials missing (Checked: SUPABASE_URL, VITE_SUPABASE_URL, etc). RAG and Auth functionality will be limited.");
}

// Ensure url starts with https:// to avoid createClient throwing if empty
const safeUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder-project.supabase.co';
const safeKey = supabaseKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey);

/**
 * Search for similar document chunks using pgvector
 * @param embedding 768-dimension vector
 * @param topK number of results
 * @param category optional filter
 */
export async function searchSimilarChunks(embedding: number[], topK = 3, category = '') {
  try {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: topK,
      filter_category: category || ''
    });

    if (error) {
      console.error(`Supabase RPC error: ${error.message}`);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Supabase search failed:`, err);
    return [];
  }
}
