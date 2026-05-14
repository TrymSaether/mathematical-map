import { useReactFlow, useViewport } from "reactflow";
import { Layers, Network, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useStore } from "../store";

/** Floating control dock — view mode, focus + depth, zoom. Lives inside the canvas. */
export function Dock() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const focusMode = useStore((s) => s.focusMode);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);
  const focusDepth = useStore((s) => s.focusDepth);
  const setFocusDepth = useStore((s) => s.setFocusDepth);

  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-3)]">
      {/* View segmented */}
      <div className="flex gap-0.5 rounded-[10px] bg-[var(--surface-muted)] p-0.5">
        {([
          ["dependency", "Dependency", Network],
          ["cluster", "Cluster", Layers],
        ] as const).map(([id, label, Icon]) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] transition",
                active
                  ? "bg-[var(--surface)] font-semibold text-[var(--text)] shadow-[var(--shadow-1)]"
                  : "font-medium text-[var(--muted)] hover:text-[var(--text-soft)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="h-6 w-px bg-[var(--border)]" />

      {/* Focus toggle */}
      <button
        onClick={toggleFocusMode}
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-[8px] border px-3 text-[13px] font-semibold transition",
          focusMode
            ? "border-[var(--blue-200)] bg-[var(--blue-50)] text-[var(--primary)]"
            : "border-transparent text-[var(--text-soft)] hover:bg-[var(--surface-muted)]"
        )}
        title="Focus mode dims unrelated concepts so you can follow a single dependency chain."
      >
        <Crosshair className="h-3.5 w-3.5" />
        Focus
      </button>

      {/* Depth */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-1 transition",
          focusMode ? "opacity-100" : "pointer-events-none opacity-40"
        )}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Depth</span>
        {[1, 2, 3].map((d) => (
          <button
            key={d}
            onClick={() => setFocusDepth(d)}
            className={cn(
              "h-[26px] w-[26px] rounded-[6px] border text-[12px] font-semibold tabular-nums transition",
              focusDepth === d
                ? "border-[var(--primary)] bg-[var(--blue-50)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] hover:border-[var(--border-strong)]"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-[var(--border)]" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => zoomOut()}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-soft)] transition hover:bg-[var(--surface-muted)]"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-11 text-center text-[12px] tabular-nums text-[var(--text-soft)]">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => zoomIn()}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-soft)] transition hover:bg-[var(--surface-muted)]"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
