import type { GraphEdge } from "../types";

/** Shortest route between two concepts over the undirected dependency graph. */
export function findRoute(fromId: string | null, toId: string | null, edges: GraphEdge[]): string[] | null {
  if (!fromId || !toId) return null;
  if (fromId === toId) return [fromId];

  const adj = new Map<string, string[]>();
  for (const e of edges) {
    (adj.get(e.from) ?? adj.set(e.from, []).get(e.from)!).push(e.to);
    (adj.get(e.to) ?? adj.set(e.to, []).get(e.to)!).push(e.from);
  }

  const prev = new Map<string, string | null>([[fromId, null]]);
  const queue: string[] = [fromId];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === toId) break;
    for (const next of adj.get(cur) ?? []) {
      if (!prev.has(next)) {
        prev.set(next, cur);
        queue.push(next);
      }
    }
  }

  if (!prev.has(toId)) return null;
  const path: string[] = [];
  let cursor: string | null = toId;
  while (cursor) {
    path.unshift(cursor);
    cursor = prev.get(cursor) ?? null;
  }
  return path;
}
