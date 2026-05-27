import dagre from "dagre";
import type { GraphData, GraphDomain, GraphEdge, GraphNode } from "../types";

export interface Position {
  x: number;
  y: number;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 84;
const RANK_SEP = 118;
const NODE_SEP = 54;
const CLUSTER_GAP = 220;
const JITTER = 8;

// Deterministic seeded PRNG (mulberry32).
function seeded(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function layoutDomain(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { positions: Map<string, Position>; width: number; height: number } {
  if (nodes.length === 0) {
    return { positions: new Map(), width: 0, height: 0 };
  }

  const g = new dagre.graphlib.Graph({ directed: true });
  g.setGraph({
    rankdir: "TB",
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    marginx: 32,
    marginy: 32,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (nodeIds.has(e.from) && nodeIds.has(e.to)) {
      g.setEdge(e.from, e.to);
    }
  }

  dagre.layout(g);

  const positions = new Map<string, Position>();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of nodeIds) {
    const { x, y } = g.node(id);
    positions.set(id, { x, y });
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return {
    positions,
    width: maxX - minX + NODE_WIDTH,
    height: maxY - minY + NODE_HEIGHT,
  };
}

// Place cluster centroids using a simple shelf-packing that grows roughly square.
function placeClusters(
  clusters: { id: string; width: number; height: number }[],
): Map<string, Position> {
  const sorted = [...clusters].sort((a, b) => b.height - a.height);
  const totalArea = sorted.reduce((a, c) => a + (c.width + CLUSTER_GAP) * (c.height + CLUSTER_GAP), 0);
  const targetRowWidth = Math.sqrt(totalArea) * 1.1;

  const result = new Map<string, Position>();
  let rowY = 0;
  let rowX = 0;
  let rowHeight = 0;

  for (const c of sorted) {
    if (rowX > 0 && rowX + c.width > targetRowWidth) {
      rowY += rowHeight + CLUSTER_GAP;
      rowX = 0;
      rowHeight = 0;
    }
    result.set(c.id, { x: rowX, y: rowY });
    rowX += c.width + CLUSTER_GAP;
    if (c.height > rowHeight) rowHeight = c.height;
  }
  return result;
}

export interface AtlasLayout {
  positions: Map<string, Position>;
  domainBounds: Map<string, DomainBounds>;
}

export interface DomainBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: "rect" | "circle";
}

export function computeAtlasLayout(data: GraphData): AtlasLayout {
  const nodesByDomain = new Map<string, GraphNode[]>();
  for (const n of data.nodes) {
    const list = nodesByDomain.get(n.domainId) ?? [];
    list.push(n);
    nodesByDomain.set(n.domainId, list);
  }

  const domainOrder = data.domains.map((d) => d.id);
  for (const id of nodesByDomain.keys()) {
    if (!domainOrder.includes(id)) domainOrder.push(id);
  }

  const domainLayouts = new Map<string, { positions: Map<string, Position>; width: number; height: number }>();
  for (const domainId of domainOrder) {
    const ns = nodesByDomain.get(domainId) ?? [];
    const ids = new Set(ns.map((n) => n.id));
    const es = data.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
    domainLayouts.set(domainId, layoutDomain(ns, es));
  }

  const centroids = placeClusters(
    domainOrder.map((id) => {
      const l = domainLayouts.get(id)!;
      return { id, width: l.width, height: l.height };
    }),
  );

  const positions = new Map<string, Position>();
  const domainBounds = new Map<string, DomainBounds>();

  for (const domainId of domainOrder) {
    const layout = domainLayouts.get(domainId)!;
    const centroid = centroids.get(domainId) ?? { x: 0, y: 0 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const id of layout.positions.keys()) {
      const p = layout.positions.get(id)!;
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    if (!Number.isFinite(minX)) {
      domainBounds.set(domainId, { x: centroid.x, y: centroid.y, width: 0, height: 0 });
      continue;
    }

    const dx = centroid.x - minX;
    const dy = centroid.y - minY;

    for (const [id, p] of layout.positions) {
      const rand = seeded(hashString(id));
      const jx = (rand() - 0.5) * 2 * JITTER;
      const jy = (rand() - 0.5) * 2 * JITTER;
      positions.set(id, { x: p.x + dx + jx, y: p.y + dy + jy });
    }

    domainBounds.set(domainId, {
      x: centroid.x - 24,
      y: centroid.y - 24,
      width: maxX - minX + NODE_WIDTH + 48,
      height: maxY - minY + NODE_HEIGHT + 48,
    });
  }

  return { positions, domainBounds };
}

export function computeClusterLayout(nodes: GraphNode[], domains: GraphDomain[]): AtlasLayout {
  const nodesByDomain = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    const list = nodesByDomain.get(node.domainId) ?? [];
    list.push(node);
    nodesByDomain.set(node.domainId, list);
  }

  const domainIds = domains
    .map((domain) => domain.id)
    .filter((id) => nodesByDomain.has(id));
  for (const id of nodesByDomain.keys()) {
    if (!domainIds.includes(id)) domainIds.push(id);
  }

  const positions = new Map<string, Position>();
  const domainBounds = new Map<string, DomainBounds>();
  if (domainIds.length === 0) return { positions, domainBounds };

  const domainCount = domainIds.length;
  const domainRing = domainCount === 1 ? 0 : Math.max(720, domainCount * 190);

  domainIds.forEach((domainId, domainIndex) => {
    const members = [...(nodesByDomain.get(domainId) ?? [])].sort(compareNodeOrder);
    const domainAngle = domainCount === 1
      ? 0
      : -Math.PI / 2 + (domainIndex / domainCount) * Math.PI * 2;
    const cx = Math.cos(domainAngle) * domainRing;
    const cy = Math.sin(domainAngle) * domainRing;
    const itemRing = Math.max(132, 88 + Math.sqrt(members.length) * 56);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    members.forEach((node, itemIndex) => {
      const rand = seeded(hashString(`${domainId}:${node.id}`));
      const angle = members.length === 1
        ? 0
        : -Math.PI / 2 + (itemIndex / members.length) * Math.PI * 2;
      const radius = members.length === 1
        ? 0
        : itemRing + (rand() - 0.5) * 24;
      const x = cx + Math.cos(angle) * radius - NODE_WIDTH / 2;
      const y = cy + Math.sin(angle) * radius - NODE_HEIGHT / 2;
      positions.set(node.id, { x, y });
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + NODE_WIDTH);
      maxY = Math.max(maxY, y + NODE_HEIGHT);
    });

    if (!Number.isFinite(minX)) return;

    const width = maxX - minX;
    const height = maxY - minY;
    const diameter = Math.max(width, height) + 112;
    domainBounds.set(domainId, {
      x: cx - diameter / 2,
      y: cy - diameter / 2,
      width: diameter,
      height: diameter,
      shape: "circle",
    });
  });

  return { positions, domainBounds };
}

function compareNodeOrder(a: GraphNode, b: GraphNode): number {
  const chapter = a.chapter.localeCompare(b.chapter);
  if (chapter !== 0) return chapter;
  const an = numberParts(a.number);
  const bn = numberParts(b.number);
  const length = Math.max(an.length, bn.length);
  for (let i = 0; i < length; i++) {
    const diff = (an[i] ?? 0) - (bn[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return a.title.localeCompare(b.title);
}

function numberParts(value: string): number[] {
  return value.split(".").map((part) => Number(part) || 0);
}

export const ATLAS_NODE_WIDTH = NODE_WIDTH;
export const ATLAS_NODE_HEIGHT = NODE_HEIGHT;
