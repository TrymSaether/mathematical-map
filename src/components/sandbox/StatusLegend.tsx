import { FACT_STATUS_META, FactStatusGlyph, type FactStatus } from "./FactsPanel";

/** Bottom-right status legend: the fact-status glyph vocabulary. */
export function StatusLegend() {
  const items: FactStatus[] = ["computed", "recognized", "user", "pending"];
  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-3.5 rounded-md border px-3 py-1.5"
      style={{
        background: "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-1)",
      }}
    >
      {items.map((status) => (
        <span key={status} className="flex items-center gap-1.5 text-ui-xs" style={{ color: "var(--fg-2)" }}>
          <FactStatusGlyph status={status} size={11} />
          {FACT_STATUS_META[status].label}
        </span>
      ))}
    </div>
  );
}
