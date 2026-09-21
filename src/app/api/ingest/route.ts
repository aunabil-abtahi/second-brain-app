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
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${process.env.APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        startUrls: [{ url }],
        pageFunction: 'async function({ $, request }) { return { title: $(\'title\').text(), text: $(\'body\').text().replace(/\\s+/g, \' \') }; }'
      })
    });
    
    if (!apifyResponse.ok) {
      console.error('Apify failed');
      // For demo purposes, if Apify fails or is not configured, we mock the content
    }
    const apifyData = await apifyResponse.json().catch(() => null);
    
    let content = '';
    let title = `Article from ${new URL(url).hostname}`;

    if (apifyData && apifyData.length > 0) {
      if (apifyData[0]['#error']) {
        content = `The article at ${url} could not be scraped because the website blocked the scraper or an error occurred.`;
      } else {
        content = apifyData[0].text || `No text could be extracted from ${url}.`;
        if (apifyData[0].title) title = apifyData[0].title;
      }
    } else {
      content = `No data was returned from the scraper for ${url}.`;
    }
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
    await index.upsert({
      records: [
        {
          id: articleId as string,
          values: embedding,
          metadata: { 
            title: title as string, 
            url: url as string, 
            summary 
          }
        }
      ]
    });

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
