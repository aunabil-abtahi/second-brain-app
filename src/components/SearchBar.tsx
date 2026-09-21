"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '2rem' }}>
      <input
        type="text"
        placeholder="Ask your second brain..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ paddingLeft: '3rem' }}
      />
      <Search 
        size={20} 
        color="var(--accent)" 
        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
      />
    </form>
  );
}
