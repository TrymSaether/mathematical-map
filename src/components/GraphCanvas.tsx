import { useEffect, useMemo } from "react";
import ReactFlow, { useReactFlow, type Edge, type Node } from "reactflow";
import type { LoadedMap } from "../data";
import { ATLAS_NODE_HEIGHT, ATLAS_NODE_WIDTH, computeClusterLayout } from "../lib/atlasLayout";
import { getDomainTone } from "../lib/colors";
import { getRelationStyle } from "../lib/relationStyle";
import { useStore } from "../store";
import { DomainRegionNode } from "./DomainRegionNode";
import { Dock } from "./Dock";
import { MinimapCard } from "./MinimapCard";
import { TopoEdgeView } from "./TopoEdge";
import { TopoNodeView } from "./TopoNode";

const nodeTypes = { topo: TopoNodeView, domainRegion: DomainRegionNode };
const edgeTypes = { topo: TopoEdgeView };

function InnerGraph() {
  const mapId = useStore((s) => s.mapId);
  const map = useStore((s) => s.loadedMaps[mapId]);
  if (!map) return null;
  return <LoadedGraph map={map} key={mapId} />;
}

function LoadedGraph({ map }: { map: LoadedMap }) {
  const view = useStore((s) => s.view);
  const search = useStore((s) => s.search).toLowerCase().trim();
  const searchScope = useStore((s) => s.searchScope);
  const kinds = useStore((s) => s.kinds);
  const topics = useStore((s) => s.topics);
  const relations = useStore((s) => s.relations);
  const selectedId = useStore((s) => s.selectedId);
  const focusMode = useStore((s) => s.focusMode);
  const focusDepth = useStore((s) => s.focusDepth);
  const rf = useReactFlow();

  const { data } = map;

  const filteredNodes = useMemo(() => {
    return data.nodes.filter((node) => {
      if (!kinds.has(node.kind)) return false;
      if (topics.size && !topics.has(node.domainId)) return false;
      if (search) {
        const haystack =
          searchScope === "title"
            ? `${node.title} ${node.kind}`.toLowerCase()
            : `${node.title} ${node.kind} ${node.tags.join(" ")} ${node.formalStatement} ${node.originalText}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [data.nodes, kinds, topics, search, searchScope]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((node) => node.id)), [filteredNodes]);

  const filteredEdges = useMemo(
    () =>
      data.edges.filter(
        (edge) => relations.has(edge.relation) && visibleIds.has(edge.from) && visibleIds.has(edge.to),
      ),
    [data.edges, relations, visibleIds],
  );

  const activeLayout = useMemo(() => {
    if (view === "cluster") {
      return computeClusterLayout(filteredNodes, data.domains);
    }
    return { positions: map.positions, domainBounds: map.domainBounds };
  }, [data.domains, filteredNodes, map.domainBounds, map.positions, view]);

  const visibleDomainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of filteredNodes) {
      counts.set(node.domainId, (counts.get(node.domainId) ?? 0) + 1);
    }
    return counts;
  }, [filteredNodes]);

  const immediateRelatedIds = useMemo(() => {
    if (!selectedId || !visibleIds.has(selectedId)) return new Set<string>();
    const set = new Set<string>();
    for (const edge of filteredEdges) {
      if (edge.from === selectedId) set.add(edge.to);
      if (edge.to === selectedId) set.add(edge.from);
    }
    return set;
  }, [selectedId, visibleIds, filteredEdges]);

  const focusSet = useMemo(() => {
    if (!focusMode || !selectedId || !visibleIds.has(selectedId)) return null;

    const neighbors = new Map<string, Set<string>>();
    for (const edge of filteredEdges) {
      const fromSet = neighbors.get(edge.from) ?? new Set<string>();
      fromSet.add(edge.to);
      neighbors.set(edge.from, fromSet);

      const toSet = neighbors.get(edge.to) ?? new Set<string>();
      toSet.add(edge.from);
      neighbors.set(edge.to, toSet);
    }

    const seen = new Set<string>([selectedId]);
    let frontier = [selectedId];
    for (let depth = 0; depth < focusDepth; depth += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const neighbor of neighbors.get(id) ?? []) {
          if (seen.has(neighbor)) continue;
          seen.add(neighbor);
          next.push(neighbor);
        }
      }
      frontier = next;
    }
    return seen;
  }, [focusMode, selectedId, visibleIds, filteredEdges, focusDepth]);

  const contextIds = focusSet ?? immediateRelatedIds;

  const highlightedEdgeIds = useMemo(() => {
    if (!selectedId || !visibleIds.has(selectedId)) return new Set<string>();
    return new Set(
      filteredEdges
        .filter((edge) => edge.from === selectedId || edge.to === selectedId)
        .map((edge) => edge.id),
    );
  }, [selectedId, visibleIds, filteredEdges]);

  const nodeHandleState = useMemo(() => {
    const incoming = new Map<string, string>();
    const outgoing = new Map<string, string>();

    for (const edge of filteredEdges) {
      const color = getRelationStyle(edge.relation).color;
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, color);
      if (!incoming.has(edge.to)) incoming.set(edge.to, color);
    }

    return { incoming, outgoing };
  }, [filteredEdges]);

  const regionNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    for (const [domainId, bounds] of activeLayout.domainBounds) {
      const count = visibleDomainCounts.get(domainId) ?? 0;
      if (count === 0) continue;
      const tone = getDomainTone(domainId);
      const domain = map.domainById.get(domainId);
      nodes.push({
        id: `domain-region::${domainId}`,
        type: "domainRegion",
        position: { x: bounds.x, y: bounds.y },
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: -10,
        data: {
          label: domain?.label ?? domainId,
          count,
          width: bounds.width,
          height: bounds.height,
          color: tone.color,
          tint: tone.tint,
          border: tone.border,
          shape: bounds.shape ?? "rect",
        },
        style: {
          width: bounds.width,
          height: bounds.height,
          pointerEvents: "none",
        },
      });
    }
    return nodes;
  }, [activeLayout.domainBounds, visibleDomainCounts, map.domainById]);

  const conceptNodes: Node[] = useMemo(
    () =>
      filteredNodes.map((node) => {
        const position = activeLayout.positions.get(node.id) ?? { x: 0, y: 0 };
        const isSelected = node.id === selectedId;
        const isRelated = !isSelected && contextIds.has(node.id);
        const dim = selectedId !== null && visibleIds.has(selectedId) && !isSelected && !contextIds.has(node.id);
        return {
          id: node.id,
          type: "topo",
          position,
          draggable: false,
          data: {
            node,
            isSelected,
            isRelated,
            dim,
            hasIncoming: nodeHandleState.incoming.has(node.id),
            hasOutgoing: nodeHandleState.outgoing.has(node.id),
            incomingHandleColor: nodeHandleState.incoming.get(node.id),
            outgoingHandleColor: nodeHandleState.outgoing.get(node.id),
          },
        };
      }),
    [filteredNodes, activeLayout.positions, selectedId, contextIds, visibleIds, nodeHandleState],
  );

  const nodes = useMemo(() => [...regionNodes, ...conceptNodes], [regionNodes, conceptNodes]);

  const edges: Edge[] = useMemo(
    () =>
      filteredEdges.map((edge) => {
        const highlight = highlightedEdgeIds.has(edge.id);
        const inFocus = !focusSet || (focusSet.has(edge.from) && focusSet.has(edge.to));
        const dim = selectedId !== null && visibleIds.has(selectedId) && (focusSet ? !inFocus : !highlight);
        return {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          type: "topo",
          data: { edge, highlight, dim },
        };
      }),
    [filteredEdges, highlightedEdgeIds, focusSet, selectedId, visibleIds],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => rf.fitView({ padding: 0.18, duration: view === "cluster" ? 520 : 0 }), 40);
    return () => window.clearTimeout(timeout);
  }, [rf, map.data.id, view]);

  useEffect(() => {
    if (!selectedId) return;
    const position = activeLayout.positions.get(selectedId);
    if (!position) return;
    rf.setCenter(
      position.x + ATLAS_NODE_WIDTH / 2,
      position.y + ATLAS_NODE_HEIGHT / 2,
      { zoom: Math.max(0.9, rf.getZoom()), duration: 450 },
    );
  }, [selectedId, activeLayout.positions, rf]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={() => useStore.getState().select(null)}
        proOptions={{ hideAttribution: true }}
        minZoom={0.08}
        maxZoom={2.4}
        fitView
        panOnScroll
        selectionOnDrag={false}
        nodesDraggable={false}
        defaultEdgeOptions={{ type: "topo" }}
      />
      <MinimapCard nodes={conceptNodes} regions={activeLayout.domainBounds} selectedId={selectedId} />
      <Dock />
    </>
  );
}

export function GraphCanvas() {
  return <InnerGraph />;
}
