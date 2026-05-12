import { cn } from "../lib/utils";

export function JsonBlock({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "max-h-96 overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-xs text-foreground/80",
        className,
      )}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
