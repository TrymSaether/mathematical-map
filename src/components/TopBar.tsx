import { Sigma, Command as CommandIcon, Compass, Moon, Palette, Sun } from "lucide-react";
import { useStore } from "../store";
import { COLOR_MODE_OPTIONS, THEME_OPTIONS, type ThemeId } from "../themes";

export function TopBar() {
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const view = useStore((s) => s.view);
  const themeId = useStore((s) => s.themeId);
  const setThemeId = useStore((s) => s.setThemeId);
  const colorMode = useStore((s) => s.colorMode);
  const toggleColorMode = useStore((s) => s.toggleColorMode);
  const isDark = colorMode === "dark";

  return (
    <header className="glass scanlines mx-auto mb-3 flex h-12 w-full items-center justify-between rounded-2xl px-4">
      <div className="flex items-center gap-3">
        <Sigma className="h-4 w-4 text-accent-cyan" />
        <div className="font-display text-[13px] tracking-widest text-white/80">
          TOPOLOGY · ATLAS <span className="text-white/40">— a map of concepts & their dependencies</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/50">
        <Compass className="h-3.5 w-3.5" />
        <span>Mode: <span className="text-white/90">{view}</span></span>
        <div className="theme-controls ml-2" aria-label="Theme controls">
          <label className="theme-control">
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            <select
              value={themeId}
              onChange={(event) => setThemeId(event.target.value as ThemeId)}
              aria-label="Choose map theme"
            >
              {THEME_OPTIONS.map((theme) => (
                <option key={theme.id} value={theme.id} title={theme.description}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="mode-toggle"
            onClick={toggleColorMode}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span>{COLOR_MODE_OPTIONS.find((mode) => mode.id === colorMode)?.label ?? "Light"}</span>
          </button>
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-1 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10"
        >
          <CommandIcon className="h-3 w-3" /> Search · <kbd className="font-mono">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
