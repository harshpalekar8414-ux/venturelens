# VentureLens — Frontend Design & Terminal UI Specification

**Version:** 2.1.0  
**Status:** Approved Frontend Design  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Design Philosophy: The Institutional Research Terminal

VentureLens is deliberately designed as a **high-density, professional investment intelligence terminal** (inspired by modern Bloomberg, PitchBook, and Perplexity Pro interfaces) rather than a generic conversational AI chatbot.

### Core Interface Principles:
1. **Information Density & Scannability:** High data density, clean typography (Inter / JetBrains Mono for metrics), structured cards, and visual badge hierarchies.
2. **Interactive Citation & Epistemic Audit:** Every metric, funding row, and thesis bullet is interactive. Clicking or hovering over any data point opens the **Citation Inspector Drawer**, displaying the exact source URL, publication date, trust weight, and highlighted verbatim text snippet.
3. **Epistemic Color Badging:**
   - `FACT`: Solid Cyan / Emerald badge (`#06b6d4` / `#10b981`) with verified shield icon.
   - `CALCULATED`: Purple / Indigo badge (`#8b5cf6`) with formula tooltip.
   - `ASSUMPTION`: Amber badge (`#f59e0b`) with warning triangle icon.
   - `AI_INTERPRETATION`: Blue / Violet badge (`#3b82f6`) with Gemini sparkle icon.
4. **Instant Command Palette (`Cmd + K`):** Global keyboard-driven search for companies, funding history, and research triggers.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [VL] VENTURELENS TERMINAL           [ Search companies... ⌘K ]          Status: Ready  [+ New Dossier] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ◀ PostHog, Inc.                                                                                        │
│ Open-source all-in-one product analytics, session replay, and feature flags platform.                 │
│ Founded: 2020  •  HQ: San Francisco, CA  •  Stage: Series B  •  Total Funding: $27.15M [FACT]          │
├──────────────────────────────────────┬─────────────────────────────────────────────────────────────────┤
│ COMPANY METRICS & CAP TABLE          │ STRATEGIC INVESTMENT THESIS                                     │
│ • Total Raised: $27.15M [FACT]       │ 1. Developer Tool Consolidation Moat [AI]                       │
│ • Last Round: $15M Series B [FACT]   │    Replaces 4+ fragmented SaaS tools into a single event stream.│
│ • Est. Headcount: 92 [FACT]          │ 2. Open-Core Self-Hosting Flywheel [AI]                         │
│ • Headcount CAGR: +42.9% [CALCULATED]│    Eliminates data compliance barriers for enterprise clients.  │
│ • Est. Runway: 28 Months [ASSUMPTION]│                                                                 │
├──────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ COMPETITOR MATRIX & RADAR            │ BULL / BEAR SCENARIO MATRIX                                     │
│ • Mixpanel (Legacy SaaS Incumbent)   │ ▲ Bull: Captures APM & observability budgets (Datadog spend).   │
│ • Amplitude (Enterprise Analytics)   │ ▼ Bear: High compute costs for session replays compression.     │
│ • Heap (Automated Event Tracking)    │                                                                 │
├──────────────────────────────────────┴─────────────────────────────────────────────────────────────────┤
│ [ Tab: Investment Memo ]  [ Tab: Evidence & Sources (14) ]  [ Tab: DD Questions ]  [ Export PDF / MD ] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy & Layout Tree

```
frontend/src/
├── app/
│   ├── layout.tsx                # Global Terminal Theme Provider (Dark/Light tokens)
│   ├── page.tsx                  # Dashboard Home: Recent Research, Watchlist, Trend Radar
│   ├── companies/
│   │   ├── page.tsx              # Directory & Search View with Advanced Filters
│   │   └── [slug]/
│   │       ├── page.tsx          # Company Master Dossier & Intelligence Dashboard
│   │       ├── loading.tsx       # Skeleton Loading States
│   │       └── memo/page.tsx     # Fullscreen Institutional Investment Memo View
│   └── compare/
│       └── page.tsx              # Multi-Company Side-by-Side Comparison Terminal
├── components/
│   ├── terminal/
│   │   ├── CommandBar.tsx        # Global Cmd+K Search & Trigger
│   │   ├── EpistemicBadge.tsx    # FACT / CALC / ASSUMPTION / AI Badges with Tooltips
│   │   ├── CitationDrawer.tsx    # Slide-over panel showing raw source quote & URL
│   │   ├── ResearchProgress.tsx  # Real-time SSE stage-by-stage progress tracker
│   │   └── MetricCard.tsx        # Financial & operational metric card with audit link
│   ├── charts/
│   │   ├── FundingTimeline.tsx   # Recharts scatter/bar timeline of historical rounds
│   │   ├── ValuationChart.tsx    # Valuation step-up multiples visualization
│   │   └── CompetitorRadar.tsx   # Multi-axis radar chart (Product, Price, Moat, Mindshare)
│   ├── memo/
│   │   ├── MemoViewer.tsx        # Interactive Markdown + structured section viewer
│   │   └── MemoExportMenu.tsx    # Download as PDF / Markdown / JSON
│   └── ui/                       # shadcn/ui accessible primitives (dialog, sheet, table, tabs, tooltip)
```

---

## 3. Real-Time Streaming & UX States

When a user initiates research for a company:
1. **Intake State:** Instant transition to the company page with optimistic skeleton placeholders.
2. **Streaming Progress HUD:** A discreet top progress indicator displays real-time SSE progress (`"Searching sources..."`, `"Crawling 14 URLs..."`, `"Verifying claims..."`, `"Gemini 3.7 Flash synthesizing memo..."`).
3. **Progressive Rendering:** Structured facts render dynamically as extraction completes, followed by the deep strategic analysis and investment memo.
4. **Zero Layout Shift:** Rigid grid layout containers ensure zero UI jumping during streaming data population.
