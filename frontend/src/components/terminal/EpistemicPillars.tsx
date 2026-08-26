import { Shield, Calculator, AlertTriangle, Cpu } from "lucide-react";

export function EpistemicPillars() {
  const pillars = [
    {
      type: "FACT",
      badge: "FACT",
      badgeClass: "bg-cyan-950/60 border-cyan-800/80 text-cyan-400",
      title: "Retrieved Facts",
      desc: "Direct web extractions from SEC filings, press releases, and company sites with exact quote bindings.",
      icon: Shield,
      iconColor: "text-cyan-400",
    },
    {
      type: "CALCULATED",
      badge: "CALCULATED",
      badgeClass: "bg-purple-950/60 border-purple-800/80 text-purple-400",
      title: "Calculated Metrics",
      desc: "Deterministic financial formulas (CAGR, runway, valuation step-up multiples) computed from verified facts.",
      icon: Calculator,
      iconColor: "text-purple-400",
    },
    {
      type: "ASSUMPTION",
      badge: "ASSUMPTION",
      badgeClass: "bg-amber-950/60 border-amber-800/80 text-amber-400",
      title: "Assumptions",
      desc: "Explicit default parameters and benchmark models applied when empirical data is unavailable.",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    {
      type: "AI_INTERPRETATION",
      badge: "AI INTERPRETATION",
      badgeClass: "bg-blue-950/60 border-blue-800/80 text-blue-400",
      title: "Strategic AI Synthesis",
      desc: "Thesis formulation, competitive moat analysis, bull/bear cases, and due diligence questions by Gemini 3.7 Flash.",
      icon: Cpu,
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-terminal-border/60">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
          Four-Tier Epistemic Fact Integrity
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          Every claim in VentureLens is auditable. Never accept an AI assumption as a verified fact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.type}
              className="bg-terminal-card border border-terminal-border rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${p.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${p.badgeClass}`}>
                    {p.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-200 mb-1.5">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
