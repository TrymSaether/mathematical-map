import { Crosshair, Layers, LocateFixed, Network, ZoomIn, ZoomOut } from "lucide-react";
import type { ReactNode } from "react";
import { useReactFlow, useViewport } from "reactflow";
import { cn } from "../lib/utils";
import { useStore, type ViewMode } from "../store";

const VIEWS: { id: ViewMode; label: string; icon: typeof Network }[] = [
  { id: "dependency", label: "Dependency", icon: Network },
  { id: "cluster", label: "Cluster", icon: Layers },
];

export function Dock() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const focusMode = useStore((s) => s.focusMode);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);
  const focusDepth = useStore((s) => s.focusDepth);
  const setFocusDepth = useStore((s) => s.setFocusDepth);
  const rf = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-4 z-30 flex justify-center px-0 sm:px-3">
      <div
        className="dock-scrollbar pointer-events-auto flex h-10 max-w-full items-center gap-1 overflow-x-auto rounded-pill border p-1"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex shrink-0 items-center gap-1">
          {VIEWS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-ui-control font-medium transition-colors",
                  !active && "hover:bg-[var(--surface-3)]",
                )}
                style={{
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--fg-1)" : "var(--fg-2)",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                }}
                aria-label={`${label} view`}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <Divider />

        <button
          onClick={toggleFocusMode}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill border px-3 text-ui-control font-medium transition-colors hover:bg-[var(--surface-3)]"
          style={{
            background: focusMode ? "var(--surface-2)" : "transparent",
            color: focusMode ? "var(--fg-1)" : "var(--fg-2)",
            borderColor: focusMode ? "var(--border)" : "transparent",
          }}
          aria-pressed={focusMode}
          title="Focus on the selected neighborhood"
        >
          <Crosshair className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Focus</span>
          {focusMode && (
            <span
              className="absolute bottom-[3px] left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-pill"
              style={{ background: "var(--surface-2)" }}
            />
          )}
        </button>

        <div
          className={cn(
            "flex shrink-0 items-center gap-1 px-1 transition-opacity",
            !focusMode && "pointer-events-none opacity-45",
          )}
        >
          {[1, 2, 3].map((depth) => {
            const active = focusDepth === depth;
            const activeEnabled = focusMode && active;
            return (
              <button
                key={depth}
                onClick={() => setFocusDepth(depth)}
                className="h-7 w-7 rounded-pill border text-ui-xs font-semibold tabular-nums transition-all"
                style={{
                  background: activeEnabled ? "var(--surface-2)" : "transparent",
                  color: activeEnabled ? "var(--fg-1)" : "var(--fg-2)",
                  borderColor: activeEnabled ? "var(--border)" : "transparent",
                }}
                aria-label={`Focus depth ${depth}`}
                aria-pressed={active}
              >
                {depth}
              </button>
            );
          })}
        </div>

        <Divider />

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton label="Zoom out" onClick={() => rf.zoomOut({ duration: 180 })}>
            <ZoomOut className="h-4 w-4" />
          </IconButton>
          <span
            className="w-11 text-center font-mono text-ui-hint font-semibold tabular-nums"
            style={{ color: "var(--fg-2)" }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <IconButton label="Zoom in" onClick={() => rf.zoomIn({ duration: 180 })}>
            <ZoomIn className="h-4 w-4" />
          </IconButton>
          <IconButton label="Fit view" onClick={() => rf.fitView({ padding: 0.2, duration: 420 })}>
            <LocateFixed className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="h-6 w-px shrink-0" style={{ background: "var(--border)" }} />;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-[18px] transition-colors hover:bg-[var(--surface-3)]"
      style={{ color: "var(--fg-2)" }}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
