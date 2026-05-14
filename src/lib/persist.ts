/** Per-map localStorage persistence for learning states, notes, and saved paths. */

function key(mapId: string, name: string): string {
  return `math-atlas:${mapId}:${name}`;
}

export function loadPerMap<T>(mapId: string, name: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key(mapId, name));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePerMap<T>(mapId: string, name: string, value: T): void {
  try {
    window.localStorage.setItem(key(mapId, name), JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}
