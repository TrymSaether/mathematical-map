import { useEffect, useMemo, useRef } from "react";
import ReactFlow, { useReactFlow, useViewport, type Edge, type Node } from "reactflow";
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

interface NodeData {
  node: import("../types").TopoNode;
  isSelected: boolean;
  isRelated: boolean;
  dim: boolean;
  hasIncoming: boolean;
  hasOutgoing: boolean;
  incomingHandleColor: string | undefined;
  outgoingHandleColor: string | undefined;
}

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
  const { zoom } = useViewport();
  // Hide non-highlighted edges only at extreme zoom-out where they become noise.
  const edgeLODHidden = zoom < 0.18;

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
      return computeClusterLayout(filteredNodes, data.domains, map.degreeByNodeId);
    }
    return { positions: map.positions, domainBounds: map.domainBounds };
  }, [data.domains, filteredNodes, map.degreeByNodeId, map.domainBounds, map.positions, view]);

  const visibleDomainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of filteredNodes) {
      counts.set(node.domainId, (counts.get(node.domainId) ?? 0) + 1);
    }
    return counts;
  }, [filteredNodes]);

  // Adjacency over the *filtered* edge set. Cheap derived from the cached
  // global adjacency but limited to visible nodes/relations.
  const filteredAdjacency = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    const link = (a: string, b: string) => {
      const set = adj.get(a) ?? new Set<string>();
      set.add(b);
      adj.set(a, set);
    };
    for (const edge of filteredEdges) {
      link(edge.from, edge.to);
      link(edge.to, edge.from);
    }
    return adj;
  }, [filteredEdges]);

  const immediateRelatedIds = useMemo(() => {
    if (!selectedId || !visibleIds.has(selectedId)) return new Set<string>();
    return new Set(filteredAdjacency.get(selectedId) ?? []);
  }, [selectedId, visibleIds, filteredAdjacency]);

  const focusSet = useMemo(() => {
    if (!focusMode || !selectedId || !visibleIds.has(selectedId)) return null;
    const seen = new Set<string>([selectedId]);
    let frontier = [selectedId];
    for (let depth = 0; depth < focusDepth; depth += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const neighbor of filteredAdjacency.get(id) ?? []) {
          if (seen.has(neighbor)) continue;
          seen.add(neighbor);
          next.push(neighbor);
        }
      }
      frontier = next;
    }
    return seen;
  }, [focusMode, selectedId, visibleIds, filteredAdjacency, focusDepth]);

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

  // Stable per-node data refs: only allocate a new data object when something
  // material changed for that specific node. Keeps React Flow's per-node memo
  // intact so selection changes don't re-render every node.
  const dataCacheRef = useRef(new Map<string, NodeData>());
  const conceptNodes: Node[] = useMemo(() => {
    const prevCache = dataCacheRef.current;
    const nextCache = new Map<string, NodeData>();
    const selectionActive = selectedId !== null && visibleIds.has(selectedId);

    const result = filteredNodes.map((node) => {
      const position = activeLayout.positions.get(node.id) ?? { x: 0, y: 0 };
      const isSelected = node.id === selectedId;
      const isRelated = !isSelected && contextIds.has(node.id);
      const dim = selectionActive && !isSelected && !contextIds.has(node.id);
      const hasIncoming = nodeHandleState.incoming.has(node.id);
      const hasOutgoing = nodeHandleState.outgoing.has(node.id);
      const incomingHandleColor = nodeHandleState.incoming.get(node.id);
      const outgoingHandleColor = nodeHandleState.outgoing.get(node.id);

      const prev = prevCache.get(node.id);
      const reuse =
        prev &&
        prev.node === node &&
        prev.isSelected === isSelected &&
        prev.isRelated === isRelated &&
        prev.dim === dim &&
        prev.hasIncoming === hasIncoming &&
        prev.hasOutgoing === hasOutgoing &&
        prev.incomingHandleColor === incomingHandleColor &&
        prev.outgoingHandleColor === outgoingHandleColor;

      const data: NodeData = reuse
        ? prev!
        : {
            node,
            isSelected,
            isRelated,
            dim,
            hasIncoming,
            hasOutgoing,
            incomingHandleColor,
            outgoingHandleColor,
          };
      nextCache.set(node.id, data);

      return {
        id: node.id,
        type: "topo",
        position,
        draggable: false,
        data,
      };
    });

    dataCacheRef.current = nextCache;
    return result;
  }, [filteredNodes, activeLayout.positions, selectedId, contextIds, visibleIds, nodeHandleState]);

  const nodes = useMemo(() => [...regionNodes, ...conceptNodes], [regionNodes, conceptNodes]);

  const edges: Edge[] = useMemo(() => {
    const out: Edge[] = [];
    for (const edge of filteredEdges) {
      const highlight = highlightedEdgeIds.has(edge.id);
      const inFocus = !focusSet || (focusSet.has(edge.from) && focusSet.has(edge.to));
      const dim = selectedId !== null && visibleIds.has(selectedId) && (focusSet ? !inFocus : !highlight);
      // Low zoom: only keep edges incident to the selection (or whole focus set).
      if (edgeLODHidden && !highlight && !(focusSet && inFocus)) continue;
      out.push({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: "topo",
        data: { edge, highlight, dim },
      });
    }
    return out;
  }, [filteredEdges, highlightedEdgeIds, focusSet, selectedId, visibleIds, edgeLODHidden]);

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
