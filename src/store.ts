import { create } from "zustand";
import { DEFAULT_MAP_ID, registeredMaps, type MapId } from "./data";
import type { NodeKind, Relation } from "./types";

export type ViewMode = "dependency" | "cluster";
export type HighlightMode = "immediate" | "full";
export type SearchScope = "all" | "title";

interface State {
  mapId: MapId;
  setMap: (mapId: MapId) => void;

  view: ViewMode;
  setView: (v: ViewMode) => void;

  search: string;
  setSearch: (s: string) => void;
  searchScope: SearchScope;
  setSearchScope: (s: SearchScope) => void;

  kinds: Set<NodeKind>;
  toggleKind: (k: NodeKind) => void;

  topics: Set<string>;
  toggleTopic: (t: string) => void;
  resetTopics: () => void;

  relations: Set<Relation>;
  toggleRelation: (r: Relation) => void;

  selectedId: string | null;
  select: (id: string | null) => void;

  highlight: HighlightMode;
  setHighlight: (h: HighlightMode) => void;

  showOrphans: boolean;
  setShowOrphans: (v: boolean) => void;

  paletteOpen: boolean;
  setPaletteOpen: (o: boolean) => void;

  pathTargetId: string | null;
  setPathTarget: (id: string | null) => void;

  panelCollapsed: boolean;
  setPanelCollapsed: (v: boolean) => void;
}

function toggle<T>(set: Set<T>, v: T) {
  const next = new Set(set);
  if (next.has(v)) next.delete(v); else next.add(v);
  return next;
}

const initialMap = registeredMaps[DEFAULT_MAP_ID];

export const useStore = create<State>((set) => ({
  mapId: DEFAULT_MAP_ID,
  setMap: (mapId) => {
    const map = registeredMaps[mapId];
    set({
      mapId,
      search: "",
      kinds: new Set(map.kinds),
      topics: new Set(),
      relations: new Set(map.relations),
      selectedId: null,
      pathTargetId: null,
    });
  },

  view: "dependency",
  setView: (v) => set({ view: v }),

  search: "",
  setSearch: (s) => set({ search: s }),
  searchScope: "all",
  setSearchScope: (s) => set({ searchScope: s }),

  kinds: new Set(initialMap.kinds),
  toggleKind: (k) => set((s) => ({ kinds: toggle(s.kinds, k) })),

  topics: new Set(),
  toggleTopic: (t) => set((s) => ({ topics: toggle(s.topics, t) })),
  resetTopics: () => set({ topics: new Set() }),

  relations: new Set(initialMap.relations),
  toggleRelation: (r) => set((s) => ({ relations: toggle(s.relations, r) })),

  selectedId: null,
  select: (id) => set({ selectedId: id }),

  highlight: "immediate",
  setHighlight: (h) => set({ highlight: h }),

  showOrphans: false,
  setShowOrphans: (v) => set({ showOrphans: v }),

  paletteOpen: false,
  setPaletteOpen: (o) => set({ paletteOpen: o }),

  pathTargetId: null,
  setPathTarget: (id) => set({ pathTargetId: id }),

  panelCollapsed: false,
  setPanelCollapsed: (v) => set({ panelCollapsed: v }),
}));
