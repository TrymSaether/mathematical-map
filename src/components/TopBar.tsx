import { Moon, Palette, Search, Sun, TrainFront } from "lucide-react";
import { useStore } from "../store";
import { COLOR_MODE_OPTIONS, THEME_OPTIONS, type ColorMode, type ThemeId } from "../themes";

export function TopBar() {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const themeId = useStore((s) => s.themeId);
  const setThemeId = useStore((s) => s.setThemeId);
  const colorMode = useStore((s) => s.colorMode);
  const setColorMode = useStore((s) => s.setColorMode);
  const toggleColorMode = useStore((s) => s.toggleColorMode);
  const isDark = colorMode === "dark";

  return (
    <header className="topbar">
      <div className="brand-mark" aria-hidden="true">
        <TrainFront className="h-5 w-5" />
      </div>

      <div className="brand-copy">
        <div className="brand-title">Topology Map</div>
        <div className="brand-subtitle">Concepts &amp; Dependencies</div>
      </div>

      <label className="top-search">
        <Search className="h-4 w-4" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search concepts, theorems, definitions..."
          aria-label="Search concepts"
        />
        <button
          type="button"
          className="top-search-kbd"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette"
        >
          ⌘K
        </button>
      </label>

      <div className="theme-controls" aria-label="Theme controls">
        <label className="theme-control">
          <Palette className="h-4 w-4" aria-hidden="true" />
          <span>Theme</span>
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
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span>{COLOR_MODE_OPTIONS.find((mode) => mode.id === colorMode)?.label ?? "Light"}</span>
        </button>

        <select
          className="sr-only"
          value={colorMode}
          onChange={(event) => setColorMode(event.target.value as ColorMode)}
          aria-label="Choose color mode"
        >
          {COLOR_MODE_OPTIONS.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
