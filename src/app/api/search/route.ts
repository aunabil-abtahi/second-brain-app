import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getIndex } from '@/lib/pinecone';
import { generateEmbedding } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Embed query
    const embedding = await generateEmbedding(query);

    // 2. Search Pinecone
    const index = getIndex();
    const searchResponse = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true
    });

    const articleIds = searchResponse.matches.map(m => m.id);

    if (articleIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 3. Fetch full details from Supabase
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .in('id', articleIds);

    if (error) throw new Error(`Supabase error: ${error.message}`);

    // Re-sort articles based on Pinecone score
    const sortedArticles = articleIds.map(id => articles.find(a => a.id === id)).filter(Boolean);

    return NextResponse.json({ results: sortedArticles });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
