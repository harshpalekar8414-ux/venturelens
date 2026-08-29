"use client";

import React, { useState } from "react";
import {
  Shield,
  Cpu,
  Users,
  DollarSign,
  Briefcase,
  Layers,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";
import { CompanyAnalysisReport, EpistemicTier } from "@/lib/api";

interface AnalysisReportProps {
  report: CompanyAnalysisReport;
  onReset: () => void;
}

function EpistemicBadge({ tier }: { tier: EpistemicTier }) {
  if (tier === "FACT") {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/70 border border-cyan-800/80 text-cyan-400">
        <Shield className="h-3 w-3 mr-0.5" />
        <span>FACT</span>
      </span>
    );
  }
  if (tier === "CALCULATED") {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-800/80 text-purple-400">
        <span>CALCULATED</span>
      </span>
    );
  }
  if (tier === "ASSUMPTION") {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 border border-amber-800/80 text-amber-400">
        <span>ASSUMPTION</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 border border-blue-800/80 text-blue-400">
      <Cpu className="h-3 w-3 mr-0.5" />
      <span>AI INTERPRETATION</span>
    </span>
  );
}

function SourcePill({ id, onClick }: { id: number; onClick?: (id: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick && onClick(id)}
      className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-sky-300 transition-colors ml-1"
      title={`Jump to Source [${id}]`}
    >
      [{id}]
    </button>
  );
}

export function AnalysisReport({ report, onReset }: AnalysisReportProps) {
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);

  const scrollToSource = (id: number) => {
    setActiveSourceId(id);
    const element = document.getElementById(`source-item-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-terminal-border/80">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New Research Search</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Analysis Complete • 11 Sections Grounded</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-terminal-card border border-terminal-border rounded-xl p-6 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-32 w-32 text-sky-400" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {report.company_name}
            </h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-800/70 text-sky-400">
              Institutional Intelligence Dossier
            </span>
          </div>
          {report.tagline && (
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-3xl">
              {report.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Company Overview */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                1. Company Overview
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <EpistemicBadge tier={report.overview_tier} />
              {report.overview_source_ids?.map((sid) => (
                <SourcePill key={sid} id={sid} onClick={scrollToSource} />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {report.overview}
          </p>
        </section>

        {/* 2. Founders & 3. Funding (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2. Founders */}
          <section className="bg-terminal-card border border-terminal-border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    2. Founders & Leadership
                  </h2>
                </div>
                <EpistemicBadge tier="FACT" />
              </div>

              <div className="space-y-3">
                {report.founders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-100 text-sm">
                        {founder.name}
                      </span>
                      <div className="flex items-center">
                        <span className="text-slate-400 font-mono">
                          {founder.role}
                        </span>
                        {founder.source_ids?.map((sid) => (
                          <SourcePill key={sid} id={sid} onClick={scrollToSource} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-400 mt-1">{founder.background}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Funding */}
          <section className="bg-terminal-card border border-terminal-border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    3. Funding Profile
                  </h2>
                </div>
                <EpistemicBadge tier={report.funding.epistemic_tier} />
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">
                    Total Raised
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                    {report.funding.total_raised}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">
                    Stage
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-sky-400 font-mono">
                    {report.funding.stage}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">
                    Valuation
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
                    {report.funding.valuation}
                  </span>
                </div>
              </div>

              {report.funding.rounds?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Recorded Rounds
                  </span>
                  {report.funding.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">
                          {round.round_name}
                        </span>
                        <span className="text-slate-500 ml-2 font-mono">
                          {round.date}
                        </span>
                        {round.lead_investors?.length > 0 && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Investors: {round.lead_investors.join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-mono text-emerald-400 font-semibold">
                          {round.amount}
                        </span>
                        {round.source_ids?.map((sid) => (
                          <SourcePill key={sid} id={sid} onClick={scrollToSource} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 4. Business Model */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                4. Business Model & Monetization
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <EpistemicBadge tier={report.business_model_tier} />
              {report.business_model_source_ids?.map((sid) => (
                <SourcePill key={sid} id={sid} onClick={scrollToSource} />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {report.business_model}
          </p>
        </section>

        {/* 5. Competitors */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                5. Competitors & Market Landscape
              </h2>
            </div>
            <EpistemicBadge tier="FACT" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.competitors.map((comp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-200 text-sm">
                    {comp.name}
                  </span>
                  <div className="flex items-center">
                    {comp.source_ids?.map((sid) => (
                      <SourcePill key={sid} id={sid} onClick={scrollToSource} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {comp.differentiation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Investment Thesis */}
        <section className="bg-terminal-card border border-sky-500/30 rounded-xl p-6 shadow-lg shadow-sky-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                6. Investment Thesis
              </h2>
            </div>
            <EpistemicBadge tier={report.investment_thesis_tier} />
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
            {report.investment_thesis}
          </p>
        </section>

        {/* 7. Bull Case & 8. Bear Case (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7. Bull Case */}
          <section className="bg-terminal-card border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-emerald-300 font-mono uppercase tracking-wider">
                  7. Bull Case (Upside)
                </h2>
              </div>
              <EpistemicBadge tier={report.bull_case_tier} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              {report.bull_case}
            </p>
          </section>

          {/* 8. Bear Case */}
          <section className="bg-terminal-card border border-rose-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-rose-300 font-mono uppercase tracking-wider">
                  8. Bear Case (Downside)
                </h2>
              </div>
              <EpistemicBadge tier={report.bear_case_tier} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              {report.bear_case}
            </p>
          </section>
        </div>

        {/* 9. Key Risks */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400">
                <AlertOctagon className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                9. Key Risks & Mitigations
              </h2>
            </div>
            <EpistemicBadge tier="AI_INTERPRETATION" />
          </div>

          <div className="space-y-3">
            {report.key_risks.map((risk, idx) => {
              const severityColor =
                risk.severity === "HIGH"
                  ? "bg-rose-950/80 border-rose-800 text-rose-400"
                  : risk.severity === "MEDIUM"
                  ? "bg-amber-950/80 border-amber-800 text-amber-400"
                  : "bg-slate-900 border-slate-700 text-slate-400";

              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 text-sm">
                      {risk.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${severityColor}`}
                    >
                      {risk.severity} RISK
                    </span>
                  </div>
                  <p className="text-slate-300 mb-2 leading-relaxed">
                    {risk.description}
                  </p>
                  {risk.mitigation && (
                    <div className="text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60">
                      <span className="text-sky-400 font-mono font-semibold">
                        Mitigation:{" "}
                      </span>
                      {risk.mitigation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 10. Due Diligence Questions */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                10. Due Diligence Questions
              </h2>
            </div>
            <EpistemicBadge tier="AI_INTERPRETATION" />
          </div>

          <div className="space-y-3">
            {report.due_diligence_questions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div className="font-semibold text-sky-300 text-sm mb-1">
                  Q{idx + 1}: {item.question}
                </div>
                <p className="text-slate-400">
                  <span className="font-mono text-slate-500 uppercase text-[10px] block mb-0.5">
                    Investment Rationale
                  </span>
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Sources & Evidence */}
        <section className="bg-terminal-card border border-terminal-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                <Shield className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                11. Retrieved Sources & Grounded Evidence
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {report.sources.length} Sources Verified
            </span>
          </div>

          <div className="space-y-3">
            {report.sources.map((src) => (
              <div
                id={`source-item-${src.id}`}
                key={src.id}
                className={`p-4 rounded-lg border transition-all ${
                  activeSourceId === src.id
                    ? "bg-sky-950/40 border-sky-500/70 ring-1 ring-sky-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-5 w-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-sky-400 flex-shrink-0">
                      {src.id}
                    </span>
                    <h3 className="font-semibold text-slate-200 text-xs sm:text-sm line-clamp-1">
                      {src.title}
                    </h3>
                  </div>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-mono text-sky-400 hover:text-sky-300 hover:underline flex-shrink-0"
                    >
                      <span>{src.domain || "Source Link"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-slate-500 text-[10px] uppercase block mb-1">
                    Extracted Evidence Snippet
                  </span>
                  &ldquo;{src.snippet}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
