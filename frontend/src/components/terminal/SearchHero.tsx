"use client";

import { useState } from "react";
import { Search, ArrowRight, Sparkles, Building2 } from "lucide-react";

export function SearchHero() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSubmitting(true);
    // In M0, research engine is not yet connected; simulate brief terminal response
    setTimeout(() => {
      setIsSubmitting(false);
    }, 600);
  };

  const sampleCompanies = [
    "PostHog",
    "Cursor",
    "Modal Labs",
    "Resend",
    "Perplexity",
    "Supabase",
  ];

  return (
    <div className="py-16 sm:py-24 text-center max-w-4xl mx-auto px-4">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-8">
        <Sparkles className="h-3.5 w-3.5 text-sky-400" />
        <span>Strict Four-Tier Epistemic Fact Segregation</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
        Venture<span className="text-sky-400">Lens</span>
      </h1>
      <p className="text-lg sm:text-2xl text-slate-300 font-medium mb-3">
        AI-powered startup research & investment intelligence
      </p>
      <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-10">
        Transform public web signals into source-attributed dossiers, cap tables, risk matrices, and institutional investment memos.
      </p>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center bg-terminal-card border border-terminal-border rounded-xl shadow-2xl p-1.5 focus-within:border-sky-500/70 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
          <div className="pl-3.5 pr-2 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter startup name, URL, or domain (e.g. posthog.com)..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none py-2 px-1 font-mono"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 sm:px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-70 font-mono flex-shrink-0"
          >
            <span>{isSubmitting ? "Analyzing..." : "Analyze Company"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-mono">
        <span className="text-slate-500 flex items-center">
          <Building2 className="h-3.5 w-3.5 mr-1" /> Quick start:
        </span>
        {sampleCompanies.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setQuery(name)}
            className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200 text-slate-400 transition-colors"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
