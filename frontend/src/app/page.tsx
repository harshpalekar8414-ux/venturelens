import { Header } from "@/components/terminal/Header";
import { SearchHero } from "@/components/terminal/SearchHero";
import { EpistemicPillars } from "@/components/terminal/EpistemicPillars";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col justify-center">
        <SearchHero />
        <EpistemicPillars />
      </main>
      <footer className="border-t border-terminal-border/60 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VentureLens v0.1.0 — M0 Infrastructure Foundation</span>
          <span>FastAPI • PostgreSQL 16 + pgvector • Next.js 15 • Gemini 3.7 Flash</span>
        </div>
      </footer>
    </div>
  );
}
