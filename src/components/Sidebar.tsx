import { motion } from "framer-motion";
import { Panel, Badge } from "./ui";
import { type GraphData } from "../types";
import { SearchPanel } from "./sidebar/SearchPanel";
import { RoutePlannerPanel } from "./sidebar/RoutePlannerPanel";
import { HighlightPanel } from "./sidebar/HighlightPanel";
import { LegendPanel } from "./sidebar/LegendPanel";
import { KindFilterPanel, RelationFilterPanel } from "./sidebar/FilterPanels";
import { SavedPathsPanel } from "./sidebar/SavedPathsPanel";
import { LearningStatePanel } from "./sidebar/LearningStatePanel";

function Divider() {
  return <div className="border-t border-[var(--border-soft)]" />;
}

export function Sidebar({
  data,
  visibleCount,
  availableKinds,
  availableRelations,
}: {
  data: GraphData;
  visibleCount: number;
  availableKinds: string[];
  availableRelations: string[];
}) {
  const kindCounts = Object.fromEntries(availableKinds.map((k) => [k, data.nodes.filter((n) => n.kind === k).length]));

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className="h-full w-[320px] shrink-0"
    >
      <Panel className="flex h-full flex-col overflow-hidden">
        <header className="border-b border-[var(--border-soft)] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-[15px] leading-none text-[var(--text)]">Explore</div>
              <div className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                Plan routes, filter the graph, and track progress.
              </div>
            </div>
            <Badge tone="primary">{visibleCount}</Badge>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <SearchPanel visibleCount={visibleCount} totalCount={data.nodes.length} />
          <Divider />
          <RoutePlannerPanel data={data} />
          <Divider />
          <LegendPanel data={data} />
          <Divider />
          <HighlightPanel />
          <KindFilterPanel availableKinds={availableKinds} counts={kindCounts} />
          <RelationFilterPanel availableRelations={availableRelations} />
          <Divider />
          <SavedPathsPanel data={data} />
          <Divider />
          <LearningStatePanel data={data} />
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--border-soft)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
          <span>{data.nodes.length} concepts</span>
          <span>{data.edges.length} links</span>
        </footer>
      </Panel>
    </motion.aside>
  );
}
