import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { getDomainTone } from "../lib/colors";
import { MathText } from "../lib/katex";
import { cn } from "../lib/utils";
import { useStore } from "../store";
import { KIND_LABEL, type TopoNode as TopoNodeT } from "../types";

interface Data {
  node: TopoNodeT;
  dim?: boolean;
  isSelected?: boolean;
  isRelated?: boolean;
  hasIncoming?: boolean;
  hasOutgoing?: boolean;
  incomingHandleColor?: string;
  outgoingHandleColor?: string;
}

const KIND_ABBREV: Record<string, string> = {
  definition: "Def",
  theorem: "Thm",
  lemma: "Lem",
  proposition: "Prop",
  corollary: "Cor",
  example: "Ex",
  non_example: "Ex",
  counterexample: "C-Ex",
  proof: "Pf",
  proof_step: "Pf",
  proof_method: "Pf",
  axiom: "Ax",
  assumption: "Asm",
  structure: "Str",
  object: "Obj",
  property: "Prop",
  construction: "Con",
  notation: "Not",
  conjecture: "Conj",
  application: "App",
};

function kindAbbrev(kind: string): string {
  return KIND_ABBREV[kind] ?? kind.slice(0, 3).replace(/^\w/, (char) => char.toUpperCase());
}

function handleStyle(color?: string): CSSProperties {
  return { "--handle-color": color ?? "var(--accent)" } as CSSProperties;
}

function TopoNodeViewComponent({ data }: NodeProps<Data>) {
  const {
    node,
    dim,
    isSelected,
    isRelated,
    hasIncoming,
    hasOutgoing,
    incomingHandleColor,
    outgoingHandleColor,
  } = data;
  const select = useStore((s) => s.select);
  const tone = getDomainTone(node.domainId);
  const accented = isSelected || isRelated;

  return (
    <div
      onClick={() => select(node.id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        select(node.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${KIND_LABEL[node.kind]}: ${node.title}`}
      className={cn(
        "group relative flex min-h-[76px] w-[216px] cursor-pointer flex-col rounded-[12px] border px-3 py-2.5 outline-none transition-all duration-150",
        "hover:-translate-y-px hover:shadow-[var(--shadow-2)]",
        dim && "opacity-30",
      )}
      style={{
        background: "color-mix(in srgb, var(--surface) 93%, transparent)",
        borderColor: accented ? tone.color : "var(--border)",
        boxShadow: isSelected
          ? `0 0 0 4px ${tone.tint}, var(--shadow-2)`
          : isRelated
            ? `0 0 0 2px ${tone.tint}, var(--shadow-1)`
            : "var(--shadow-1)",
        backdropFilter: "blur(8px) saturate(1.08)",
      }}
    >
      {hasIncoming && (
        <Handle
          type="target"
          position={Position.Left}
          className="graph-node-handle graph-node-handle-left"
          style={handleStyle(incomingHandleColor)}
        />
      )}

      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="inline-flex h-[20px] shrink-0 items-center rounded-[6px] border px-1.5 text-[9.5px] font-bold uppercase"
          style={{
            background: tone.tint,
            borderColor: tone.border,
            color: tone.color,
          }}
        >
          {kindAbbrev(node.kind)}
        </span>
        {node.number && (
          <span
            className="min-w-0 truncate font-mono text-[10.5px] font-semibold tabular-nums"
            style={{ color: tone.color }}
            title={node.id}
          >
            {node.number}
          </span>
        )}
      </div>

      <div
        className="mt-1.5 overflow-hidden text-[13px] font-semibold leading-[1.28]"
        style={{
          color: "var(--fg-1)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        <MathText text={node.title} />
      </div>

      <div className="mt-auto flex items-center gap-1.5 pt-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.color }} />
        <span className="min-w-0 truncate text-[10.5px] font-medium" style={{ color: "var(--fg-3)" }}>
          {node.topicCluster}
        </span>
      </div>

      {isSelected && (
        <span
          className="absolute -right-[6px] -top-[6px] h-3.5 w-3.5 rounded-full border-[2px]"
          style={{ background: tone.color, borderColor: "var(--surface)" }}
        />
      )}

      {hasOutgoing && (
        <Handle
          type="source"
          position={Position.Right}
          className="graph-node-handle graph-node-handle-right"
          style={handleStyle(outgoingHandleColor)}
        />
      )}
    </div>
  );
}

export const TopoNodeView = memo(TopoNodeViewComponent);
