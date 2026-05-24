import { BaseEdge, getBezierPath, type EdgeProps } from "reactflow";

interface Data {
  dim?: boolean;
  highlight?: boolean;
}

export function TopoEdgeView(props: EdgeProps<Data>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  const isHi = !!data?.highlight;
  const stroke = isHi ? "var(--accent)" : "var(--fg-4)";
  const width = isHi ? 2.2 : 1.2;
  const opacity = data?.dim ? 0.18 : 1;

  return (
    <>
      {/* halo for contrast on any backdrop */}
      <BaseEdge
        id={`${props.id}-halo`}
        path={path}
        style={{
          stroke: "var(--bg)",
          strokeWidth: width + 3.5,
          strokeOpacity: opacity * 0.9,
          fill: "none",
        }}
      />
      <BaseEdge
        id={props.id}
        path={path}
        style={{
          stroke,
          strokeWidth: width,
          strokeOpacity: opacity,
          fill: "none",
        }}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={isHi ? 2.6 : 1.8}
        fill={stroke}
        opacity={opacity}
      />
    </>
  );
}
