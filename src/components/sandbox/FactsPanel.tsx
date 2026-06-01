import type { ReactNode } from "react";
import { Circle, CircleCheck, Sparkles, Star, type LucideIcon } from "lucide-react";
import { dist, type SandboxObject } from "./types";

export type FactStatus = "user" | "computed" | "recognized" | "pending";

export const FACT_STATUS_META: Record<FactStatus, { label: string; color: string; icon: LucideIcon }> = {
  computed: { label: "computed", color: "var(--fact-computed)", icon: CircleCheck },
  recognized: { label: "recognized", color: "var(--fact-recognized)", icon: Sparkles },
  user: { label: "user", color: "var(--fact-user)", icon: Star },
  pending: { label: "pending", color: "var(--fact-pending)", icon: Circle },
};

export function FactsPanel({ objects }: { objects: SandboxObject[] }) {
  const points = objects.filter((o) => o.kind === "point");
  const basepoint = objects.find((o) => o.kind === "basepoint");
  const sets = objects.filter((o) => o.kind === "openset");
  const loops = objects.filter((o) => o.kind === "loop");
  const measures = objects.filter((o) => o.kind === "measure");
  const covers = objects.filter((o) => o.kind === "cover");
  const quotients = objects.filter((o) => o.kind === "quotient");

  const hasInput = objects.length > 0;

  return (
    <aside
      className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-l"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <Section title="Space" status={hasInput ? "user" : "pending"}>
        {hasInput ? (
          <MathLine>X ⊆ ℝ²</MathLine>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Topology" status={hasInput ? "user" : "pending"}>
        {hasInput ? (
          <Plain>Subspace topology inherited from ℝ²</Plain>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Subsets" status={sets.length ? "user" : "pending"}>
        {sets.length ? (
          <div className="flex flex-col gap-1">
            {sets.map((s) => (
              <Row key={s.id} status="user">
                <MathLine>
                  {s.label} ⊂ X — open ball r = {(s as { r: number }).r.toFixed(1)}
                </MathLine>
              </Row>
            ))}
          </div>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Points" status={points.length || basepoint ? "computed" : "pending"}>
        {points.length || basepoint ? (
          <div className="flex flex-col gap-1">
            {basepoint && (
              <Row status="user">
                <MathLine>
                  basepoint x₀ = ({fmt(basepoint.x)}, {fmt(basepoint.y)})
                </MathLine>
              </Row>
            )}
            {points.map((p, i) => (
              <Row key={p.id} status="computed">
                <MathLine>
                  p{points.length > 1 ? sub(i + 1) : ""} = ({fmt(p.x)}, {fmt(p.y)}) ∈ X
                </MathLine>
              </Row>
            ))}
          </div>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Measurements" status={measures.length ? "computed" : "pending"}>
        {measures.length ? (
          <div className="flex flex-col gap-1">
            {measures.map((m) => (
              <Row key={m.id} status="computed">
                <MathLine>d = {dist(m.x1, m.y1, m.x2, m.y2).toFixed(3)}</MathLine>
              </Row>
            ))}
          </div>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Loops" status={loops.length ? "user" : "pending"}>
        {loops.length ? (
          <div className="flex flex-col gap-0.5">
            <MathLine>γ : [0, 1] → X</MathLine>
            <MathLine>γ(0) = γ(1) = x₀</MathLine>
          </div>
        ) : (
          <Pending />
        )}
      </Section>

      <Section
        title="π₁(X, x₀)"
        status={loops.length && basepoint ? "recognized" : "pending"}
      >
        {loops.length && basepoint ? (
          <div className="flex flex-col gap-0.5">
            <MathLine>π₁(X, x₀) ≅ ℤ</MathLine>
            <Plain>Generator: [γ]</Plain>
          </div>
        ) : (
          <Pending hint="Place a loop and a basepoint" />
        )}
      </Section>

      <Section title="Cover" status={covers.length ? "computed" : "pending"}>
        {covers.length ? (
          <MathLine>{"{ U₁, U₂, U₃ } covers X"}</MathLine>
        ) : (
          <Pending />
        )}
      </Section>

      <Section title="Quotient" status={quotients.length ? "user" : "pending"}>
        {quotients.length ? <MathLine>X / ∼</MathLine> : <Pending />}
      </Section>
    </aside>
  );
}

function Section({
  title,
  status,
  children,
}: {
  title: string;
  status: FactStatus;
  children: ReactNode;
}) {
  return (
    <div className="border-b px-[18px] py-3.5" style={{ borderColor: "var(--border)" }}>
      <div
        className="mb-2.5 flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-label"
        style={{ color: "var(--fg-2)" }}
      >
        <span>{title}</span>
        <FactStatusGlyph status={status} />
      </div>
      {children}
    </div>
  );
}

function Row({ status, children }: { status: FactStatus; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2.5 py-0.5">
      <div className="flex-1">{children}</div>
      <FactStatusGlyph status={status} className="mt-0.5" size={11} />
    </div>
  );
}

export function FactStatusGlyph({
  status,
  className,
  size = 12,
}: {
  status: FactStatus;
  className?: string;
  size?: number;
}) {
  const meta = FACT_STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ color: meta.color }}
      title={meta.label}
      aria-label={meta.label}
    >
      <Icon width={size} height={size} strokeWidth={status === "pending" ? 2.1 : 2.4} fill={status === "user" ? "currentColor" : "none"} />
    </span>
  );
}

function MathLine({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-ui-body leading-relaxed"
      style={{ fontFamily: "var(--font-math)", color: "var(--fg-1)" }}
    >
      {children}
    </div>
  );
}

function Plain({ children }: { children: ReactNode }) {
  return (
    <div className="text-ui-sm" style={{ color: "var(--fg-2)" }}>
      {children}
    </div>
  );
}

function Pending({ hint }: { hint?: string }) {
  return (
    <div className="text-ui-sm" style={{ color: "var(--fg-3)" }}>
      {hint ?? "—"}
    </div>
  );
}

const fmt = (n: number) => (Math.abs(n) < 0.05 ? "0" : n.toFixed(1));
const sub = (n: number) => "₀₁₂₃₄₅₆₇₈₉".charAt(n) || String(n);
