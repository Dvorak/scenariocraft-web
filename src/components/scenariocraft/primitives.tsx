import type { ReactNode } from "react";

export function Card({
  title,
  icon,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-card ${className}`}>
      {title !== undefined && (
        <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-tight">
            {icon && <span className="text-coral">{icon}</span>}
            <span className="truncate">{title}</span>
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatusDot({
  status,
  className = "",
}: {
  status: "passed" | "warning" | "failed" | "idle" | "running";
  className?: string;
}) {
  const color =
    status === "passed"
      ? "bg-success"
      : status === "warning"
        ? "bg-warning"
        : status === "failed"
          ? "bg-destructive"
          : status === "running"
            ? "bg-coral animate-pulse"
            : "bg-idle";
  return <span className={`inline-block h-2 w-2 rounded-full ${color} ${className}`} />;
}

export function KeyValueRow({
  label,
  value,
  chevron,
}: {
  label: ReactNode;
  value: ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-surface-muted px-3.5 py-2.5 text-sm">
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 truncate text-right font-medium">
        {value}
        {chevron && (
          <svg
            className="h-3.5 w-3.5 text-muted-foreground"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "coral";
}) {
  return (
    <div
      className={`rounded-xl border px-3.5 py-3 ${
        tone === "coral" ? "border-coral/20 bg-coral-soft" : "border-border/70 bg-surface-muted"
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-mono text-[17px] font-medium tabular-nums">{value}</div>
    </div>
  );
}
