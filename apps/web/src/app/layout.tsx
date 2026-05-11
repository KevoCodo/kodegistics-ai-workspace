import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Workflow Automation Dashboard",
  description:
    "Public portfolio project demonstrating workflow orchestration concepts: runs, logs, validation, and state handling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-black/10">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              AI Workflow Automation Dashboard
            </Link>
            <nav className="flex items-center gap-4 text-sm text-black/70">
              <Link className="hover:text-black" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-black" href="/workflows">
                Workflows
              </Link>
              <Link className="hover:text-black" href="/runs">
                Runs
              </Link>
              <Link className="hover:text-black" href="/architecture">
                Architecture
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-black/10">
          <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-black/60">
            Portfolio showcase project. Simulated execution only.
          </div>
        </footer>
      </body>
    </html>
  );
}
