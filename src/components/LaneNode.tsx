import type { NodeProps } from "reactflow";

interface Data {
  topic: string;
  subtitle: string;
  width: number;
  height: number;
}

/** Metro-map domain region: pastel tint, dashed domain-color border, eyebrow label. */
export function LaneNode({ data }: NodeProps<Data>) {
  return (
    <div
      className="pointer-events-none select-none"
      style={{ width: data.width + 320, height: data.height + 40 }}
    >
      <div
        className="absolute inset-0 rounded-[20px] border-[1.5px] border-dashed"
        style={{
          background: "rgba(var(--primary-rgb),0.05)",
          borderColor: "rgba(var(--primary-rgb),0.35)",
        }}
      />
      <div
        className="absolute left-4 top-3 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em]"
        style={{ color: "rgba(var(--primary-rgb),0.85)" }}
      >
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "rgb(var(--primary-rgb))" }}
        />
        {data.topic}
        <span
          className="font-sans text-[10px] font-medium tracking-[0.04em] text-[var(--faint)]"
          style={{ textTransform: "none" }}
        >
          {data.subtitle}
        </span>
      </div>
    </div>
  );
}
