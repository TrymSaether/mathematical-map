import type { ReactNode } from "react";
import {
  CircleDot,
  IterationCw,
  MousePointer2,
  Redo2,
  Ruler,
  Spline,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { TOOL_META, type ToolId } from "./types";

/** Glyph for each tool, traced from components-sandbox-rail.html. */
const GLYPHS: Record<ToolId, ReactNode> = {
  select: <MousePointer2 className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  point: <CircleDot className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  basepoint: <Star className="h-5 w-5" fill="var(--gold)" stroke="var(--gold)" strokeWidth={1.7} />,
  openset: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="color-mix(in srgb, var(--purple) 18%, transparent)" stroke="var(--purple)" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  path: <Spline className="h-[22px] w-[22px]" strokeWidth={1.7} />,
  loop: <IterationCw className="h-5 w-5" strokeWidth={1.8} />,
  cover: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="9" r="5" />
      <circle cx="12" cy="14" r="5" />
    </svg>
  ),
  quotient: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="16" cy="8" r="1.4" />
      <circle cx="8" cy="16" r="1.4" />
      <circle cx="16" cy="16" r="1.4" />
    </svg>
  ),
  measure: <Ruler className="h-[18px] w-[18px]" strokeWidth={1.8} />,
};

export function ToolRail({
  active,
  setActive,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: {
  active: ToolId;
  setActive: (t: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div
      className="flex w-24 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r py-4"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      {TOOL_META.map((tool) => {
        const isActive = tool.id === active;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActive(tool.id)}
            className={cn(
              "flex w-[70px] flex-col items-center gap-1.5 rounded-lg py-2 transition-colors",
              !isActive && "hover:bg-[var(--surface)]",
            )}
            style={{ background: isActive ? "var(--surface-2)" : "transparent" }}
            aria-pressed={isActive}
            title={tool.label}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg border"
              style={{
                background: "var(--surface)",
                borderColor: isActive ? "var(--accent)" : "var(--border)",
                color: "var(--fg-1)",
                boxShadow: isActive
                  ? "0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)"
                  : "none",
              }}
            >
              {GLYPHS[tool.id]}
            </span>
            <span
              className="text-[9.5px] font-semibold uppercase tracking-label-tight"
              style={{ color: isActive ? "var(--fg-1)" : "var(--fg-3)" }}
            >
              {tool.label}
            </span>
          </button>
        );
      })}

      <span className="my-1.5 h-px w-8" style={{ background: "var(--border)" }} />

      <MicroButton label="Undo" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </MicroButton>
      <MicroButton label="Redo" onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </MicroButton>
      <MicroButton label="Clear" onClick={onClear} disabled={!canUndo}>
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </MicroButton>
    </div>
  );
}

function MicroButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface)] disabled:pointer-events-none disabled:opacity-40"
      style={{ color: "var(--fg-3)" }}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
