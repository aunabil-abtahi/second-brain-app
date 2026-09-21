import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { id, is_starred } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // 1. Update Supabase
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .update({ is_starred })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);

    // 2. Trigger Zapier webhook if starred
    if (is_starred && process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'starred',
          article
        })
      }).catch(err => console.error('Zapier webhook failed:', err));
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error('Star error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
