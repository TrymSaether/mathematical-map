import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "default" | "muted" | "primary" | "accent" | "kind" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  default: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-soft)]",
  muted: "border-[var(--border-soft)] bg-[var(--field)] text-[var(--muted)]",
  primary: "border-[rgba(var(--primary-rgb),0.25)] bg-[var(--primary-soft)] text-[var(--primary)]",
  accent: "border-[rgba(var(--accent-purple-rgb),0.25)] bg-[rgba(var(--accent-purple-rgb),0.10)] text-[rgb(var(--accent-purple-rgb))]",
  kind: "border-[rgba(var(--c),0.30)] bg-[rgba(var(--c),0.08)] text-[rgba(var(--c),1)]",
  success: "border-[color-mix(in_srgb,var(--success)_28%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]",
  warning: "border-[color-mix(in_srgb,var(--warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)]",
  danger: "border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
