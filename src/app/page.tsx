"use client";

import { useState, useEffect } from "react";
import ArticleCard, { Article } from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import { Plus, Loader2 } from "lucide-react";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);

  // Initial load can fetch recent articles from Supabase in a real app
  // For now, we'll keep it empty until they search or add

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setArticles(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    setIsIngesting(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUrl("");
        // Optimistically add to top
        setArticles(prev => [{
          id: data.id,
          title: data.title,
          url: newUrl,
          summary: data.summary,
          is_starred: false
        }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      <section className="glass" style={{ padding: "2rem", marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Add to your Second Brain</h2>
        <form onSubmit={handleIngest} style={{ display: "flex", gap: "1rem" }}>
          <input 
            type="url" 
            placeholder="https://news.ycombinator.com/item?id=..." 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={isIngesting}>
            {isIngesting ? <Loader2 className="lucide-icon" style={{ animation: 'spin 2s linear infinite' }} /> : <Plus />}
            Curate
          </button>
        </form>
      </section>

      <section>
        <SearchBar onSearch={handleSearch} />
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Loader2 className="lucide-icon" size={48} style={{ animation: 'spin 2s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '1rem', color: 'var(--foreground)' }}>Searching neural pathways...</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.5)" }}>
                <p>No insights found. Try a different query or add new articles!</p>
              </div>
            ) : (
              articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
