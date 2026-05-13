import { Sigma, Command as CommandIcon, Compass } from "lucide-react";
import { useStore } from "../store";
import { MAPS, type MapId } from "../data";
import type { GraphData } from "../types";

export function TopBar({ map }: { map: GraphData }) {
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const view = useStore((s) => s.view);
  const mapId = useStore((s) => s.mapId);
  const setMapId = useStore((s) => s.setMapId);

  return (
    <header className="glass scanlines mx-auto mb-3 flex h-12 w-full items-center justify-between rounded-2xl px-4">
      <div className="flex items-center gap-3">
        <Sigma className="h-4 w-4 text-accent-cyan" />
        <div className="font-display text-[13px] tracking-widest text-white/80">
          MATHEMATICAL · MAP <span className="text-white/40">— {map.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/50">
        <select
          value={mapId}
          onChange={(event) => setMapId(event.target.value as MapId)}
          className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white/80 outline-none hover:bg-white/10 focus:border-accent-cyan/60"
          aria-label="Select mathematical map"
        >
          {Object.values(MAPS).map((entry) => (
            <option key={entry.id} value={entry.id} className="bg-ink-950 text-white">
              {entry.label}
            </option>
          ))}
        </select>
        <Compass className="h-3.5 w-3.5" />
        <span>Mode: <span className="text-white/90">{view}</span></span>
        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-3 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10"
        >
          <CommandIcon className="h-3 w-3" /> Search · <kbd className="font-mono">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
