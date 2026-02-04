"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopicCard } from "@/components/forum";
import { GlitchText, CyberCard } from "@/components/cyberpunk";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, Loader2, Filter, X } from "lucide-react";

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
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
    attachments: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string | null;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hasAttachments, setHasAttachments] = useState<boolean>(false);
  
  // Data for filters
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        // API returns { categories: [...] }
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(err => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      });
  }, []);

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
      // Build query params
      const params = new URLSearchParams({
        q: searchQuery,
      });
      
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (sortBy !== "recent") params.append("sort", sortBy);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (statusFilter === "pinned") params.append("isPinned", "true");
      if (statusFilter === "locked") params.append("isLocked", "true");
      if (hasAttachments) params.append("hasAttachments", "true");

      const response = await fetch(`/api/search?${params.toString()}`);
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

  const resetFilters = () => {
    setCategoryFilter("all");
    setSortBy("recent");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setHasAttachments(false);
    if (query) handleSearch(query);
  };

  const hasActiveFilters = categoryFilter !== "all" || sortBy !== "recent" || 
    dateFrom || dateTo || statusFilter !== "all" || hasAttachments;

  return (
    <>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics..."
              className="pl-10 bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 ${showFilters ? 'bg-[var(--cyber-cyan)]/10 border-[var(--cyber-cyan)]' : ''} ${hasActiveFilters ? 'border-[var(--cyber-cyan)]' : ''}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button type="submit" className="btn-cyber" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SEARCH"}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <CyberCard className="p-4 space-y-4 border-[var(--cyber-cyan)]/30">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-[var(--cyber-cyan)]">
                ADVANCED FILTERS
              </h3>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs font-mono"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Category
                </Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-[#1a1a24] border-[#2a2a35] font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-[#2a2a35]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-[#1a1a24] border-[#2a2a35] font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-[#2a2a35]">
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="comments">Most Comments</SelectItem>
                    <SelectItem value="reactions">Most Reactions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-[#1a1a24] border-[#2a2a35] font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-[#2a2a35]">
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="pinned">Pinned Only</SelectItem>
                    <SelectItem value="locked">Locked Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  From Date
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-[#1a1a24] border-[#2a2a35] font-mono text-sm"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  To Date
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-[#1a1a24] border-[#2a2a35] font-mono text-sm"
                />
              </div>

              {/* Has Attachments */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Attachments
                </Label>
                <Button
                  type="button"
                  variant={hasAttachments ? "default" : "outline"}
                  className={`w-full font-mono text-sm ${hasAttachments ? 'bg-[var(--cyber-cyan)] text-black' : ''}`}
                  onClick={() => setHasAttachments(!hasAttachments)}
                >
                  {hasAttachments ? "With Attachments" : "Any"}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => query && handleSearch(query)}
              className="w-full btn-cyber"
              disabled={loading || !query}
            >
              Apply Filters
            </Button>
          </CyberCard>
        )}
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
