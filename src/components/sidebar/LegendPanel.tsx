import { useMemo } from "react";
import { Map as MapIcon } from "lucide-react";
import { Section } from "../ui";
import { useStore } from "../../store";
import { cn } from "../../lib/utils";
import type { GraphData } from "../../types";

/** Domain legend — color key for topic clusters, doubling as a visibility toggle. */
export function LegendPanel({ data }: { data: GraphData }) {
  const hiddenTopics = useStore((s) => s.hiddenTopics);
  const toggleTopicVisibility = useStore((s) => s.toggleTopicVisibility);
  const showAllTopics = useStore((s) => s.showAllTopics);

  const { domains, counts } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of data.nodes) counts[n.domainId] = (counts[n.domainId] ?? 0) + 1;
    return {
      domains: data.domains
        .filter((domain) => (counts[domain.id] ?? 0) > 0)
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
      counts,
    };
  }, [data.domains, data.nodes]);

  return (
    <Section
      title="Legend"
      icon={<MapIcon className="h-3 w-3" />}
      aside={
        hiddenTopics.size ? (
          <button onClick={showAllTopics} className="text-[10px] text-[var(--primary)] hover:underline">
            Show all
          </button>
        ) : null
      }
    >
      <div className="space-y-0.5">
        {domains.map((domain) => {
          const visible = !hiddenTopics.has(domain.id);
          return (
            <button
              key={domain.id}
              onClick={() => toggleTopicVisibility(domain.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-left transition hover:bg-[var(--surface-muted)]",
                !visible && "opacity-40"
              )}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-[4px] border-[1.5px]"
                style={{ borderColor: domain.border, background: domain.tint }}
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--text)]">{domain.label}</span>
              <span className="text-[11px] tabular-nums text-[var(--muted)]">{counts[domain.id]}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
