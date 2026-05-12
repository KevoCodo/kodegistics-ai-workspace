import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { TopNav } from "../components/top-nav";
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
      <body className="min-h-full bg-gradient-to-b from-background to-muted text-foreground flex flex-col">
        <header className="border-b border-border/80 bg-background/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight text-foreground">
              AI Workflow Automation Dashboard
            </Link>
            <TopNav />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-border/80 bg-background/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-muted-foreground">
            Portfolio showcase project. Simulated execution only.
          </div>
        </footer>
      </body>
    </html>
  );
}
