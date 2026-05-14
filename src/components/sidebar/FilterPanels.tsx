import { Filter } from "lucide-react";
import { Section } from "../ui";
import { useStore } from "../../store";
import { KIND_LABEL, RELATION_LABEL } from "../../types";
import { cn } from "../../lib/utils";
import { getRelationStyle } from "../../lib/relationStyle";

export function KindFilterPanel({ availableKinds, counts }: { availableKinds: string[]; counts: Record<string, number> }) {
  const kinds = useStore((s) => s.kinds);
  const toggleKind = useStore((s) => s.toggleKind);
  const resetKinds = useStore((s) => s.resetKinds);

  return (
    <Section title="Kinds" icon={<Filter className="h-3 w-3" />} aside={kinds.size ? <button onClick={resetKinds} className="text-[10px] text-[var(--primary)] hover:underline">All</button> : null}>
      <div className="flex flex-wrap gap-1.5">
        {availableKinds.filter((k) => (counts[k] ?? 0) > 0).map((k) => {
          const active = kinds.size === 0 || kinds.has(k);
          return (
            <button key={k} onClick={() => toggleKind(k)} className={cn(`kind-${k}`, "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition", active ? "border-[rgba(var(--c),0.35)] bg-[rgba(var(--c),0.10)] text-[rgba(var(--c),1)]" : "border-[var(--border-soft)] bg-[var(--surface-soft)] text-[var(--faint)] hover:text-[var(--text-soft)]")}>
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--c),1)]" />
              {KIND_LABEL[k]}
              <span className="text-[var(--muted)]">{counts[k]}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function RelationFilterPanel({ availableRelations }: { availableRelations: string[] }) {
  const relations = useStore((s) => s.relations);
  const toggleRelation = useStore((s) => s.toggleRelation);
  const resetRelations = useStore((s) => s.resetRelations);

  return (
    <Section title="Relations" aside={relations.size ? <button onClick={resetRelations} className="text-[10px] text-[var(--primary)] hover:underline">All</button> : null}>
      <div className="space-y-1.5">
        {availableRelations.map((r) => {
          const active = relations.size === 0 || relations.has(r);
          const style = getRelationStyle(r);
          return (
            <button key={r} onClick={() => toggleRelation(r)} className={cn("flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left transition", active ? "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-soft)]" : "border-[var(--border-soft)] bg-transparent text-[var(--faint)] hover:text-[var(--text-soft)]")}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-7 rounded-full" style={{ background: style.color, opacity: active ? 0.9 : 0.32 }} />
                <span className="truncate text-xs">{RELATION_LABEL[r]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
