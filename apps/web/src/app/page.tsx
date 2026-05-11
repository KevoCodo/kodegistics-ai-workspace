import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          AI Workflow Automation Dashboard
        </h1>
        <p className="max-w-2xl text-base text-black/70">
          Public portfolio project demonstrating workflow orchestration
          concepts: workflow catalog, run lifecycle, validation, logs, and
          results. Execution is simulated (no external AI calls).
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/workflows"
          className="rounded-lg border border-black/10 p-5 hover:bg-black/[.02]"
        >
          <div className="font-medium">Workflows</div>
          <div className="mt-1 text-sm text-black/70">
            Browse predefined workflow templates (generic).
          </div>
        </Link>
        <Link
          href="/runs"
          className="rounded-lg border border-black/10 p-5 hover:bg-black/[.02]"
        >
          <div className="font-medium">Runs</div>
          <div className="mt-1 text-sm text-black/70">
            View workflow run history, status, and outputs.
          </div>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-black/10 p-5 hover:bg-black/[.02]"
        >
          <div className="font-medium">Dashboard</div>
          <div className="mt-1 text-sm text-black/70">
            High-level operational overview (placeholder).
          </div>
        </Link>
        <Link
          href="/architecture"
          className="rounded-lg border border-black/10 p-5 hover:bg-black/[.02]"
        >
          <div className="font-medium">Architecture</div>
          <div className="mt-1 text-sm text-black/70">
            System boundaries and responsibilities (docs-backed).
          </div>
        </Link>
      </section>
    </div>
  );
}
