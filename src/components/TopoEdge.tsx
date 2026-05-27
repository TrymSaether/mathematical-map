import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "reactflow";
import { getRelationStyle } from "../lib/relationStyle";
import type { GraphEdge } from "../types";

interface Data {
  edge?: GraphEdge;
  dim?: boolean;
  highlight?: boolean;
}

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
  const dim = Boolean(data?.dim);

  return (
    <>
      {!dim && (
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
      <circle
        cx={targetX}
        cy={targetY}
        r={data?.highlight ? 3.2 : 2.1}
        fill={style.color}
        opacity={style.opacity}
      />
      {data?.highlight && (
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
