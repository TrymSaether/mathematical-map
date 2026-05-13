export const MAPS = {
  functional_analysis: {
    id: "functional_analysis",
    label: "Functional Analysis",
    description: "Normed spaces, Banach spaces, Hilbert spaces, operators, and duality.",
  },
  topology: {
    id: "topology",
    label: "Topology",
    description: "Topological spaces, compactness, connectedness, and continuity.",
  },
} as const;

export type MapId = keyof typeof MAPS;
export const DEFAULT_MAP_ID: MapId = "functional_analysis";

export function isMapId(value: string | null): value is MapId {
  return value !== null && value in MAPS;
}
