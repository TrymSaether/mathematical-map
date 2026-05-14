import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "reactflow";
import { memo } from "react";
import type { GraphEdge as GraphEdgeT } from "../types";
import { getRelationStyle } from "../lib/relationStyle";

interface Data {
  edge: GraphEdgeT;
  dim?: boolean;
  highlight?: boolean;
  route?: boolean;
  routeNonce?: number;
}

function GraphEdgeViewComponent(props: EdgeProps<Data>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const e = data?.edge;
  const isRoute = Boolean(data?.route);
  const style = getRelationStyle(e?.relation ?? "relation", Boolean(data?.highlight) || isRoute, Boolean(data?.dim));

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        style={{
          stroke: isRoute ? "var(--primary)" : style.color,
          strokeWidth: isRoute ? 3 : style.width,
          strokeOpacity: isRoute ? 0.28 : style.opacity,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: isRoute ? undefined : style.dash,
          filter: data?.highlight || isRoute ? "var(--edge-highlight-shadow)" : undefined,
        }}
      />
      {isRoute && (
        <path
          key={`route-${props.id}-${data?.routeNonce ?? 0}`}
          className="ma-route-edge"
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={3.2}
          strokeLinecap="round"
          pathLength={1}
          style={{ ["--route-len" as string]: 1 }}
        />
      )}
      {data?.highlight && !isRoute && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
              pointerEvents: "none",
              color: style.color,
            }}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest shadow-[var(--shadow-soft)]"
          >
            {style.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const GraphEdgeView = memo(GraphEdgeViewComponent);
