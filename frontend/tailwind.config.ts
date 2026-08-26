import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#090d16",
          card: "#111726",
          border: "#1e293b",
          hover: "#1a2234",
          muted: "#64748b",
          accent: "#38bdf8",
        },
        epistemic: {
          fact: "#06b6d4",
          calculated: "#8b5cf6",
          assumption: "#f59e0b",
          ai: "#3b82f6",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
