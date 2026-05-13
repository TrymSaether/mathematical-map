import { useEffect } from "react";
import { useStore } from "../store";
import { cmpNum } from "../lib/graph";
import type { GraphNode } from "../types";

/** Arrow keys navigate sequentially; Esc clears selection. */
export function useKeyboardNav(nodes: GraphNode[]) {
  useEffect(() => {
    const sorted = [...nodes].sort(cmpNum);
    const indexById = new Map(sorted.map((n, i) => [n.id, i]));
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const { selectedId, select } = useStore.getState();
      if (e.key === "Escape") { select(null); return; }
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "j", "k"].includes(e.key)) return;
      e.preventDefault();
      if (sorted.length === 0) return;
      const cur = selectedId ? indexById.get(selectedId) ?? -1 : -1;
      const delta = (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "j") ? 1 : -1;
      const next = (cur + delta + sorted.length) % sorted.length;
      select(sorted[next].id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nodes]);
}
