# Second Brain Curator

Second Brain Curator is a personal knowledge management web application built with **Next.js (App Router)**. It allows you to rapidly ingest, summarize, and categorize articles into your own Notion database. The app automatically scrapes content from URLs, summarizes it using AI, and performs semantic search via vector embeddings.

## Features

- **Article Curation:** Paste any URL to ingest it into your Second Brain.
- **Automated Web Scraping:** Uses **Apify** to reliably extract the text content of articles, handling modern web pages gracefully.
- **AI Summarization:** Uses the **Google Gemini API** (`gemini-3.5-flash-lite`) to generate concise, readable summaries of long articles.
- **Semantic Search:** Uses **Pinecone Vector Database** to generate and store text embeddings, allowing you to search for articles by meaning (e.g., "articles about productivity tools").
- **Notion Sync:** Pushes the finalized article titles, URLs, and AI summaries directly into a **Notion Database** for your permanent personal knowledge graph.
- **Zapier RSS Integration:** Provides a built-in RSS feed endpoint (`/api/zapier-rss`) that lists "Starred" articles. This allows you to use Zapier's free "RSS by Zapier" trigger to fire automations (emails, slacks, etc.) without paying for premium Webhooks.
- **Resilient Pipeline:** Built-in exponential backoff and retry logic handles intermittent AI API rate limits (e.g., HTTP 503 errors) gracefully.
- **Vercel Deployment:** Configured for seamless deployment on Vercel.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Vanilla CSS (Glassmorphism & Dynamic Aesthetics)
- **Database:** Supabase (PostgreSQL) for relational article storage
- **Vector Search:** Pinecone (SDK v9) for similarity search & embeddings
- **AI Model:** Google Gemini (Gemini 3.5 Flash Lite)
- **Scraper:** Apify (Cheerio Scraper)
- **CMS / Knowledge Base:** Notion API

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aunabil-abtahi/second-brain-app.git
   cd second-brain-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure the following keys:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name

   # Notion Configuration
   NOTION_API_KEY=your_internal_integration_token
   NOTION_DATABASE_ID=your_notion_database_id

   # Apify Configuration
   APIFY_API_TOKEN=your_apify_api_token
   APIFY_ACTOR_ID=apify~cheerio-scraper

   # Gemini / LLM Configuration
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Zapier Integration (Free)

To trigger workflows when you "Star" an article without using Zapier's premium Webhooks feature:
1. In Zapier, create a new Zap and select **RSS by Zapier** as the trigger.
2. Choose **New Item in Feed**.
3. Use your live production URL appended with `/api/zapier-rss` (e.g., `https://second-brain-app-steel.vercel.app/api/zapier-rss`).
4. Whenever you star an article, it will appear in the RSS feed and automatically trigger your Zap!

## Deployment

This project is configured to deploy seamlessly to **Vercel**. Be sure to supply all the required environment variables in the Vercel Dashboard project settings before deploying.
