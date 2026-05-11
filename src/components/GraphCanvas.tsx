import { useMemo, useState, type CSSProperties } from "react";
import { Focus, Minus, Plus } from "lucide-react";
import {
  atlasNodes,
  atlasRoutes,
  activePathIds,
  NODE_KIND_META,
  ROUTE_META,
  type AtlasNode,
  type AtlasRoute,
} from "../atlas";
import { MathText } from "../lib/katex";
import { useStore } from "../store";

const CANVAS_W = 1120;
const CANVAS_H = 835;
const DEFAULT_ZOOM = 0.68;

const clusters = [
  { label: "Foundations", x: 124, y: 24, w: 850, h: 350 },
  { label: "Compactness", x: 108, y: 360, w: 610, h: 445 },
  { label: "Continuity", x: 646, y: 388, w: 292, h: 170 },
  { label: "Fixed Point Theory", x: 632, y: 490, w: 444, h: 320 },
  { label: "Examples", x: 112, y: 512, w: 250, h: 240 },
];

export function GraphCanvas() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const selectedId = useStore((s) => s.selectedId);
  const select = useStore((s) => s.select);
  const search = useStore((s) => s.search).trim().toLowerCase();

  const activeRouteIds = useMemo(() => new Set(atlasRoutes.filter((route) => route.active).map((route) => route.id)), []);

  const queryMatches = (node: AtlasNode) => {
    if (!search) return true;
    return `${node.id} ${node.title} ${node.kind} ${node.cluster}`.toLowerCase().includes(search);
  };

  return (
    <div className="graph-shell">
      <div className="graph-header">
        <div>
          <span>Dependency Atlas</span>
          <strong>D2 to T12</strong>
        </div>
        <p>Selected route: topological foundations through compactness to Brouwer.</p>
      </div>

      <div className="graph-scroll">
        <div
          className="graph-stage"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${zoom})`,
          }}
        >
          {clusters.map((cluster) => (
            <div
              key={cluster.label}
              className="cluster-band"
              style={{
                left: cluster.x,
                top: cluster.y,
                width: cluster.w,
                height: cluster.h,
              }}
            >
              <span>{cluster.label}</span>
            </div>
          ))}

          <svg className="route-layer" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} aria-hidden="true">
            <g className="routes-inactive">
              {atlasRoutes
                .filter((route) => !activeRouteIds.has(route.id))
                .map((route) => (
                  <RoutePath key={route.id} route={route} />
                ))}
            </g>
            <g className="routes-active">
              {atlasRoutes
                .filter((route) => activeRouteIds.has(route.id))
                .map((route) => (
                  <RoutePath key={route.id} route={route} active />
                ))}
            </g>
          </svg>

          {atlasNodes.map((node) => {
            const meta = NODE_KIND_META[node.kind];
            const selected = selectedId === node.id;
            const inActivePath = activePathIds.includes(node.id);
            const dim = !queryMatches(node);
            return (
              <button
                key={node.id}
                className={[
                  "atlas-node",
                  selected ? "selected" : "",
                  inActivePath ? "on-route" : "",
                  dim ? "search-dim" : "",
                ].join(" ")}
                style={{
                  left: node.x,
                  top: node.y,
                  borderColor: meta.color,
                  "--node-color": meta.color,
                } as CSSProperties}
                onClick={() => select(node.id)}
              >
                <span className="node-kicker">
                  <b>{idPrefix(node.id)}</b>
                  <em>{node.id}</em>
                </span>
                <span className="node-title">
                  <MathText text={node.title} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-tools">
        <MiniMap selectedId={selectedId ?? "T12"} />
        <div className="zoom-controls" aria-label="Zoom controls">
          <button onClick={() => setZoom((value) => Math.min(1.05, Number((value + 0.08).toFixed(2))))} aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom((value) => Math.max(0.52, Number((value - 0.08).toFixed(2))))} aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom(DEFAULT_ZOOM)} aria-label="Fit map">
            <Focus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoutePath({ route, active = false }: { route: AtlasRoute; active?: boolean }) {
  const meta = ROUTE_META[route.kind];
  return (
    <path
      d={route.path}
      className={`metro-route route-${route.kind} ${active ? "active" : ""}`}
      style={{ stroke: meta.color }}
    />
  );
}

function MiniMap({ selectedId }: { selectedId: string }) {
  return (
    <div className="mini-map" aria-label="Minimap">
      <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
        {atlasRoutes.map((route) => (
          <path
            key={route.id}
            d={route.path}
            className={`mini-route route-${route.kind} ${route.active ? "active" : ""}`}
            style={{ stroke: ROUTE_META[route.kind].color }}
          />
        ))}
        {atlasNodes.map((node) => (
          <rect
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.id === selectedId ? 178 : 160}
            height={node.id === selectedId ? 74 : 58}
            rx="5"
            className={node.id === selectedId ? "selected" : ""}
            fill={NODE_KIND_META[node.kind].color}
          />
        ))}
      </svg>
    </div>
  );
}

function idPrefix(id: string) {
  return id.replace(/[0-9]/g, "");
}
