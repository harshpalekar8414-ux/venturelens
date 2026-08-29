"use client";

import React, { useState } from "react";
import { Header } from "@/components/terminal/Header";
import { SearchHero } from "@/components/terminal/SearchHero";
import { EpistemicPillars } from "@/components/terminal/EpistemicPillars";
import { AnalysisReport } from "@/components/terminal/AnalysisReport";
import { analyzeCompany, CompanyAnalysisReport } from "@/lib/api";

export default function HomePage() {
  const [report, setReport] = useState<CompanyAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (companyName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeCompany(companyName);
      setReport(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while analyzing the company.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col justify-center">
        {report ? (
          <AnalysisReport report={report} onReset={handleReset} />
        ) : (
          <>
            <SearchHero
              onSearch={handleSearch}
              isLoading={isLoading}
              error={error}
            />
            <EpistemicPillars />
          </>
        )}
      </main>
      <footer className="border-t border-terminal-border/60 py-6 text-center text-xs font-mono text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VentureLens v0.1.0 — M1 Grounded Research & Analysis</span>
          <span>FastAPI • Next.js 15 • Gemini 3.7 Flash • Pluggable Search</span>
        </div>
      </footer>
    </div>
  );
}
