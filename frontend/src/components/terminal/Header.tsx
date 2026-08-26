import { Activity, ShieldCheck, Terminal } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-terminal-border/80 bg-terminal-bg/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">
                VENTURE<span className="text-sky-400">LENS</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-sky-400">
                M0 Infra
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Investment Intelligence Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Online</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span>Traceable Evidence</span>
          </div>
        </div>
      </div>
    </header>
  );
}
