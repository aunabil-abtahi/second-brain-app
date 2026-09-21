import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch the 50 most recently added articles that are starred
    // (Zapier will automatically detect any new IDs that appear in this list)
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('is_starred', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Generate RSS XML
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Starred Articles - Second Brain</title>
  <link>https://second-brain-app-steel.vercel.app</link>
  <description>Automatically generated feed of starred articles for Zapier integration.</description>
  ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${article.url}</link>
      <guid>${article.id}</guid>
      <description><![CDATA[${article.summary || ''}]]></description>
      <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
    </item>
  `).join('')}
</channel>
</rss>`;

    return new NextResponse(feed, {
      headers: {
        'Content-Type': 'application/rss+xml',
        // Add cache control to ensure Zapier gets fresh data
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
