import { useMemo } from "react";
import { Map as MapIcon } from "lucide-react";
import { Section } from "../ui";
import { useStore } from "../../store";
import { cn } from "../../lib/utils";
import { topicColor } from "../../lib/topicColors";
import type { GraphData } from "../../types";

/** Domain legend — color key for topic clusters, doubling as a visibility toggle. */
export function LegendPanel({ data }: { data: GraphData }) {
  const hiddenTopics = useStore((s) => s.hiddenTopics);
  const toggleTopicVisibility = useStore((s) => s.toggleTopicVisibility);
  const showAllTopics = useStore((s) => s.showAllTopics);

  const { topics, counts } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of data.nodes) counts[n.topicCluster] = (counts[n.topicCluster] ?? 0) + 1;
    return { topics: Object.keys(counts).sort(), counts };
  }, [data.nodes]);

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
        {topics.map((t) => {
          const visible = !hiddenTopics.has(t);
          const color = topicColor(topics, t);
          return (
            <button
              key={t}
              onClick={() => toggleTopicVisibility(t)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-left transition hover:bg-[var(--surface-muted)]",
                !visible && "opacity-40"
              )}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-[4px] border-[1.5px]"
                style={{ borderColor: color, background: `${color}1f` }}
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--text)]">{t}</span>
              <span className="text-[11px] tabular-nums text-[var(--muted)]">{counts[t]}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
