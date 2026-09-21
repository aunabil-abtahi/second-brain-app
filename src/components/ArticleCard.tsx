"use client";

import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";

export type Article = {
  id: string;
  title: string;
  url: string;
  summary: string;
  is_starred: boolean;
};

export default function ArticleCard({ article }: { article: Article }) {
  const [isStarred, setIsStarred] = useState(article.is_starred);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStar = async () => {
    setIsLoading(true);
    const newStatus = !isStarred;
    
    try {
      const res = await fetch('/api/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, is_starred: newStatus }),
      });
      if (res.ok) setIsStarred(newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass article-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{article.title}</h2>
        <button 
          onClick={toggleStar} 
          disabled={isLoading}
          style={{ 
            background: 'transparent', 
            padding: '0.5rem', 
            color: isStarred ? '#eab308' : 'var(--foreground)' 
          }}
        >
          <Star fill={isStarred ? '#eab308' : 'none'} size={24} />
        </button>
      </div>
      <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}
      >
        <ExternalLink size={16} /> Read Original
      </a>
      <p style={{ lineHeight: 1.6, color: '#cbd5e1' }}>{article.summary}</p>
    </div>
  );
}
