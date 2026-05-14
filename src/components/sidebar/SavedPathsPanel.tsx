import { useMemo } from "react";
import { Bookmark, X } from "lucide-react";
import { Section } from "../ui";
import { useStore } from "../../store";
import type { GraphData } from "../../types";

/** Saved learning routes with per-path progress (share of stops marked learned). */
export function SavedPathsPanel({ data }: { data: GraphData }) {
  const savedPaths = useStore((s) => s.savedPaths);
  const removeSavedPath = useStore((s) => s.removeSavedPath);
  const learningStates = useStore((s) => s.learningStates);
  const setRouteFrom = useStore((s) => s.setRouteFrom);
  const setRouteTo = useStore((s) => s.setRouteTo);
  const planRoute = useStore((s) => s.planRoute);
  const select = useStore((s) => s.select);

  const { domainById, nodeById } = useMemo(
    () => ({
      domainById: new Map(data.domains.map((domain) => [domain.id, domain])),
      nodeById: new Map(data.nodes.map((n) => [n.id, n])),
    }),
    [data.domains, data.nodes]
  );

  const openPath = (fromId: string, toId: string) => {
    setRouteFrom(fromId);
    setRouteTo(toId);
    planRoute();
    select(fromId);
  };

  return (
    <Section title="Saved Paths" icon={<Bookmark className="h-3 w-3" />}>
      {savedPaths.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-[12px] text-[var(--muted)]">
          No saved paths yet. Plan a route to begin.
        </div>
      ) : (
        <div className="space-y-0.5">
          {savedPaths.map((p) => {
            const learned = p.nodeIds.filter((id) => learningStates[id] === "learned").length;
            const pct = p.nodeIds.length ? Math.round((learned / p.nodeIds.length) * 100) : 0;
            const fromNode = nodeById.get(p.fromId);
            const accent = fromNode ? domainById.get(fromNode.domainId)?.color ?? "var(--primary)" : "var(--primary)";
            return (
              <div key={p.id} className="group flex items-stretch gap-2.5 rounded-[10px] px-1.5 py-2 transition hover:bg-[var(--surface-muted)]">
                <span className="w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                <button onClick={() => openPath(p.fromId, p.toId)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-[12.5px] font-semibold text-[var(--text)]">{p.title}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-[var(--muted)]">
                      {learned}/{p.nodeIds.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => removeSavedPath(p.id)}
                  aria-label="Remove saved path"
                  className="shrink-0 self-start rounded p-1 text-[var(--faint)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--danger)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
