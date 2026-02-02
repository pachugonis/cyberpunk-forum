"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopicCard } from "@/components/forum";
import { GlitchText, CyberCard } from "@/components/cyberpunk";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  _count: {
    comments: number;
    reactions: number;
  };
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      handleSearch(query);
    }
  };

  return (
    <>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics..."
            className="pl-10 bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono"
          />
        </div>
        <Button type="submit" className="btn-cyber" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SEARCH"}
        </Button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cyber-cyan)]" />
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <p className="text-sm font-mono text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{initialQuery || query}&quot;
          </p>
          
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((topic) => (
                <TopicCard 
                  key={topic.id} 
                  topic={{
                    ...topic,
                    createdAt: new Date(topic.createdAt),
                  }} 
                />
              ))}
            </div>
          ) : (
            <CyberCard className="p-8 text-center">
              <p className="text-muted-foreground font-mono mb-2">
                No results found.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Try different keywords or check your spelling.
              </p>
            </CyberCard>
          )}
        </div>
      ) : (
        <CyberCard className="p-8 text-center">
          <p className="text-muted-foreground font-mono">
            Enter a search query to find topics.
          </p>
        </CyberCard>
      )}
    </>
  );
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--cyber-cyan)]" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to forum
      </Link>

      {/* Header */}
      <div>
        <GlitchText 
          text="SEARCH THE NETWORK" 
          as="h1"
          className="text-2xl font-bold text-[var(--cyber-cyan)] mb-2"
        />
        <p className="text-muted-foreground font-mono text-sm">
          Find topics, discussions, and more.
        </p>
      </div>

      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
