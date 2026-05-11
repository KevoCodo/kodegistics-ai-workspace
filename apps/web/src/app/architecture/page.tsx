export default function ArchitecturePage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Architecture</h1>
      <p className="text-sm text-black/70">
        See the planning docs for the current architecture summary.
      </p>
      <p className="text-xs text-black/50">
        Note: The docs are currently stored in the repo under <code>docs/</code>
        , starting with <code>docs/ARCHITECTURE.md</code>. This page is a
        placeholder until the app includes an in-app docs viewer.
      </p>
    </div>
  );
}
