import raw from "./data/topology.json";
import { TopoDataSchema, type TopoData } from "./types";

export const data: TopoData = TopoDataSchema.parse(raw);
export const nodeById = new Map(data.nodes.map((n) => [n.id, n]));
