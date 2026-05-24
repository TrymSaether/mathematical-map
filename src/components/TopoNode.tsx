import { Handle, Position, type NodeProps } from "reactflow";
import { cn } from "../lib/utils";
import { getDomainTone } from "../lib/colors";
import { useStore } from "../store";
import { KIND_LABEL, type TopoNode as TopoNodeT } from "../types";

interface Data {
  node: TopoNodeT;
  dim?: boolean;
  isSelected?: boolean;
  isRelated?: boolean;
}

const KIND_BADGE: Record<string, string> = {
  definition: "D",
  theorem: "T",
  lemma: "L",
  proposition: "P",
  corollary: "C",
  example: "E",
  remark: "R",
  axiom: "A",
};

function kindLetter(kind: string): string {
  return KIND_BADGE[kind] ?? kind[0]?.toUpperCase() ?? "·";
}

export function TopoNodeView({ data }: NodeProps<Data>) {
  const { node, dim, isSelected, isRelated } = data;
  const select = useStore((s) => s.select);
  const tone = getDomainTone(node.domainId);

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
        "group relative flex w-[220px] cursor-pointer flex-col gap-1 rounded-[10px] px-3 py-2.5 outline-none transition-all duration-150",
        "hover:-translate-y-px",
        dim && "opacity-25",
      )}
      style={{
        background: "var(--surface)",
        border: `1.4px solid ${isSelected || isRelated ? tone.color : "var(--border)"}`,
        boxShadow: isSelected
          ? `0 0 0 3px ${tone.tint}, var(--shadow-2)`
          : isRelated
            ? "var(--shadow-2)"
            : "var(--shadow-1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] px-1 font-sans text-[10px] font-bold leading-none"
          style={{ background: tone.color, color: "var(--fg-on-color)" }}
        >
          {kindLetter(node.kind)}
        </span>
        <span
          className="truncate font-mono text-[10.5px] font-semibold tracking-[0.02em]"
          style={{ color: tone.color }}
          title={node.id}
        >
          {shortId(node.id)}
        </span>
      </div>
      <div
        className="truncate text-[12.5px] font-medium leading-snug"
        style={{ color: "var(--fg-1)" }}
      >
        {node.title}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

function shortId(id: string): string {
  if (id.length <= 14) return id;
  return id.slice(0, 12) + "…";
}
