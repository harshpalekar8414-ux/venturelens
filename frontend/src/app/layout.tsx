import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureLens — AI-Powered Startup Research & Investment Intelligence",
  description:
    "Institutional startup intelligence terminal. Verifiable source-attributed dossiers, financial analysis, and investment memos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-terminal-bg text-slate-100 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
