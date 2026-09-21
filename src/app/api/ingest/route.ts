import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getIndex } from '@/lib/pinecone';
import { notion } from '@/lib/notion';
import { generateSummary, generateEmbedding } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Call Apify to scrape the URL
    // For this example we assume we have an Apify actor that takes a URL and returns text
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${process.env.APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startUrls: [{ url }] })
    });
    
    if (!apifyResponse.ok) {
      console.error('Apify failed');
      // For demo purposes, if Apify fails or is not configured, we mock the content
    }
    const apifyData = await apifyResponse.json().catch(() => null);
    const content = apifyData?.[0]?.text || `Mocked content for ${url} since Apify might not be configured.`;
    const title = apifyData?.[0]?.title || `Article from ${new URL(url).hostname}`;

    // 2. Generate Summary & Embeddings
    const summary = await generateSummary(content);
    const embedding = await generateEmbedding(summary);

    // 3. Save to Supabase
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('articles')
      .insert([{ url, title, summary }])
      .select('id')
      .single();

    if (dbError) throw new Error(`Supabase error: ${dbError.message}`);
    const articleId = dbData.id;

    // 4. Save to Pinecone
    const index = getIndex();
    await index.upsert([
      {
        id: articleId as string,
        values: embedding,
        metadata: { 
          title: title as string, 
          url: url as string, 
          summary 
        }
      }
    ] as any);

    // 5. Sync to Notion
    if (process.env.NOTION_DATABASE_ID && process.env.NOTION_API_KEY) {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Title: {
            title: [
              { text: { content: title } }
            ]
          },
          URL: {
            url: url
          },
          Summary: {
            rich_text: [
              { text: { content: summary.substring(0, 2000) } }
            ]
          }
        }
      });
    }

    return NextResponse.json({ success: true, id: articleId, title, summary });
  } catch (error: any) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
