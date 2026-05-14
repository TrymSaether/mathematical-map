import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { Section } from "../ui";
import { useStore, type LearningState } from "../../store";
import { StateGlyph, LEARNING_STATE_LABEL } from "../StateGlyph";
import type { GraphData } from "../../types";

const ORDER: LearningState[] = ["learned", "in-progress", "not-started", "locked"];

/** Roll-up of the learner's progress across every concept in the current map. */
export function LearningStatePanel({ data }: { data: GraphData }) {
  const learningStates = useStore((s) => s.learningStates);

  const counts = useMemo(() => {
    const c: Record<LearningState, number> = { learned: 0, "in-progress": 0, "not-started": 0, locked: 0 };
    for (const n of data.nodes) c[learningStates[n.id] ?? "not-started"] += 1;
    return c;
  }, [data.nodes, learningStates]);

  const total = data.nodes.length;
  const pct = total ? Math.round((counts.learned / total) * 100) : 0;

  return (
    <Section title="Learning State" icon={<GraduationCap className="h-3 w-3" />}>
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>Mastery</span>
          <span className="tabular-nums text-[var(--text-soft)]">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-1.5">
        {ORDER.map((state) => (
          <div key={state} className="flex items-center gap-2.5">
            <StateGlyph state={state} size={16} />
            <span className="flex-1 text-[12.5px] text-[var(--text-soft)]">{LEARNING_STATE_LABEL[state]}</span>
            <span className="text-[11px] tabular-nums text-[var(--muted)]">{counts[state]}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
