import { loadRegisteredMaps } from "./data/loadMap";
import { DEFAULT_MAP_ID, type MapId } from "./data/mapRegistry";

export const registeredMaps = loadRegisteredMaps();
export const defaultMap = registeredMaps[DEFAULT_MAP_ID];

export function getLoadedMap(mapId: MapId) {
  return registeredMaps[mapId];
}

export { loadMap, loadRegisteredMaps, type LoadedMap } from "./data/loadMap";
export { MAPS, DEFAULT_MAP_ID, isMapId, type MapId } from "./data/mapRegistry";
