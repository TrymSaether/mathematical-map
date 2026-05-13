import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight, ArrowDownRight, Tag, BookOpen, Route, Hash, Network } from "lucide-react";
import { useMemo } from "react";

import { useStore } from "../store";
import { MathText, asDisplayMath } from "../lib/katex";
import { cn } from "../lib/utils";
import { KIND_LABEL, RELATION_LABEL, type GraphEdge, type GraphNode } from "../types";

interface NodePanelProps {
  nodeById: Map<string, GraphNode>;
  incomingEdgesByNodeId: Map<string, GraphEdge[]>;
  outgoingEdgesByNodeId: Map<string, GraphEdge[]>;
}

export function NodePanel({ nodeById, incomingEdgesByNodeId, outgoingEdgesByNodeId }: NodePanelProps) {
  const id = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const setPathTarget = useStore((s) => s.setPathTarget);

  const node = useMemo(() => (id ? nodeById.get(id) ?? null : null), [id, nodeById]);
  const incoming = useMemo(() => (node ? incomingEdgesByNodeId.get(node.id) ?? [] : []), [node, incomingEdgesByNodeId]);
  const outgoing = useMemo(() => (node ? outgoingEdgesByNodeId.get(node.id) ?? [] : []), [node, outgoingEdgesByNodeId]);

  if (!node) return <AnimatePresence />;

  const formalStatement = node.formalStatement?.trim() ?? "";
  const statement = node.originalText?.trim() ?? "";
  const explanation = node.explanation?.trim() ?? "";
  const mathematicalFormula = node.mathematicalFormula?.trim() ?? "";

  return (
    <AnimatePresence>
      <motion.aside
        key={node.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className={cn(
          `kind-${node.kind}`,
          "glass scanlines absolute right-3 top-3 bottom-3 z-20 flex w-[420px] max-w-[44vw] flex-col overflow-hidden rounded-2xl shadow-2xl"
        )}
        aria-label={`${KIND_LABEL[node.kind]} details`}
      >
        <PanelAccent />

        <header className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">
            <NodeEyebrow node={node} />
            <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight text-white">
              <MathText text={node.title} />
            </h2>
          </div>

          <button
            type="button"
            onClick={() => select(null)}
            aria-label="Close panel"
            className="rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <Section title={formalStatement ? "Formal statement" : "Statement"} icon={<BookOpen className="h-3 w-3" />}>
            <Card className="bg-black/20 text-white/85">
              <MathText text={formalStatement || statement || "No statement available."} />
            </Card>
          </Section>

          {explanation && (
            <Section title="Intuition">
              <p className="text-[13px] leading-relaxed text-white/75"><MathText text={explanation} /></p>
            </Section>
          )}

          {mathematicalFormula && (
            <Section title="Notation / formula">
              <Card className="overflow-x-auto bg-white/[0.03] text-white/80">
                <MathText text={asDisplayMath(mathematicalFormula)} />
              </Card>
            </Section>
          )}

          <EdgeSection
            title="Dependencies"
            edges={incoming}
            nodeById={nodeById}
            direction="source"
            icon={<ArrowUpRight className="h-3 w-3 rotate-180" />}
            empty="No upstream dependencies in this map."
          />

          <EdgeSection
            title="Consequences"
            edges={outgoing}
            nodeById={nodeById}
            direction="target"
            icon={<ArrowDownRight className="h-3 w-3" />}
            empty="No downstream consequences in this map."
          />

          <Tags tags={node.tags ?? []} />
          <Reference node={node} incomingCount={incoming.length} outgoingCount={outgoing.length} />
        </div>

        <footer className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setPathTarget(node.id)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3 py-2 text-xs font-medium text-accent-violet shadow-glow-violet transition hover:bg-accent-violet/20 focus:outline-none focus:ring-2 focus:ring-accent-violet/40"
          >
            <Route className="h-3.5 w-3.5" />
            Generate learning path to here
          </button>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
}

function PanelAccent() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--c),0.9)] to-transparent" />
      <div className="absolute -left-px top-12 h-32 w-px bg-gradient-to-b from-[rgba(var(--c),0.9)] to-transparent" />
    </>
  );
}

function NodeEyebrow({ node }: { node: GraphNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[rgba(var(--c),0.95)]">
      <span className="shrink-0 rounded-sm bg-[rgba(var(--c),0.12)] px-1.5 py-0.5">{KIND_LABEL[node.kind]}</span>
      {node.number && <span className="shrink-0 text-white/45">№ {node.number}</span>}
      <span className="truncate text-white/60">{node.topicCluster}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">{icon}<span>{title}</span></div>
      {children}
    </section>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-white/10 p-3 font-serif text-[13px] leading-relaxed", className)}>{children}</div>;
}

function EdgeSection({
  title,
  edges,
  nodeById,
  direction,
  icon,
  empty,
}: {
  title: string;
  edges: GraphEdge[];
  nodeById: Map<string, GraphNode>;
  direction: "source" | "target";
  icon: React.ReactNode;
  empty: string;
}) {
  const select = useStore((s) => s.select);

  return (
    <Section title={title} icon={icon}>
      {edges.length === 0 ? (
        <EmptyText>{empty}</EmptyText>
      ) : (
        <ul className="space-y-1">
          {edges.map((edge) => {
            const other = nodeById.get(direction === "source" ? edge.from : edge.to);
            if (!other) return null;

            return (
              <li key={edge.id}>
                <button
                  type="button"
                  onClick={() => select(other.id)}
                  className={cn(
                    `kind-${other.kind}`,
                    "group flex w-full items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5 text-left text-[12px] transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/15"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--c),1)]" />
                    <span className="shrink-0 text-white/40">{RELATION_LABEL[edge.relation]}</span>
                    <span className="truncate text-white/85"><MathText text={other.title} /></span>
                  </span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-white/30 transition group-hover:text-white/80" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <Section title="Tags" icon={<Tag className="h-3 w-3" />}>
      {tags.length === 0 ? <EmptyText>none</EmptyText> : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">{tag}</span>)}
        </div>
      )}
    </Section>
  );
}

function Reference({ node, incomingCount, outgoingCount }: { node: GraphNode; incomingCount: number; outgoingCount: number }) {
  return (
    <Section title="Reference" icon={<Hash className="h-3 w-3" />}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-white/40">Theme</dt>
        <dd className="min-w-0 truncate text-white/70">{node.topicCluster}</dd>
        <dt className="text-white/40">Kind</dt>
        <dd className="min-w-0 truncate text-white/70">{KIND_LABEL[node.kind]}</dd>
        <dt className="text-white/40">Links</dt>
        <dd className="min-w-0 text-white/70"><Network className="mr-1 inline h-3 w-3" />{incomingCount} in · {outgoingCount} out</dd>
        <dt className="text-white/40">ID</dt>
        <dd className="min-w-0 truncate font-mono text-white/55">{node.id}</dd>
      </dl>
    </Section>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-white/40">{children}</div>;
}
