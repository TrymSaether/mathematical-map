import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "reactflow";
import { getRelationStyle } from "../lib/relationStyle";
import type { GraphEdge } from "../types";

interface Data {
  edge?: GraphEdge;
  dim?: boolean;
  highlight?: boolean;
}

/**
 * Each edge declares its own <marker> so the arrowhead inherits the edge color.
 * Marker ids are namespaced by edge id to avoid SVG id collisions.
 */
export function TopoEdgeView(props: EdgeProps<Data>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 14,
  });

  const style = getRelationStyle(data?.edge?.relation ?? "relation", Boolean(data?.highlight), Boolean(data?.dim));
  const highlight = Boolean(data?.highlight);
  const dim = Boolean(data?.dim);
  const markerId = `arrow-${props.id}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth={highlight ? 7 : 6}
          markerHeight={highlight ? 7 : 6}
          orient="auto-start-reverse"
        >
          <path
            d="M0,0 L10,5 L0,10 z"
            fill={style.color}
            opacity={style.opacity}
          />
        </marker>
      </defs>
      {highlight && (
        <path
          d={path}
          fill="none"
          stroke="var(--bg)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={style.width + 3.2}
          strokeOpacity={0.92}
        />
      )}
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={`url(#${markerId})`}
        style={{
          stroke: style.color,
          strokeWidth: style.width,
          strokeOpacity: style.opacity,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: style.dash,
          fill: "none",
        }}
      />
      {!dim && highlight && (
        <EdgeLabelRenderer>
          <div
            className="rounded-pill border px-2 py-0.5 text-[9px] font-bold uppercase shadow-[var(--shadow-1)]"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: style.color,
            }}
          >
            {style.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
